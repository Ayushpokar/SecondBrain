from schema import RegisterUser

from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException
from models.models import User
import security as s

def register(user: RegisterUser, db:Session):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registerd"
        )

    new_user = User(
        name= user.name,
        email= user.email,
        password_hash = s.hash_password(user.password),
        github_username = user.github_username
    )

    db.add(new_user)
    db.commit()
    db.refresh()

    return {
        "status" : "success",
        "message":" User is created",
        "id": new_user.id
    }
