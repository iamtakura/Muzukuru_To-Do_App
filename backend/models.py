from pydantic import BaseModel, Field
from typing import Optional

# Base User Schema
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)

# Schema for user registration
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Schema for user login
class UserLogin(BaseModel):
    username: str
    password: str

# Schema for user response (safe details)
class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

# Schema for token responses
class Token(BaseModel):
    access_token: str
    token_type: str

# Schema for token payload data (claims decoded from JWT)
class TokenData(BaseModel):
    username: Optional[str] = None

# Schema for creating a To-Do item
class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1)
    completed: Optional[bool] = False

# Schema for returning a To-Do item
class TodoItem(BaseModel):
    id: int
    title: str
    completed: bool
    owner_id: int

    class Config:
        orm_mode = True
        from_attributes = True
