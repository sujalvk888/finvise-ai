from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserGoogleAuth(BaseModel):
    credential: str # Google ID token

class UserOut(UserBase):
    id: int
    auth_provider: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
