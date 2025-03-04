# GovTrack Backend

This is the backend API for the GovTrack application, built with Go and MongoDB.

## Features

- RESTful API for managing users, policies, representatives, and quizzes
- MongoDB integration for data storage
- JWT authentication with Auth0
- CORS support for cross-origin requests

## Prerequisites

- Go 1.21 or higher
- MongoDB
- Auth0 account (for authentication)

## Environment Variables

The following environment variables are used by the application:

- `MONGO_URI`: MongoDB connection string (default: `mongodb://localhost:27017`)
- `PORT`: Port to run the server on (default: `8080`)
- `AUTH0_DOMAIN`: Auth0 domain
- `AUTH0_AUDIENCE`: Auth0 API audience

## Getting Started

1. Clone the repository
2. Set up the environment variables
3. Run the application

### Running the Application

#### On Windows

```bash
# Navigate to the backend directory
cd backend

# Run the application
run.bat
```

#### On Linux/Mac

```bash
# Navigate to the backend directory
cd backend

# Make the run script executable
chmod +x run.sh

# Run the application
./run.sh
```

## API Endpoints

### Users

- `POST /api/users`: Create a new user
- `GET /api/users/{id}`: Get user details
- `PUT /api/users/{id}`: Update user details
- `DELETE /api/users/{id}`: Delete a user
- `GET /api/users/auth0/{auth0_id}`: Get user by Auth0 ID

### Policies

- `GET /api/policies`: Get policies (with filtering)
- `POST /api/policies`: Create a new policy
- `GET /api/policies/{id}`: Get policy details
- `PUT /api/policies/{id}`: Update policy details
- `DELETE /api/policies/{id}`: Delete a policy
- `GET /api/policies/location`: Get policies by location

### Representatives

- `GET /api/representatives`: Get representatives (with filtering)
- `POST /api/representatives`: Create a new representative
- `GET /api/representatives/{id}`: Get representative details
- `PUT /api/representatives/{id}`: Update representative details
- `DELETE /api/representatives/{id}`: Delete a representative
- `GET /api/representatives/{id}/votes`: Get representative's voting record

### Quizzes

- `GET /api/quizzes`: Get quizzes (with filtering)
- `POST /api/quizzes`: Create a new quiz
- `GET /api/quizzes/{id}`: Get quiz details
- `PUT /api/quizzes/{id}`: Update quiz details
- `DELETE /api/quizzes/{id}`: Delete a quiz
- `POST /api/quizzes/{id}/submit`: Submit quiz results
- `GET /api/quizzes/results/{result_id}`: Get quiz result details
- `GET /api/quizzes/user/{user_id}/results`: Get user's quiz results

## Development

### Project Structure

- `main.go`: Entry point of the application
- `api/`: Contains the API implementation
  - `handlers/`: Request handlers
  - `middleware/`: Middleware functions
  - `models/`: Data models
  - `routes/`: Route definitions
- `config/`: Configuration utilities

### Adding New Features

1. Define the data model in `api/models/`
2. Create a handler in `api/handlers/`
3. Register the routes in `api/routes/routes.go`

## Sample Data

The `scripts` directory contains a script to load sample data into MongoDB for testing purposes.

### Loading Sample Data

#### On Windows

```bash
cd scripts
load_data.bat
```

#### On Linux/Mac

```bash
cd scripts
chmod +x load_data.sh
./load_data.sh
```

This will create sample users, policies, representatives, quizzes, and quiz results in the MongoDB database. 