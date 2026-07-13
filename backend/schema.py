from pydantic import BaseModel, EmailStr

class RegisterUser(BaseModel):
    name: str
    email:EmailStr
    password: str
    github_username: str |None = None

class RepositoryRequest(BaseModel):
    owner:str
    repo_name:str