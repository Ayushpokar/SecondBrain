from fastapi import FastAPI, Depends, APIRouter, middleware
import requests
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from db.config import Base, engine, client
import httpx
from db.session import get_db
import os
import models.models 
from models.models import User
from api.auth import register
from schema import RegisterUser, RepositoryRequest
from services.github_fetcher import fetcher, get_file_tree, get_file_content
import asyncio
from services.chunker import chunker
from services.vector_store import store_chuncks
from services.rag import search, ask_llm
from security import create_access_token,get_current_user
from datetime import datetime, timezone
app = FastAPI()

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
# print(GITHUB_CLIENT_SECRET)
# Base.metadata.create_all(bind=engine)


@app.get("/")
def hello():
    return "Hello World"

@app.get("/api/me")
def me(current_user:User = Depends(get_current_user)):
    return {
        "user": current_user.github_username
    }



@app.get('/auth/login/github')
def github_login():
    redirect_url = (
         "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        "&scope=repo read:user"
    )

    return RedirectResponse(url=redirect_url)


@app.get('/auth/github/callback')
async def github_callback(
    code:str | None = None,
    error: str | None = None, 
    db:Session = Depends(get_db)):  
    if error:
        return RedirectResponse(
        "http://localhost:5173/login?error=access_denied"

        )
    try:

        async with httpx.AsyncClient() as client:
            response = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            }
        )
        token_data = response.json()
        print(token_data)
        access_token = token_data["access_token"]

        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                },
                params = {
                    "visibility": "all",
                    "affiliation": "owner",
                    "per_page": 100,
                }
            )
            user = response.json()

            repos = await client.get(
                "https://api.github.com/user/repos",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                }
            )
            repos = repos.json()

            db_user = db.query(User).filter(
                User.github_id == user['id']
            ).first()

            if db_user:
                db_user.last_login_at = datetime.now(timezone.utc)
                db_user.access_token = access_token
                db_user.avatar_url = user['avatar_url']
                db_user.name = user.get('name')
                db_user.email = user.get('email')
                db_user.github_username = user['login']
            
                current_user = db_user

            else:
                current_user = User(
                    name=user.get('name'),
                    github_username=user['login'],
                    github_id=user['id'],
                    email=user.get('email'),
                    auth_provider="github",
                    avatar_url=user['avatar_url'],
                    access_token=access_token,
                    is_verified=True, 
                )
                db.add(current_user)
            db.commit()
            db.refresh(current_user)
            user_id = current_user.id
            
            jwt_token = create_access_token({"id": user_id})
            
            response = RedirectResponse("http://localhost:5173")
            response.set_cookie(
                key="access_token",
                value=jwt_token,
                httponly=True,
                secure=False,      # True in production with HTTPS
                samesite="lax",
            )
            return response
    except Exception:
        return RedirectResponse(
            "http://localhost:5173/login?error=github_login_failed"

        )


@app.post("/register")
def registerUser(user:RegisterUser, db:Session = Depends(get_db)):
    return register(user, db)


@app.get('/api/repos')
def repoList():
    return


@app.post("/fetch-repo")
async def fetchrepo(detail:RepositoryRequest):
    all_chunks = []
    file_summary = []
    details = await fetcher(detail)
    files = await get_file_tree(detail, details["default_branch"])
    tasks = [get_file_content(file) for file in files]
    results = await asyncio.gather(*tasks)

    for result in results:
        if result is None:
            continue
        chunks = chunker(result)
        all_chunks.extend(chunks)
        file_summary.append({
            "file":         result['path'],
            "language":     result['language'],
            "total_chunks": len(chunks)
        })
    #store at once batch chunking
    store_chuncks(all_chunks)
    # file_content = await 


    return {
        "repo": details['name'],
        "total_files": len(file_summary),
        "total_chunks": len(all_chunks),
        "files": file_summary
    }


@app.post('/search')
def user_query(query:str):
    result = ask_llm(query)

    return result


def reset_chromadb():
    client.delete_collection("second_brain")
    client.create_collection("second_brain")
    print("Collection reset ✅")


    

