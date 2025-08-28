# frontend/Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy the rest of the frontend code
COPY . .

# Expose frontend port
EXPOSE 3000

# Run Next.js
CMD ["npm", "run", "dev"]
