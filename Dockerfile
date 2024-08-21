# Use the official Node.js image as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Expose the port Elastic Beanstalk will route traffic to
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
