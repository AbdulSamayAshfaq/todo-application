from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database
from .auth import get_current_user

router = APIRouter()


@router.get("/", response_model=List[schemas.Task])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all tasks for the current user"""
    tasks = db.query(models.Task).filter(models.Task.owner_id == current_user.id).offset(skip).limit(limit).all()
    return tasks


@router.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific task by ID"""
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new task"""
    db_task = models.Task(**task.dict(), owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an existing task"""
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only the fields that are provided
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    # If status is updated to completed, set completed_at
    if "status" in update_data and update_data["status"] == "completed":
        task.completed_at = datetime.utcnow()
    elif "status" in update_data and update_data["status"] == "pending":
        task.completed_at = None

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a task"""
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.owner_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}