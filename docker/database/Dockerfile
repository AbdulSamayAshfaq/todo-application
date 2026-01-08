# Use PostgreSQL 15 image as base
FROM postgres:15

# Set environment variables
ENV POSTGRES_DB=todo_app
ENV POSTGRES_USER=todo_user
ENV POSTGRES_PASSWORD=todo_password

# Copy initialization scripts if needed
# COPY init.sql /docker-entrypoint-initdb.d/

# Expose port
EXPOSE 5432

# Start PostgreSQL
CMD ["docker-entrypoint.sh", "postgres"]