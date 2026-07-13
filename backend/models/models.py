import sqlalchemy as db
from datetime import datetime
from sqlalchemy import DateTime,String, Boolean, ForeignKey
from sqlalchemy.orm import DeclarativeBase, sessionmaker,Mapped, mapped_column
from db.config import Base

class User(Base):
    __tablename__= "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] 
    email: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False) 
    github_username: Mapped[str | None] = mapped_column(String(255)) 
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)


class Repository(Base):
    __tablename__= "repository"

    id:Mapped[int] = mapped_column(primary_key=True)
    user_id:Mapped[int] = mapped_column(ForeignKey("users.id"))
    github_url: Mapped[str] = mapped_column(String(255))
    owner: Mapped[str | None] 
    repo_name: Mapped[str] = mapped_column(String(255), nullable=False)
    default_branch: Mapped[str]= mapped_column(default="main")
    last_commit: Mapped[datetime] = mapped_column(nullable=True)
    total_files: Mapped[int] 
    indexed_at: Mapped[int]
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

class File(Base):
    __tablename__ = "files"

    id:Mapped[int] = mapped_column(primary_key=True)
    repo_id:Mapped[int] = mapped_column(ForeignKey("repository.id"))
    file_name:Mapped[str]
    path:Mapped[str]= mapped_column(nullable=False)
    language:Mapped[str | None]
    size: Mapped[str | None]
    last_modified: Mapped[datetime] = mapped_column(default=datetime.utcnow)