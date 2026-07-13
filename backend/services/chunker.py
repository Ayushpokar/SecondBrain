from fastapi import FastAPI


def chunker(data:dict):
    content = data['content']
    file_path = data['path']
    language = data['language']
    lines = content.split("\n")
    repo = data['repo']

    start = 0
    overlap = 4
    chunk_index = 0
    chunks= []
    chunk_size = 40

    while start < len(lines):
        end = start + chunk_size

        piece = lines[start:end]
        chunks.append({
            "chunk": "\n".join(piece),
            "chunk_index": chunk_index,
            "repo": repo,
            "path": file_path,
            "language": language,
            "line_number": f"{start} - {end}"
        })

        chunk_index +=1
        start = end - overlap
    return chunks