from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from datetime import timedelta

from app.database.database import get_db
from app.models.user import create_user_doc, user_doc_to_dict
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
def register(user: UserCreate, db: Database = Depends(get_db)):
    existing_user = db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password)
    new_user_doc = create_user_doc(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password,
        auth_provider="local"
    )
    result = db.users.insert_one(new_user_doc)
    new_user_doc["_id"] = result.inserted_id
    return user_doc_to_dict(new_user_doc)


@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Database = Depends(get_db)):
    db_user = db.users.find_one({"email": user.email})
    if not db_user or db_user.get("auth_provider") != "local":
        raise HTTPException(status_code=401, detail="Invalid email or password")

    hashed_password = db_user.get("hashed_password")
    if not hashed_password or not verify_password(user.password, hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": db_user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
def google_auth(auth: UserGoogleAuth, db: Database = Depends(get_db)):
    idinfo = verify_google_token(auth.credential)
    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    name = idinfo.get("name", "Google User")

    db_user = db.users.find_one({"email": email})
    if not db_user:
        new_user_doc = create_user_doc(
            email=email,
            name=name,
            auth_provider="google"
        )
        db.users.insert_one(new_user_doc)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
