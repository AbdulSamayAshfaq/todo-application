"""Test script for notes functionality"""
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.database import SessionLocal
from app import models
from datetime import datetime

def test_notes():
    """Test the notes functionality"""
    print("Testing Notes functionality...")

    # Create a database session
    db = SessionLocal()

    try:
        # Check if notes table exists and can be queried
        notes = db.query(models.Note).all()
        print(f"✓ Successfully queried notes table. Found {len(notes)} notes.")

        # Test creating a sample note
        sample_note = models.Note(
            title="Test Note",
            content="This is a test note to verify the notes functionality.",
            category="test",
            is_pinned=True,
            owner_id=1
        )

        db.add(sample_note)
        db.commit()
        db.refresh(sample_note)

        print(f"✓ Created test note with ID: {sample_note.id}")

        # Verify the note was created
        retrieved_note = db.query(models.Note).filter(models.Note.id == sample_note.id).first()
        if retrieved_note:
            print(f"✓ Verified note exists in database: {retrieved_note.title}")
        else:
            print("✗ Failed to retrieve the created note")

        # Clean up - delete the test note
        db.delete(retrieved_note)
        db.commit()
        print("✓ Test note cleaned up successfully")

    except Exception as e:
        print(f"✗ Error testing notes: {e}")
    finally:
        db.close()
        print("✓ Database session closed")

if __name__ == "__main__":
    test_notes()