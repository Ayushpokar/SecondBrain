from db.config import collection

def store_chuncks(chunks_list:list):
    if not chunks_list:
        return

    documents = []
    metadatas = []
    ids = []

    for chunk in chunks_list:
        documents.append(chunk['chunk'])
        metadatas.append({
            "repo": chunk['repo'],
            "file_name": chunk['path'].split('/')[-1],
            "owner":chunk['owner'],
            "path": chunk['path'],
            "language": chunk['language'],
            "chunk_index": chunk['chunk_index'],
            "line_number": chunk['line_number']
        })
        ids.append(f"{chunk['path']}_{chunk['chunk_index']}")

    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids
    )

    print(f"Stored {len(chunks_list)} chunks in one batch")