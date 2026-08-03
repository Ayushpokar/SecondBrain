from db.config import collection, client_openai
import json

PROMPTS = {

    "explain": """You are SecondBrain, a senior developer assistant.
The developer wants to understand their own code.

Your job:
- Explain clearly what the code does in simple terms
- Walk through it step by step
- Mention which file  you are referencing and if they ask line number then
- Use a code block to show the relevant part
- End with one line summary

Keep it conversational — like explaining to a colleague.""",

    "debug": """You are SecondBrain, a senior developer assistant.
The developer suspects there is a bug or issue in their code.

Your job:
- Look carefully at the provided code for bugs, edge cases, security issues
- Point out EXACTLY what is wrong and why
- Show the problematic code with file reference and if they ask after the line number
- Suggest the fix with corrected code
- If no bug found say "I don't see an obvious issue here, but watch out for..."

Be direct. Don't sugarcoat issues.""",

    "improve": """You are SecondBrain, a senior developer assistant.
The developer wants to improve or optimize their code.

Your job:
- Look at the provided code critically
- Suggest specific, actionable improvements
- Show before and after code examples
- Explain WHY each improvement matters
- Prioritize by impact: security > performance > readability

Be specific. Generic advice like "add error handling" is useless without showing exactly where and how.""",

    "find": """You are SecondBrain, a senior developer assistant.
The developer is trying to locate something in their codebase.

Your job:
- Point to the exact file and if they ask about the line number where it is
- Show the relevant code snippet
- If it appears in multiple places mention all of them
- If not found say "I cannot find this in the indexed code"

Be precise. The developer just wants to know WHERE it is.""",

    "compare": """You are SecondBrain, a senior developer assistant.
The developer wants to compare two approaches or implementations.

Your job:
- Show both implementations side by side
- Point out key differences
- Mention trade-offs of each approach
- Give a clear recommendation on which is better and why

Be opinionated. Developers want a clear answer not "it depends".""",

   "general": """You are SecondBrain, a senior developer assistant
with access to the developer's personal codebase.

Your job:
- Answer using the provided code context when available
- Always reference exact file name and if they ask about the line number numbers
- Use code blocks when showing code

If the answer is NOT in the indexed code:
- Don't just say "not found"
- Answer from your general knowledge as a senior engineer
- Say "This isn't in your indexed code, but generally..."
- Still be helpful and specific
- Suggest which type of file they might find it in

If question is not code related at all:
- Answer it naturally as a helpful senior developer
- You can discuss architecture, best practices, career advice
- Say "This is outside your codebase, but as a developer..."

Be direct and concise like a senior engineer."""
}
def search(query:str):

    result = collection.query(
        query_texts=[query],
        n_results=5
    )

    return result


def generate_chat_title(query: str) -> str:
    prompt = f"""
    Generate a chat session title.

    Rules:
    - Exactly 4 to 6 words.
    - Title Case.
    - No punctuation.
    - No quotes.
    - No explanations.
    - No sentences.
    - Return ONLY the title.

    User message:
    {query}
    """
    
    try:
        response = client_openai.chat.completions.create(
            model="nvidia/llama-3.3-nemotron-super-49b-v1.5",
            # 1. FIXED: Must be a list of message objects
            messages=[
                {"role": "user", "content": prompt} 
            ],
            temperature=0.3,
            # Pro-tip: Add max_tokens to force it to stay short and save latency/money
            max_tokens=15 
        )
        
        # 2. FIXED: Correctly parse the OpenAI response object
        generated_title = response.choices[0].message.content.strip().replace('"', '')
        return generated_title
        
    except Exception as e:
        # Fallback: If the LLM API goes down or times out, return a safe default
        # instead of crashing the entire chat endpoint.
        print(f"Failed to generate title: {e}")
        return "New Chat"

def detect_intent(query: str) -> str:
    query = query.lower()
    
    if any(w in query for w in ["bug", "issue", "problem", "error", "wrong", "fix"]):
        return "debug"
    elif any(w in query for w in ["explain", "what", "how does", "what is"]):
        return "explain"
    elif any(w in query for w in ["improve", "better", "optimize", "refactor"]):
        return "improve"
    elif any(w in query for w in ["find", "where", "which file", "show me"]):
        return "find"
    elif any(w in query for w in ["compare", "difference", "vs", "both"]):
        return "compare"
    else:
        return "general"



def ask_llm(query, repos=None, history=None):
    if history is None:
        history = []

    # ---------------------------------------------------------
    # STEP A: CONDENSE QUESTION (Query Rewriting)
    # ---------------------------------------------------------
    search_query = query
    
    if history:
        # Format history into a readable string
        history_text = "\n".join([f"{msg.role}: {msg.content}" for msg in history])
        
        rewrite_prompt = f"""Given the following conversation history and the user's latest question, rephrase the latest question to be a standalone question. 
        If it is already standalone, return it exactly as it is. Do NOT answer the question.
        
        Chat History:
        {history_text}
        
        Latest Question: {query}
        Standalone Question:"""

        try:
            rewrite_response = client_openai.chat.completions.create(
                model="openai/gpt-oss-120b", # Note: Use a smaller/faster model here if you have one available!
                messages=[{"role": "user", "content": rewrite_prompt}],
                max_tokens=60,
                temperature=0.0
            )
            search_query = rewrite_response.choices[0].message.content.strip()
            print("Rewritten query for Vector DB:", search_query)
        except Exception as e:
            print("Query rewrite failed, falling back to original query:", e)

    # ---------------------------------------------------------
    # STEP B: VECTOR SEARCH (Using the rewritten query)
    # ---------------------------------------------------------
    intent = detect_intent(search_query)

    query_args = {
            "query_texts": [search_query], # Use the standalone query here!
            "n_results": 5
    }
    if repos:
        query_args["where"] = {"repo": {"$in": repos}}

    results = collection.query(**query_args)
   
    context = ""
    for i, doc in enumerate(results['documents'][0]):
        meta = results['metadatas'][0][i]
        context += f"""
        File: {meta['path']} Line:{meta['line_number']}
        Code:
        {doc}
        ----
        """

    # ---------------------------------------------------------
    # STEP C: BUILD FINAL PROMPT WITH HISTORY
    # ---------------------------------------------------------
    messages = [
        {
            "role": "system",
            "content": PROMPTS[intent]   
        }
    ]
    
    # Inject the sliding window history
    for msg in history:
        messages.append({
            "role": msg.role,
            "content": msg.content
        })
        
    # Add the current question and the retrieved context
    messages.append({
        "role": "user",
        "content": f"""Question: {query}

        Relevant code from your codebase:
        {context}"""
    })

    print("request send to inside llm")
    
    # ---------------------------------------------------------
    # STEP D: FINAL GENERATION
    # ---------------------------------------------------------
    try:
        response = client_openai.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=messages,
            max_tokens=1800,
            temperature=0.2,
            timeout=80,
        )

        answer = response.choices[0].message.content

        return {
            "answer": answer,
            "sources": [m["path"] for m in results["metadatas"][0]]
        }

    except Exception as e:
        print(type(e))
        print(e)