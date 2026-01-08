# Use Node 18 image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY ../../frontend/package.json ../../frontend/package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY ../../frontend/. .

# Build the Next.js application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]