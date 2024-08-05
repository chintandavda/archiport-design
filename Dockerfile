# Base image
FROM node:16-alpine

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Environment-specific commands
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# Development environment
RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install --only=dev && npm install -g nodemon; \
    fi

# Default command
CMD ["npm", "start"]
