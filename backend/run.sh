#!/bin/bash

# Download dependencies
echo "Downloading dependencies..."
go mod download
go mod tidy

# Build the application
echo "Building the application..."
go build -o govtrack

# Run the application
echo "Starting the server..."
./govtrack 