from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta

from app.database.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserGoogleAuth, UserOut
from app.schemas.token import Token
from app.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    verify_google_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        auth_provider="local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or db_user.auth_provider != "local":
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=Token)
def google_auth(auth: UserGoogleAuth, db: Session = Depends(get_db)):
    idinfo = verify_google_token(auth.credential)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    email = idinfo.get("email")
    name = idinfo.get("name")
    
    db_user = db.query(User).filter(User.email == email).first()
    if not db_user:
        db_user = User(
            email=email,
            name=name,
            auth_provider="google"
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    elif db_user.auth_provider != "google":
        # Usually it's okay to link accounts, or we might reject.
        # Let's link them by updating the provider if needed or just allow it.
        pass
        
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
