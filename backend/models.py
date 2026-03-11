from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class Message(BaseModel):
    username: str
    text: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MessageOut(BaseModel):
    username: str
    text: str
    timestamp: str


class MathRequest(BaseModel):
    problem: str


class MathResponse(BaseModel):
    result: str
    error: Optional[str] = None
