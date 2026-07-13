from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db.config import Base, engine, client
from db.session import get_db
import models.models
from api.auth import register
from schema import RegisterUser, RepositoryRequest
from services.github_fetcher import fetcher, get_file_tree, get_file_content
import asyncio
from services.chunker import chunker
from services.vector_store import store_chuncks
from services.rag import search, ask_llm
app = FastAPI()

# Base.metadata.create_all(bind=engine)

@app.get("/")
def hello():
    return "Hello World"


@app.post("/register")
def registerUser(user:RegisterUser, db:Session = Depends(get_db)):
    return register(user, db)


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

# user_query()

def reset_chromadb():
    client.delete_collection("second_brain")
    client.create_collection("second_brain")
    print("Collection reset ✅")


    

