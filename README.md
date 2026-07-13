# 🧠 Second Brain for Developers

Chat with your own codebase. Add any GitHub repo and ask questions about your past code — get instant answers with exact file references.

---

## 🤔 The Problem

> *"I solved this before... but which project? Which file?"*

Every developer wastes time searching through old repos. Second Brain fixes this.

---

## ✨ How it Works

```
Add GitHub Repo URL
        ↓
App fetches + chunks all code files
        ↓
Stored in ChromaDB as embeddings
        ↓
Ask anything about your code
        ↓
Get answer with exact file references
```

---

## 🛠️ Tech Stack

| | |
|---|---|
| Backend | Python + FastAPI |
| Vector DB | ChromaDB |
| LLM | NVIDIA Nemotron |
| GitHub | GitHub REST API |
| HTTP | HTTPX (async) |

---

## 🚀 Quick Start

```bash
# Install
pip install -r requirements.txt

# Add secrets
cp .env.example .env
# Fill in GITHUB_TOKEN and NVIDIA_API_KEY

# Run
uvicorn main:app --reload
```

---

## 📡 API

```
POST /fetch-repo   → index a GitHub repo
POST /search       → ask a question
POST /sync-repo    → re-index updated repo
```

**Example:**
```json
POST /search
{ "query": "how did I handle authentication?" }

Response:
{
  "answer": "In backend/auth.py you used JWT...",
  "sources": ["backend/auth.py", "backend/models.py"]
}
```
---

## 🔮 Coming Soon

- React frontend
- PostgreSQL for search history  
- GitHub OAuth
- Docker + deployment

---

Built to solve a real problem every developer faces. 🚀