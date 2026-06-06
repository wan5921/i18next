FROM node:20-alpine

# Set working directory
WORKDIR /app

# Layer optimization: Copy package.json and install dependencies first
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Expose Node.js default debug port
EXPOSE 9229

# Keep container alive for debugging purposes
CMD ["tail", "-f", "/dev/null"]
