import httpx
import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from schema import RepositoryRequest

load_dotenv()
token = os.environ.get('GITHUB_TOKEN')
header = {
    'Authorization': f"Bearer {token}"
}

async def fetcher(github_url):
   
    async with httpx.AsyncClient() as client:
        response = await client.get(github_url,headers=header)

    response.raise_for_status()
    response = response.json()
    return response


async def get_file_tree(detail:RepositoryRequest, branch:str):
    url = f"https://api.github.com/repos/{detail.owner}/{detail.repo_name}/git/trees/{branch}?recursive=1"
    good_extension = ('.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.go', '.java', '.yml', '.txt', '.php','.json', 'c++', 'c')
    bad_folder = (
    'node_modules',
    '__pycache__',
    '.env',
    'dist',
    'build',
    'migrations',    # ← database migration files
    '.git',          # ← git internals
    'venv',          # ← python virtual env
    '.venv',
    'env',
    'static',        # ← static assets
    'media',         # ← uploaded media files
    'coverage',      # ← test coverage reports
    '.idea',         # ← IDE files
    '.vscode',       # ← IDE files
    'logs',          # ← log files
    'tmp',           # ← temp files
    'cache',
    )
    bad_extension = (
        '.png', '.jpg', '.jpeg', '.gif', '.svg',
        '.mp4', '.mp3', '.pdf',
        '.zip', '.tar', '.gz',
        '.exe', '.pyc', '.class',
        '.lock',          # package-lock.json, yarn.lock
        '.log',
    )
    get_file= []

    async with httpx.AsyncClient() as client:
        rawfiles = await client.get(url,headers=header)
    rawfiles.raise_for_status()
    files = rawfiles.json()

    for i in files['tree']:
        if i['type'] == "blob" and i['size'] < 500000:

            if any(bad in i['path'] for bad in bad_folder):
                continue

            if (Path(i['path']).suffix in  bad_extension):
                continue

            # if (i['path']).endswith(good_extension):
            data = {
                "repo":detail.repo_name,
                "owner":detail.owner,
                "path": i['path'],
                "size": i['size'],  
                "url": i['url']
            }
            get_file.append(data)
    return get_file

def detect_language(file_path):
    language_map = {
        ".py":   "python",
        ".js":   "javascript",
        ".jsx":  "javascript",
        ".ts":   "typescript",
        ".tsx":  "typescript",
        ".java": "java",
        ".go":   "go",
        ".html": "html",
        ".php":  "php",
        ".sql":  "sql",
        ".md":   "markdown",
    }

    suffix = Path(file_path).suffix
    return language_map.get(suffix, "unknown")

async def get_file_content(file:dict):
    async with httpx.AsyncClient(timeout=60) as client:
        details = await client.get(file['url'],headers=header)
        details.raise_for_status()
        details = details.json()

        raw_content = details['content']    

        cleaned = raw_content.replace('\n','')
        try:
            decoded_content = base64.b64decode(cleaned).decode('utf-8')
        except:
            return None    
        return {
            "repo": file['repo'],
            "owner":file['owner'],
            "path": file['path'],
            "content": decoded_content,
            "language": detect_language(file['path']),
            "size": file['size']
        }
                   