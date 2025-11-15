FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript (create build directory if it doesn't exist)
RUN mkdir -p build && npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "main"]

