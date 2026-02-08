FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
        build-essential \
        libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/app

# HF does NOT need EXPOSE, but it's ok to keep it generic
EXPOSE 7860

# 🔥 IMPORTANT: use HF injected PORT
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port 7860"]
