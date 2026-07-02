from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db, User
from backend.models import UserCreate, UserLogin, Token, UserResponse
from backend.auth import get_password_hash, verify_password, create_access_token
from backend.logger import logger

router = APIRouter(prefix="", tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with a hashed password."""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        logger.info(f"Registration rejected: Username '{user_in.username}' already exists.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Hash password and store in SQLite
    hashed_password = get_password_hash(user_in.password)
    new_user = User(username=user_in.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    logger.info(f"Successfully registered user: '{new_user.username}'")
    return new_user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user credentials and return a JWT access token."""
    user = db.query(User).filter(User.username == login_in.username).first()
    
    # Verify user exists and check password
    if not user or not verify_password(login_in.password, user.hashed_password):
        logger.info(f"Failed login attempt for username: '{login_in.username}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate JWT token. Include username as both sub and username in the payload.
    token_payload = {
        "sub": user.username,
        "username": user.username
    }
    access_token = create_access_token(data=token_payload)
    
    logger.info(f"Successful login for user: '{user.username}'")
    return {"access_token": access_token, "token_type": "bearer"}
