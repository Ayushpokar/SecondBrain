from fastapi import FastAPI, Depends, APIRouter, middleware,HTTPException
import requests,re
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from db.config import Base, engine, client
import httpx
from db.session import get_db
import os
from models.models import User, Repository, File,ChatMessage, ChatSession
from api.auth import register
from schema import RegisterUser, RepositoryRequest, ExternalRepoRequest, SearchRequest
from services.github_fetcher import fetcher, get_file_tree, get_file_content
import asyncio
from services.chunker import chunker
from services.repo_store import save_repo,save_file, repo_exists
from services.vector_store import store_chuncks
from services.rag import search, ask_llm,generate_chat_title
from security import create_access_token,get_current_user
from datetime import datetime, timezone
from fastapi.middleware.cors import CORSMiddleware
from middleware.auth_middleware import AuthMiddleware
app = FastAPI()

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
# print(GITHUB_CLIENT_SECRET)
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(AuthMiddleware)

@app.get("/")
def hello():
    return "Hello World"

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


@app.get("/api/me")
def me(current_user:User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email":current_user.email,
        "avatar_url":current_user.avatar_url,
        "github_username": current_user.github_username,
    }

@app.post("/api/auth/logout")
def logout():
    response.delete_cookie
    return 

@app.post("/register")
def registerUser(user:RegisterUser, db:Session = Depends(get_db)):
    return register(user, db)


@app.get('/api/github/repos')
def repoList(current_user: User = Depends(get_current_user)):
    headers = {
        "Authorization":f"Bearer {current_user.access_token}",
        "Accept": "application/vnd.github+json",
    }
    response = requests.get(
        "https://api.github.com/user/repos",
        headers=headers,
        params={
            "per_page": 100,
            "sort": "updated",
        },
    )
    return response.json()


@app.post('/api/fetch-external-repo')
async def fetch_external_repo(body: ExternalRepoRequest,current_user:User = Depends(get_current_user),db:Session = Depends(get_db)):
   
    match = re.search(r"github\.com/([^/]+)/([^/\s]+)", body.url)
    
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub URL")
    
    owner = match.group(1)
    # Remove .git from the end just in case the user pasted a clone link
    repo_name = match.group(2).replace(".git", "") 
    repo_url = f"https://api.github.com/repos/{owner}/{repo_name}"
    print("repo:",repo_url)
    exists = repo_exists(repo_url)
    if exists:
        return {"message": "Repo already indexed", "status": "exists"}
    
    details = await fetcher(repo_url)
    print(details['url'],details['owner']['login'])
    repo_details_dict = {
        "repo_id": details['id'],
        "repo_url":details['url'],
        "owner":details['owner']['login'],
        "repo_name":details['name'],
        'description':    details['description'],
        "stars":          details['stargazers_count'],
        "forks":          details['forks_count'],
        "visibility":     details['visibility'],
        "default_branch": details['default_branch'],
        "last_commit":    details['updated_at'],
        "language":       details['language'],
    }

    # #save the repo details here
    repo_details = RepositoryRequest(**repo_details_dict)

    files = await get_file_tree(repo_details, details["default_branch"])
    repo_id = save_repo(repo_detail=repo_details, current_user=current_user)

    # tasks = [get_file_content(file) for file in files]
    results = await asyncio.gather(*tasks)

    for result in results:
        if result is None:
            continue
        chunks = chunker(result)
        all_chunks.extend(chunks)
        save_file(repo_id=repo_id, path=result['path'],language=result['language'],size=result['size'])
        file_summary.append({
            "file":         result['path'],
            "language":     result['language'],
            "total_chunks": len(chunks)
        })
    #store at once batch chunking
    store_chuncks(all_chunks)    
    
    return {
        "repo": details['name'],
        "total_files": len(file_summary),
        "total_chunks": len(all_chunks),
        "files": file_summary
    }


@app.get('/api/repos')
def get_repo(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # ✅ GOOD: Fetches ONLY the current user's repos
    repos = db.query(Repository).filter(Repository.user_id == current_user.id).all()

    return repos


@app.post("/api/fetch-repo")
async def fetchrepo(repo_details:RepositoryRequest,current_user: User = Depends(get_current_user)):
    # repo_details= repo_details.json()

    all_chunks = []
    file_summary = []
    print(repo_details.repo_url)
    exists = repo_exists(repo_details.repo_url)
    print(f"URL: {repo_details.repo_url}")
    print(f"Exists: {exists}")
    if exists:
        return {"message": "Repo already indexed", "status": "exists"}

    details = await fetcher(repo_details.repo_url)

    #save the repo details here
    repo_id = save_repo(repo_detail=repo_details, current_user=current_user)

    files = await get_file_tree(repo_details, details["default_branch"])
    tasks = [get_file_content(file) for file in files]
    results = await asyncio.gather(*tasks)

    for result in results:
        if result is None:
            continue
        chunks = chunker(result)
        all_chunks.extend(chunks)
        save_file(repo_id=repo_id, path=result['path'],language=result['language'],size=result['size'])
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


from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
# Assuming you have your models and schemas imported:
# from models import ChatSession, ChatMessage
# from database import get_db

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

@app.post('/api/search')
def user_query(
    body: SearchRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = body.userMsg.content
    repos = body.userMsg.repos
    frontend_msg_id = body.userMsg.id
    
    is_new_session = False
    generated_title = "New Chat" # Default fallback

    # ---------------------------------------------------------
    # 1. HANDLE SESSION & GENERATE TITLE IN LINE
    # ---------------------------------------------------------
    if body.session_id is None:
        is_new_session = True
        
        # Call the LLM to generate the title BEFORE saving the session
        # (This adds ~1-2 seconds of wait time for the user on the very first message)
        try:
            generated_title = generate_chat_title(query)
        except Exception as e:
            print(f"Title generation failed: {e}")
            generated_title = query[:20] + "..." # Fast fallback if LLM fails
        print(generated_title)
        session_db = ChatSession(
            user_id=current_user.id, 
            title=generated_title
        )
        db.add(session_db)
        db.commit()
        db.refresh(session_db)
        active_session_id = session_db.id
    else:
        # Existing session logic
        session_db = db.query(ChatSession).filter(
            ChatSession.id == body.session_id,
            ChatSession.user_id == current_user.id
        ).first()
        
        if not session_db:
            raise HTTPException(status_code=404, detail="Chat session not found")
            
        active_session_id = session_db.id
        generated_title = session_db.title # Keep the existing title

    # ---------------------------------------------------------
    # 2. SAVE USER MESSAGE
    # ---------------------------------------------------------
    user_msg_db = ChatMessage(
        session_id=active_session_id, 
        role="user", 
        content=query
    )
    db.add(user_msg_db)
    db.commit()
    db.refresh(user_msg_db)

    #get the chat history
    recent_history = db.query(ChatMessage).filter(
        ChatMessage.session_id == active_session_id,
        ChatMessage.id < user_msg_db.id # Exclude the message we just saved
    ).order_by(ChatMessage.id.desc()).limit(6).all()
    
    recent_history.reverse()


    # ---------------------------------------------------------
    # 3. CALL MAIN AI (RAG)
    # ---------------------------------------------------------
    # (This takes the standard ~5-10 seconds)
    print("request send to llm, :", query)
    raw_ai_response = ask_llm(query, repos,history=recent_history) 
    if isinstance(raw_ai_response, dict):
        ai_response_text = raw_ai_response.get("answer", "No answer found.")
        # (Optional: If you want to use the 'sources' list later, you can pass it to the frontend here)
    else:
        ai_response_text = str(raw_ai_response)
    print("request receive to ouside llm")

    # ---------------------------------------------------------
    # 4. SAVE AI MESSAGE
    # ---------------------------------------------------------
    ai_msg_db = ChatMessage(
        session_id=active_session_id, 
        role="assistant", 
        content=ai_response_text
    )
    db.add(ai_msg_db)   
    db.commit()
    db.refresh(ai_msg_db)

    # ---------------------------------------------------------
    # 5. RETURN EVERYTHING TO FRONTEND
    # ---------------------------------------------------------
    return {
        "session_id": active_session_id,
        "title": generated_title,           # React uses this to update the sidebar instantly
        "is_new_session": is_new_session,   # Helps React know if it needs to append a new sidebar item
        "frontend_msg_id": frontend_msg_id, 
        "user_db_id": user_msg_db.id,       
        "ai_message": {
            "id": ai_msg_db.id,             
            "role": "assistant",
            "content": ai_response_text
        }
    }

def reset_chromadb():
    client.delete_collection("second_brain")
    client.create_collection("second_brain")
    print("Collection reset ✅")



@app.get('/api/chats')
def get_user_chats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Fetch all chats for this user, newest first
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(desc(ChatSession.created_at)).all()
    
    # Format the response for the React Sidebar
    chat_list = []
    for s in sessions:
        chat_list.append({
            "id": s.id,           # This is your UUID string
            "title": s.title,
            "created_at": s.created_at
        })
        
    return chat_list



@app.get('/api/chats/{session_id}')
def get_chat_history(
    session_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Verify the chat belongs to the user
    chat_session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
        
    # 2. Get all messages for this session, oldest to newest (chat feed order)
    messages_db = db.query(ChatMessage).filter(
        ChatMessage.session_id == session_id
    ).order_by(asc(ChatMessage.created_at)).all()
    
    # 3. Format messages to match your React `Message` interface
    formatted_messages = []
    for msg in messages_db:
        formatted_messages.append({
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            # Format time like "02:30 PM" if your React app expects it
            "time": msg.created_at.strftime("%I:%M %p") if msg.created_at else "",
            "repos": [] # Add repo mapping here if you save it in the database
        })
        
    return {
        "id": chat_session.id,
        "title": chat_session.title,
        "messages": formatted_messages
    }



@app.delete('/api/chats/{session_id}')
def delete_chat_session(
    session_id: str, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Find the chat and ensure this user actually owns it
    chat_session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    
    if not chat_session:
        raise HTTPException(status_code=404, detail="Chat not found or unauthorized")
        
    # 2. Delete the session
    # (If your SQLAlchemy model has cascade="all, delete-orphan", this automatically deletes the messages too!)
    db.delete(chat_session)
    db.commit()
    
    return {"message": "Chat successfully deleted"}