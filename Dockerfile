# Step 1: Build the Node.js app
FROM node:20-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code to the container
COPY . .

# Build the application if required (e.g., for React or Next.js)
# RUN npm run build

# Step 2: Setup Nginx to serve the app
FROM nginx:alpine

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Node.js app from the previous stage
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose the port Nginx will run on
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
