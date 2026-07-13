from pydantic import BaseModel
from typing import List

class UserBase(BaseModel):
    username: str
    full_name: str | None = None

class UserCreate(UserBase):
    pass # Face encoding is handled separately on the server

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
