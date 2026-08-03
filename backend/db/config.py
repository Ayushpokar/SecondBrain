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

# models = client_openai.models.list()

# for model in models.data:
#     print(model.id)
# models = [
#     "nvidia/nemotron-3-super-120b-a12b",
#     "nvidia/llama-3.3-nemotron-super-49b-v1.5",
#     "nvidia/llama-3.1-nemotron-70b-instruct",
#     "nvidia/llama3-chatqa-1.5-70b",
#     "openai/gpt-oss-20b",
# ]

# for model in models:
#     try:
#         response = client_openai.chat.completions.create(
#             model=model,
#             messages=[{"role": "user", "content": "Say hello"}],
#             max_tokens=10,
#             timeout=30,
#         )
#         print(f"✅ {model}")
#     except Exception as e:
#         print(f"❌ {model}: {type(e).__name__} - {e}")
DATABASE_URL = os.environ.get("DATABASE_URL")
COLLECTION_NAME = os.environ.get("COLLECTION_NAME")


#postgres connection
engine = db.create_engine(
    DATABASE_URL,
    echo=False
)

#chromadb connection
client = chromadb.PersistentClient("./chromadb")
collection = client.get_or_create_collection(COLLECTION_NAME)

SessionLocal = sessionmaker(bind=engine)

class Base(DeclarativeBase):
    pass    