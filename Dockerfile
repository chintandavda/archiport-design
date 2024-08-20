# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 80

# Environment-specific commands
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Default command
CMD ["npm", "start"]
