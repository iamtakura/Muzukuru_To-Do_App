from fastapi import APIRouter, Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from jose import JWTError, jwt

from backend.database import get_db, User, TodoItem as TodoItemModel
from backend.models import TodoCreate, TodoItem, UserResponse
from backend.auth import SECRET_KEY, ALGORITHM
from backend.logger import logger

router = APIRouter(prefix="", tags=["protected"])

# Custom HTTPBearer security schema to return 401 instead of 403 on failure
security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to check authorization header, decode JWT, and verify user exists."""
    if not credentials:
        logger.info("Access denied: Authorization header missing.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        # Decode token and extract claims
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            logger.info("Access denied: JWT subject payload missing.")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError as e:
        logger.info(f"Access denied: Invalid or expired JWT token. Details: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials or token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Retrieve user from database
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        logger.info(f"Access denied: User '{username}' does not exist in the database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.get("/protected")
def get_protected(current_user: User = Depends(get_current_user)):
    """Protected endpoint verifying that current user token is valid."""
    logger.info(f"Protected route accessed by user: '{current_user.username}'")
    return {
        "message": "Access granted to protected route.",
        "user": {
            "id": current_user.id,
            "username": current_user.username
        }
    }

@router.get("/todos", response_model=List[TodoItem])
def get_todos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all To-Do items for the currently logged-in user."""
    todos = db.query(TodoItemModel).filter(TodoItemModel.owner_id == current_user.id).all()
    logger.info(f"Retrieved {len(todos)} todos for user: '{current_user.username}'")
    return todos

@router.post("/todos", response_model=TodoItem, status_code=status.HTTP_201_CREATED)
def create_todo(
    todo_in: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new To-Do item for the authenticated user."""
    new_todo = TodoItemModel(
        title=todo_in.title,
        completed=todo_in.completed if todo_in.completed is not None else False,
        owner_id=current_user.id
    )
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    logger.info(f"Created todo '{new_todo.id}' for user: '{current_user.username}'")
    return new_todo

@router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(
    todo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific To-Do item. Verify that it exists and belongs to the caller."""
    todo = db.query(TodoItemModel).filter(
        TodoItemModel.id == todo_id,
        TodoItemModel.owner_id == current_user.id
    ).first()
    
    if not todo:
        logger.info(f"Delete failed: Todo '{todo_id}' not found for user: '{current_user.username}'")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo item not found"
        )
    
    db.delete(todo)
    db.commit()
    logger.info(f"Deleted todo '{todo_id}' for user: '{current_user.username}'")
    return None
