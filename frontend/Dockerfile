# Use an official Node.js runtime as the base image
FROM node:20.13.1-buster AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port that the app will run on
EXPOSE 5173

# Run the development server when the container starts
CMD ["npm", "run", "dev"]
