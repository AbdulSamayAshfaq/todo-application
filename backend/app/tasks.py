import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from . import models, schemas, database
from .auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[schemas.Task])
def get_tasks(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all tasks for the current user"""
    logger.info(f"User {current_user.id} fetching tasks (skip={skip}, limit={limit})")
    try:
        tasks = db.query(models.Task).filter(
            models.Task.owner_id == current_user.id
        ).offset(skip).limit(limit).all()
        logger.info(f"Found {len(tasks)} tasks for user {current_user.id}")
        return tasks
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch tasks")


@router.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific task by ID"""
    logger.info(f"User {current_user.id} fetching task {task_id}")
    try:
        task = db.query(models.Task).filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        ).first()
        
        if not task:
            logger.warning(f"Task {task_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Task not found")
        
        logger.info(f"Task {task_id} found for user {current_user.id}")
        return task
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching task {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch task")


@router.post("/", response_model=schemas.Task)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new task"""
    logger.info(f"User {current_user.id} creating task: {task.title}")
    
    try:
        db_task = models.Task(**task.dict(), owner_id=current_user.id)
        db.add(db_task)
        
        # CRITICAL: Commit and refresh to get the actual ID from Neon DB
        db.commit()
        logger.info(f"Task committed for user {current_user.id}, now refreshing...")
        
        # CRITICAL: db.refresh() is REQUIRED for Neon to ensure ID exists
        db.refresh(db_task)
        logger.info(f"Task created successfully - ID: {db_task.id}, User ID: {current_user.id}")
        
        # CRITICAL: Verify the task exists in DB
        verified_task = db.query(models.Task).filter(
            models.Task.id == db_task.id
        ).first()
        
        if not verified_task:
            logger.error(f"CRITICAL: Task {db_task.id} was committed but not found in DB!")
            raise HTTPException(status_code=500, detail="Task creation verification failed")
        
        logger.info(f"Task {db_task.id} verified in database")
        return db_task
        
    except SQLAlchemyError as e:
        logger.error(f"Database error creating task: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.put("/{task_id}", response_model=schemas.Task)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an existing task"""
    logger.info(f"User {current_user.id} updating task {task_id}")
    
    try:
        # STRICT: Query DB first to verify task exists
        task = db.query(models.Task).filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        ).first()
        
        if not task:
            logger.warning(f"Task {task_id} not found for update by user {current_user.id}")
            raise HTTPException(status_code=404, detail="Task not found")
        
        logger.info(f"Task {task_id} found, applying updates")
        
        # Update only the fields that are provided
        update_data = task_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(task, field, value)
        
        # If status is updated to completed, set completed_at
        if "status" in update_data and update_data["status"] == "completed":
            task.completed_at = datetime.utcnow()
        elif "status" in update_data and update_data["status"] == "pending":
            task.completed_at = None
        
        # Commit the update
        db.commit()
        logger.info(f"Task {task_id} committed")
        
        # CRITICAL: Refresh to get updated values from DB
        db.refresh(task)
        logger.info(f"Task {task_id} refreshed from DB")
        
        # Verify the update
        verified_task = db.query(models.Task).filter(
            models.Task.id == task_id
        ).first()
        
        if not verified_task:
            logger.error(f"CRITICAL: Task {task_id} update could not be verified!")
            raise HTTPException(status_code=500, detail="Task update verification failed")
        
        logger.info(f"Task {task_id} updated and verified successfully")
        return task
        
    except SQLAlchemyError as e:
        logger.error(f"Database error updating task {task_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a task"""
    logger.info(f"User {current_user.id} deleting task {task_id}")
    
    try:
        # STRICT: Query DB first to verify task exists
        task = db.query(models.Task).filter(
            models.Task.id == task_id,
            models.Task.owner_id == current_user.id
        ).first()
        
        if not task:
            logger.warning(f"Task {task_id} not found for deletion by user {current_user.id}")
            raise HTTPException(status_code=404, detail="Task not found")
        
        logger.info(f"Task {task_id} found, deleting...")
        
        db.delete(task)
        db.commit()
        logger.info(f"Task {task_id} deleted and committed")
        
        # Verify deletion
        verified_delete = db.query(models.Task).filter(
            models.Task.id == task_id
        ).first()
        
        if verified_delete:
            logger.error(f"CRITICAL: Task {task_id} still exists after delete!")
            raise HTTPException(status_code=500, detail="Task deletion verification failed")
        
        logger.info(f"Task {task_id} deleted and verified successfully")
        return {"message": "Task deleted successfully"}
        
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting task {task_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")
