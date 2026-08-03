from pydantic import BaseModel, EmailStr
from typing import Optional, List,Any

class RegisterUser(BaseModel):
    name: str
    email:EmailStr
    password: str
    github_username: str |None = None

class RepositoryRequest(BaseModel):
    repo_id:        int
    repo_url:       str
    owner:          str
    repo_name:      str
    description:    Optional[str] = None
    stars:          Optional[int] = 0
    forks:          Optional[int] = 0
    visibility:     Optional[str] = "public"
    default_branch: Optional[str] = "main"
    last_commit:    Optional[str] = None
    language:       Optional[str] = None

class ExternalRepoRequest(BaseModel):
    url: str

class UserMsgPayload(BaseModel):
    id: Optional[str] = None
    role: Optional[str] = "user"
    time: Optional[str] = None
    content: str
    repos: Optional[List[Any]] = []

class SearchRequest(BaseModel):
    userMsg: UserMsgPayload
    session_id: Optional[str] = None