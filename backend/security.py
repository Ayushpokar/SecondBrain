import bcrypt

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password=password.encode(), salt=bcrypt.gensalt())
    return hashed.decode()