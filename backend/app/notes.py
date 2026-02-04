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


@router.get("/", response_model=List[schemas.Note])
def get_notes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all notes for the current user"""
    logger.info(f"User {current_user.id} fetching notes (skip={skip}, limit={limit})")
    try:
        notes = db.query(models.Note).filter(
            models.Note.owner_id == current_user.id
        ).offset(skip).limit(limit).all()
        logger.info(f"Found {len(notes)} notes for user {current_user.id}")
        return notes
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching notes: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch notes")


@router.get("/{note_id}", response_model=schemas.Note)
def get_note(
    note_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific note by ID"""
    logger.info(f"User {current_user.id} fetching note {note_id}")
    try:
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.owner_id == current_user.id
        ).first()

        if not note:
            logger.warning(f"Note {note_id} not found for user {current_user.id}")
            raise HTTPException(status_code=404, detail="Note not found")

        logger.info(f"Note {note_id} found for user {current_user.id}")
        return note
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching note {note_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch note")


@router.post("/", response_model=schemas.Note)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Create a new note"""
    logger.info(f"User {current_user.id} creating note: {note.title}")

    try:
        db_note = models.Note(**note.dict(), owner_id=current_user.id)
        db.add(db_note)

        # CRITICAL: Commit and refresh to get the actual ID from Neon DB
        db.commit()
        logger.info(f"Note committed for user {current_user.id}, now refreshing...")

        # CRITICAL: db.refresh() is REQUIRED for Neon to ensure ID exists
        db.refresh(db_note)
        logger.info(f"Note created successfully - ID: {db_note.id}, User ID: {current_user.id}")

        # CRITICAL: Verify the note exists in DB
        verified_note = db.query(models.Note).filter(
            models.Note.id == db_note.id
        ).first()

        if not verified_note:
            logger.error(f"CRITICAL: Note {db_note.id} was committed but not found in DB!")
            raise HTTPException(status_code=500, detail="Note creation verification failed")

        logger.info(f"Note {db_note.id} verified in database")
        return db_note

    except SQLAlchemyError as e:
        logger.error(f"Database error creating note: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create note: {str(e)}")


@router.put("/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: int,
    note_update: schemas.NoteUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update an existing note"""
    logger.info(f"User {current_user.id} updating note {note_id}")

    try:
        # STRICT: Query DB first to verify note exists
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.owner_id == current_user.id
        ).first()

        if not note:
            logger.warning(f"Note {note_id} not found for update by user {current_user.id}")
            raise HTTPException(status_code=404, detail="Note not found")

        logger.info(f"Note {note_id} found, applying updates")

        # Update only the fields that are provided
        update_data = note_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(note, field, value)

        # Commit the update
        db.commit()
        logger.info(f"Note {note_id} committed")

        # CRITICAL: Refresh to get updated values from DB
        db.refresh(note)
        logger.info(f"Note {note_id} refreshed from DB")

        # Verify the update
        verified_note = db.query(models.Note).filter(
            models.Note.id == note_id
        ).first()

        if not verified_note:
            logger.error(f"CRITICAL: Note {note_id} update could not be verified!")
            raise HTTPException(status_code=500, detail="Note update verification failed")

        logger.info(f"Note {note_id} updated and verified successfully")
        return note

    except SQLAlchemyError as e:
        logger.error(f"Database error updating note {note_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")


@router.delete("/{note_id}")
def delete_note(
    note_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a note"""
    logger.info(f"User {current_user.id} deleting note {note_id}")

    try:
        # STRICT: Query DB first to verify note exists
        note = db.query(models.Note).filter(
            models.Note.id == note_id,
            models.Note.owner_id == current_user.id
        ).first()

        if not note:
            logger.warning(f"Note {note_id} not found for deletion by user {current_user.id}")
            raise HTTPException(status_code=404, detail="Note not found")

        logger.info(f"Note {note_id} found, deleting...")

        db.delete(note)
        db.commit()
        logger.info(f"Note {note_id} deleted and committed")

        # Verify deletion
        verified_delete = db.query(models.Note).filter(
            models.Note.id == note_id
        ).first()

        if verified_delete:
            logger.error(f"CRITICAL: Note {note_id} still exists after delete!")
            raise HTTPException(status_code=500, detail="Note deletion verification failed")

        logger.info(f"Note {note_id} deleted and verified successfully")
        return {"message": "Note deleted successfully"}

    except SQLAlchemyError as e:
        logger.error(f"Database error deleting note {note_id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete note: {str(e)}")