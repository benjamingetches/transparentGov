# Start from the official Go image
FROM golang:1.20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o govtrack-api .

# Use a smaller image for the final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Set the working directory
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/govtrack-api .

# Expose the port
EXPOSE 8080

# Command to run the executable
CMD ["./govtrack-api"] 