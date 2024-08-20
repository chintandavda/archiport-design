# Use a smaller Node.js image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# Expose port 3001 (internal) that the app is running on
EXPOSE 80

# Start the application
CMD ["npm", "start"]
