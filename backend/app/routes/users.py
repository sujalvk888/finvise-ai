from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserOut, UserUpdate
from app.auth.deps import get_current_user
from app.database.database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/me", response_model=UserOut)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.patch("/me", response_model=UserOut)
def update_users_me(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.name is not None:
        current_user.name = user_in.name
    db.commit()
    db.refresh(current_user)
    return current_user
