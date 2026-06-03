# Frontend Dockerfile - Build stage
FROM node:14-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:14-alpine

WORKDIR /app

# Install serve to run the built app
RUN npm install -g serve

# Copy the built app from the build stage
COPY --from=build /app/build ./build

# Expose port
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]
