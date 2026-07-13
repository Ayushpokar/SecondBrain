from db.config import collection, client_openai
import json

def search(query:str):

    result = collection.query(
        query_texts=[query],
        n_results=5
    )

    return result

def extract_intent(user_query):
    response = client_openai.chat.completions.create(
        model="nvidia/nemotron-3-super-120b-a12b",
        messages=[{
            "role": "user",
            "content": f"""
            Extract from this query:
            1. repo name if mentioned (or null)
            2. clean search query
            3. just return json nothing else
            
            Return JSON only:
            {{"repo": "name or null", "query": "clean question"}}
            
            User query: {user_query}
            """
        }],
        max_tokens=100
    )
    raw = response.choices[0].message.content
    print("Raw response:", raw)  # ← see what LLM returned
    
    return json.loads(response.choices[0].message.content)


def ask_llm(query):
    # intent = extract_intent(query)
    # if intent['repo']:

    #     results = collection.query(
    #         query_texts=[query],
    #         n_results=5,
    #         where={"repo": intent['repo']}
    #     )
    # else:
    #     results = collection.query(
    #         query_texts=[query],
    #         n_results=5
    #     )
    results = collection.query(
            query_texts=[query],
            n_results=5
    )
    context = ""
    for i, doc in enumerate(results['documents'][0]):
        meta = results['metadatas'][0][i]
        context += f"""
        File: {meta['path']} Line:{meta['line_number']}
        Code:
        {doc}
        ----
        """

    #sending to nvidia model
    response = client_openai.chat.completions.create(
        model="nvidia/nemotron-3-super-120b-a12b",
        messages = [{
            "role":"user",
            "content": f"""
            You are helping a developer understand their own code.
            Answer their question using only the code provided.
            Always mention which file the answer comes from and line number as well.
            
            Question: {query}
            
            Relevant code:
            {context}
            """
        }],
        max_tokens=1500
    )

    return {
        "answer": response.choices[0].message.content,
        "sources": [m['path'] for m in results['metadatas'][0]]
    }