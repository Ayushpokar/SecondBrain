# 🧠 SecondBrain

> *"I solved this before... but which project? Which file?"*

Every developer wastes time searching through old repos. SecondBrain fixes this — connect your GitHub repos and chat with your entire codebase using AI.

---

## The Problem

You have built 10+ projects over the years. You know you solved authentication somewhere, handled file uploads in another project, set up a WebSocket in another. But finding it means opening GitHub, searching through repos, reading files one by one.

SecondBrain indexes all your past code and lets you ask questions naturally — like talking to a colleague who has read every line you have ever written.

---

## How it Works

Connect your GitHub account → select repos to index → SecondBrain reads and understands your code → ask anything in plain English → get answers with exact file references.

No more searching. No more context switching. Just ask.

---

## Tech Stack

| | |
|---|---|
| Backend | Python + FastAPI |
| Vector Database | ChromaDB |
| LLM | NVIDIA Nemotron via OpenAI-compatible API |
| Authentication | GitHub OAuth + JWT |
| Database | PostgreSQL + SQLAlchemy |
| Frontend | React + TypeScript + Tailwind CSS |

---

## Getting Started

**Requirements:** Python 3.10+, PostgreSQL, GitHub account, NVIDIA API key

```bash
# Clone and setup
git clone https://github.com/yourusername/secondbrain
cd secondbrain/backend

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env

# Run
uvicorn main:app --reload
```

**.env:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/secondbrain
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NVIDIA_API_KEY=your_nvidia_key
JWT_SECRET=your_jwt_secret
```

---

Built to solve a real problem every developer faces. 🚀