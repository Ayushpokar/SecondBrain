import bcrypt
from jose import jwt, JWTError
from datetime import timedelta, timezone, datetime
from fastapi import Cookie, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from models.models import User

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password=password.encode(), salt=bcrypt.gensalt())
    return hashed.decode()

SECRET_KEY="adadwfwvbbenl"
ACCESS_TOKEN_EXPIRE_DAYS=1
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        days=ACCESS_TOKEN_EXPIRE_DAYS
    )

    to_encode.update({"exp":expire})
    
    encode_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encode_jwt


def get_current_user(
    access_token: str | None= Cookie(default=None),
    db: Session = Depends(get_db)
):
    if not access_token:
        raise HTTPException(status_code=401,detail="Not authenticated")

    try:
        payload = jwt.decode(
            access_token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload['id']

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid Token")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user