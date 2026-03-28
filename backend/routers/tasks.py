from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
import uuid

from models.task import Task, TaskCreate, TaskUpdate, Status

router = APIRouter(prefix="/tasks", tags=["tasks"])

# In-memory opslag (tijdelijk, later vervangen door database)
tasks_db: dict[str, Task] = {}


@router.get("/", response_model=list[Task])
def get_tasks(status: Optional[Status] = None, project: Optional[str] = None):
    tasks = list(tasks_db.values())
    if status:
        tasks = [t for t in tasks if t.status == status]
    if project:
        tasks = [t for t in tasks if t.project == project]
    return tasks


@router.post("/", response_model=Task, status_code=201)
def create_task(task_in: TaskCreate):
    now = datetime.utcnow()
    task = Task(
        id=str(uuid.uuid4()),
        created_at=now,
        updated_at=now,
        **task_in.model_dump(),
    )
    tasks_db[task.id] = task
    return task


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: str):
    task = tasks_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Taak niet gevonden")
    return task


@router.patch("/{task_id}", response_model=Task)
def update_task(task_id: str, task_update: TaskUpdate):
    task = tasks_db.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Taak niet gevonden")
    updated_data = task.model_dump()
    for field, value in task_update.model_dump(exclude_unset=True).items():
        updated_data[field] = value
    updated_data["updated_at"] = datetime.utcnow()
    tasks_db[task_id] = Task(**updated_data)
    return tasks_db[task_id]


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: str):
    if task_id not in tasks_db:
        raise HTTPException(status_code=404, detail="Taak niet gevonden")
    del tasks_db[task_id]
