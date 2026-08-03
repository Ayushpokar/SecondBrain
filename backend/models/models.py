import uuid
import sqlalchemy as db
from datetime import datetime, timezone
from sqlalchemy import DateTime,String, Boolean, ForeignKey, Text
from sqlalchemy.orm import DeclarativeBase, sessionmaker,Mapped, mapped_column, relationship
from db.config import Base
from sqlalchemy.sql import func
from typing import List

class User(Base):
    __tablename__= "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] 
    email: Mapped[str | None] = mapped_column(String(255),unique=True, nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    auth_provider: Mapped[str] = mapped_column(String(255),default="github")
    github_id: Mapped[int] = mapped_column(unique=True, index=True) 
    github_username: Mapped[str | None] = mapped_column(String(255)) 
    avatar_url: Mapped[str | None] = mapped_column(String(255))
    access_token: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column( DateTime(timezone=True),
                                                default=lambda: datetime.now(timezone.utc),)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True),
                                                            nullable=True,)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True),
                                                        default=lambda: datetime.now(timezone.utc),
                                                        onupdate=lambda: datetime.now(timezone.utc),) 
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True)
    repositories = relationship(
        "Repository",
        back_populates="user",
    )
    sessions: Mapped[List["ChatSession"]] = relationship(
        "ChatSession", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )


class Repository(Base):
    __tablename__ = "repositories"

    id:             Mapped[int]           = mapped_column(primary_key=True)
    user_id:        Mapped[int]           = mapped_column(ForeignKey("users.id"))
    github_repo_id: Mapped[int]
    github_url:     Mapped[str]           = mapped_column(String(255))
    owner:          Mapped[str | None]
    repo_name:      Mapped[str]           = mapped_column(String(255), nullable=False)
    description:    Mapped[str | None]
    stars:          Mapped[int]           = mapped_column(default=0)
    forks:          Mapped[int]           = mapped_column(default=0)
    visibility:     Mapped[str]
    default_branch: Mapped[str]           = mapped_column(default="main")
    last_commit:    Mapped[str | None]    = mapped_column(nullable=True)  # ← str not datetime
    total_files:    Mapped[int]           = mapped_column(default=0)      # ← add default
    language:       Mapped[str | None]    = mapped_column(String(100), nullable=True)
    indexed_at:     Mapped[datetime|None] = mapped_column(DateTime, nullable=True)
    created_at:     Mapped[datetime]      = mapped_column(DateTime, default=datetime.utcnow)

    user  = relationship("User",  back_populates="repositories")
    files = relationship("File",  back_populates="repository", cascade="all, delete-orphan")

class File(Base):
    __tablename__ = "files"

    id:Mapped[int] = mapped_column(primary_key=True)
    repo_id:Mapped[int] = mapped_column(ForeignKey("repositories.id"))
    file_name:Mapped[str]
    path:Mapped[str]= mapped_column(nullable=False)
    language:Mapped[str | None]
    size: Mapped[int | None]
    last_modified: Mapped[datetime |  None] = mapped_column(DateTime,nullable=True)
    repository = relationship(
        "Repository",
        back_populates="files",
    )

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id: Mapped[int] = mapped_column(String(36),primary_key=True,default=lambda: str(uuid.uuid4()))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String, default="New Chat")
    
    # Using func.now() is the best practice for DB-side timestamps in SQLAlchemy 2.0
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")
    messages: Mapped[List["ChatMessage"]] = relationship(
        back_populates="session", 
        cascade="all, delete-orphan"
    )

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("chat_sessions.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String)  # 'user' or 'assistant'
    content: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())
    
    # Relationships
    session: Mapped["ChatSession"] = relationship(back_populates="messages")