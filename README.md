# GovTrack

GovTrack is a web application that helps citizens understand and engage with government policies and representatives. The platform provides simplified, unbiased explanations of policies while showing how elected officials voted on them.

![GovTrack Screenshot](https://placehold.co/800x400?text=GovTrack+Screenshot)

## Features

- **Policy Tracking**: View recent and upcoming policies at local, state, and federal levels
- **Representative Profiles**: See detailed information about elected officials and their voting records
- **Political Quiz**: Take a quiz to see how your views align with politicians
- **Location-Based Content**: Get policies and representatives relevant to your area
- **User Accounts**: Save policies and representatives for future reference
- **Simplified Explanations**: Complex policies explained in plain language while maintaining neutrality

## Tech Stack

- **Frontend**: Next.js, Material UI
- **Backend**: Go, MongoDB
- **Authentication**: Custom JWT authentication

## Authentication

GovTrack uses a custom JWT (JSON Web Token) authentication system:

- Users can register and login with email/password
- Authentication tokens are stored in localStorage
- Protected routes require a valid JWT token
- Tokens expire after 7 days

### Authentication Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email and password

### Frontend Authentication

The frontend uses a custom JWT provider that manages:
- User authentication state
- Token storage and retrieval
- Automatic token validation
- Protected route access

## Getting Started

For detailed setup instructions, please see the [Build Guide](BUILD_GUIDE.md).

### Quick Start

1. Clone the repository
2. Install MongoDB and make sure it's running
3. Run the application:

#### On Windows
```bash
run.bat
```

#### On Linux/Mac
```bash
chmod +x run.sh
./run.sh
```

This will start both the backend and frontend applications.

4. Open http://localhost:3000 in your browser

### Manual Setup

If you prefer to set up the applications manually:

1. Set up the backend:
   ```bash
   cd backend
   go mod download
   go mod tidy
   # Configure environment variables
   go run main.go
   ```
2. Set up the frontend:
   ```bash
   cd frontend
   npm install
   # Configure environment variables
   npm run dev
   ```

## Project Structure

```
govtrack/
├── backend/         # Go API server
├── frontend/        # Next.js web application
├── BUILD_GUIDE.md   # Detailed setup instructions
└── README.md        # This file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material UI for the component library
- Next.js team for the React framework
- Go team for the backend language 