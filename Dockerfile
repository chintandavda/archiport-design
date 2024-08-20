# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of your application source code to the container
COPY . .

# Expose port 80
EXPOSE 80

# Set environment variable to tell Node.js app to use port 80
ENV PORT=80

# Start the application
CMD ["npm", "start"]
