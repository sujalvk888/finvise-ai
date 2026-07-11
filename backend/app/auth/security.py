from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretjwtkey_replace_me_in_production")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_google_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)
        return idinfo
    except ValueError:
        return None
