# Hugging Face Spaces - AI-Powered Todo API
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HUB_DISABLE_XET=1

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# Copy application code - maintain proper structure
COPY backend/ /app/backend/
COPY app.py /app/app.py

# Set Python path to include /app for imports
ENV PYTHONPATH=/app

# Expose port (Hugging Face uses PORT env variable)
EXPOSE 8000

# Run the application
CMD ["python", "app.py"]
