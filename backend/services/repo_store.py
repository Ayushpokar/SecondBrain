from db.session import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
from models.models import Repository, File,User
from security import get_current_user
from schema import RepositoryRequest

def save_repo(repo_detail:RepositoryRequest, current_user: User):
    db = next(get_db())
    print(repo_detail)
    try:
        new_repo = Repository(
            user_id=        current_user.id,
            github_repo_id= int(repo_detail.repo_id),
            github_url=     repo_detail.repo_url,
            owner=          repo_detail.owner,
            repo_name=      repo_detail.repo_name,
            description=    repo_detail.description,
            stars=          repo_detail.stars or 0,
            forks=          repo_detail.forks or 0,
            visibility=     repo_detail.visibility,
            default_branch= repo_detail.default_branch,
            last_commit=    repo_detail.last_commit,
            language=       repo_detail.language
        )
        db.add(new_repo)
        db.commit()
        db.refresh(new_repo)
        return new_repo.id

    except Exception as e:
        db.rollback()
        print(f"Error saving repo: {e}")  # ← THIS will show real error
        return None

    finally:
        db.close()



def save_file(repo_id:int, path:str, language:str, size:int, db:Session= Depends(get_db)):
    try:
        db = next(get_db())
        new_file = File(
            repo_id = repo_id,
            file_name = path.split('/')[-1],
            path = path,
            language = language,
            size = size
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        db.close()

    except Exception as e:
        db.rollback()
        print(f"Error saving file: {e}")
        return None

def repo_exists(github_url: str) -> bool:
    db = next(get_db())
    try:
        repo = db.query(Repository).filter(
            Repository.github_url == github_url  # ← add Repository.
        ).first()
        print("repo is there:",repo)
        return repo is not None
    except Exception as e:
        print(f"Error checking repo: {e}")
        return False
    finally:
        db.close()