from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class Priority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Status(str, Enum):
    inbox = "inbox"
    next_action = "next_action"
    waiting = "waiting"
    someday = "someday"
    done = "done"


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Priority = Priority.medium
    status: Status = Status.inbox
    project: Optional[str] = None
    context: Optional[str] = None
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    project: Optional[str] = None
    context: Optional[str] = None
    due_date: Optional[datetime] = None


class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    priority: Priority
    status: Status
    project: Optional[str] = None
    context: Optional[str] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class AIRequest(BaseModel):
    message: str
    task_context: Optional[list[Task]] = None
