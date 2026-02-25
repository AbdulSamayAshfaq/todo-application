from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Relationships to tasks and notes
    tasks = relationship("Task", back_populates="owner")
    notes = relationship("Note", back_populates="owner")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending")  # "pending", "completed"
    priority = Column(String, default="medium")  # "low", "medium", "high"
    due_date = Column(DateTime, nullable=True)
    category = Column(String, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True)  # "daily", "weekly", "monthly", "yearly"
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Foreign key to user
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())

    # Foreign key to user
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="notes")