import sqlalchemy as db 
from sqlalchemy.orm import DeclarativeBase, sessionmaker
import chromadb
from dotenv import load_dotenv
import os
from openai import OpenAI
load_dotenv()

#openai setup
client_openai= OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = os.environ.get("NVIDIA_API_KEY")
)


DATABASE_URL = os.environ.get("DATABASE_URL")
COLLECTION_NAME = os.environ.get("COLLECTION_NAME")


#postgres connection
engine = db.create_engine(
    DATABASE_URL,
    echo=True
)

#chromadb connection
client = chromadb.PersistentClient("./chromadb")
collection = client.get_or_create_collection(COLLECTION_NAME)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass    