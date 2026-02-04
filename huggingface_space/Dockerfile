# Hugging Face Spaces - Todo App Backend
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HUB_DISABLE_XET=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install (with quiet mode for faster install)
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt 2>&1 | grep -v "Requirement already satisfied" || true

# Copy application code
COPY backend/ /app/backend/

# Work from app directory (parent of backend)
WORKDIR /app

# Expose port
EXPOSE 8000

# Run the application with reduced log noise
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]
