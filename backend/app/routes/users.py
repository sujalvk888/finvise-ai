from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.database import Database
from datetime import datetime, timezone
from app.schemas.user import UserOut, UserUpdate
from app.auth.deps import get_current_user
from app.database.database import get_db
from app.models.user import user_doc_to_dict

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me", response_model=UserOut)
def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_users_me(
    user_in: UserUpdate,
    db: Database = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    update_data = {}
    if user_in.name is not None:
        update_data["name"] = user_in.name

    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        db.users.update_one(
            {"email": current_user["email"]},
            {"$set": update_data}
        )

    updated_doc = db.users.find_one({"email": current_user["email"]})
    if not updated_doc:
        raise HTTPException(status_code=404, detail="User not found")

    return user_doc_to_dict(updated_doc)
