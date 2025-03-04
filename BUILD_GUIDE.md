# GovTrack Build Guide

REAL mF BUILD
backend terminal: go run main.go
frontend terminal: npm run dev


## Project Overview

GovTrack is a web application that allows users to:

1. Track government policies at local, state, and federal levels
2. View representatives' voting records and political stances
3. Take a political quiz to compare their views with elected officials
4. Save policies and representatives for future reference
5. Receive notifications about policy changes and votes

The application is designed to be unbiased, providing simplified explanations of complex policies while showing how representatives actually voted.

## Tech Stack

This project uses the following technologies:

### Frontend
- **Next.js**: React framework for server-side rendering and static site generation
- **Material UI**: Component library for consistent, responsive design
- **Auth0**: Authentication and user management

### Backend
- **Go**: High-performance language for the API server
- **MongoDB**: NoSQL database for flexible data storage
- **JWT**: Token-based authentication

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or later)
- Go (v1.20 or later)
- MongoDB (v6 or later)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/govtrack.git
cd govtrack
```

### 2. Backend Setup

#### Install Go Dependencies

```bash
cd backend
go mod download
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```
MONGO_URI=mongodb://localhost:27017/govtrack
PORT=8080
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://govtrack-api
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret
```

#### Run the Backend Server

```bash
go run main.go
```

The server will start on http://localhost:8080

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AUTH0_DOMAIN=your-auth0-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-auth0-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://govtrack-api
```

#### Run the Development Server

```bash
npm run dev
```

The frontend will be available at http://localhost:3000

### 4. Auth0 Configuration

1. Create an Auth0 account at https://auth0.com
2. Create a new application:
   - Name: GovTrack
   - Application Type: Single Page Application
   - Allowed Callback URLs: http://localhost:3000/api/auth/callback
   - Allowed Logout URLs: http://localhost:3000
   - Allowed Web Origins: http://localhost:3000

3. Create an API:
   - Name: GovTrack API
   - Identifier: https://govtrack-api
   - Signing Algorithm: RS256

4. Update your environment variables with the Auth0 domain, client ID, and audience.

### 5. MongoDB Setup

1. Start MongoDB:
   ```bash
   mongod --dbpath /path/to/data/directory
   ```

2. Create a new database:
   ```bash
   mongo
   > use govtrack
   ```

## Project Structure

```
govtrack/
├── backend/
│   ├── config/         # Configuration files
│   ├── handlers/       # API request handlers
│   ├── middleware/     # Authentication middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── main.go         # Entry point
│   └── go.mod          # Go dependencies
├── frontend/
│   ├── public/         # Static assets
│   ├── src/
│   │   ├── app/        # Next.js app router
│   │   ├── components/ # Reusable components
│   │   └── lib/        # Utility functions
│   ├── package.json    # Node dependencies
│   └── next.config.js  # Next.js configuration
└── BUILD_GUIDE.md      # This file
```

## Data Models

### User
- ID
- Email
- Name
- Location
- Saved Policies
- Saved Representatives
- Quiz Results
- Notification Preferences

### Policy
- ID
- Title
- Description
- Simplified Description
- Status (proposed, passed, failed)
- Level (federal, state, local)
- Jurisdiction (country, state, city)
- Introduced Date
- Tags
- Votes

### Representative
- ID
- Name
- Title
- Party
- State/District
- Level (federal, state, local)
- Term Start/End
- Biography
- Contact Information
- Social Media
- Committees
- Political Stances
- Voting Record

### Quiz
- Questions
- Options
- Representative Answers

## API Endpoints

### Authentication
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/logout`: Log out user

### Users
- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update user profile
- `GET /api/users/me/saved-policies`: Get user's saved policies
- `POST /api/users/me/saved-policies`: Save a policy
- `DELETE /api/users/me/saved-policies/:id`: Remove a saved policy
- `GET /api/users/me/saved-representatives`: Get user's saved representatives
- `POST /api/users/me/saved-representatives`: Save a representative
- `DELETE /api/users/me/saved-representatives/:id`: Remove a saved representative

### Policies
- `GET /api/policies`: Get policies (with filtering)
- `GET /api/policies/:id`: Get policy details
- `GET /api/policies/:id/votes`: Get votes on a policy

### Representatives
- `GET /api/representatives`: Get representatives (with filtering)
- `GET /api/representatives/:id`: Get representative details
- `GET /api/representatives/:id/votes`: Get representative's voting record

### Quiz
- `GET /api/quiz/questions`: Get quiz questions
- `POST /api/quiz/results`: Submit quiz answers and get matches

## Deployment

### Backend Deployment (Go)

#### Docker
```bash
cd backend
docker build -t govtrack-api .
docker run -p 8080:8080 --env-file .env govtrack-api
```

#### Heroku
```bash
heroku create
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Next.js)

#### Vercel (Recommended)
```bash
cd frontend
vercel
```

#### Netlify
```bash
cd frontend
npm run build
netlify deploy --prod
```

## Mobile Adaptation

The current web application is built with responsive design principles, making it mobile-friendly. For a dedicated mobile app:

1. Use React Native with Expo for cross-platform development
2. Share business logic and API calls between web and mobile
3. Adapt UI components for native mobile experience
4. Use the same Auth0 authentication flow with mobile SDKs

## Troubleshooting

### Backend Issues
- **MongoDB Connection Error**: Ensure MongoDB is running and the connection string is correct
- **Auth0 Authentication Error**: Verify Auth0 domain, audience, and client credentials
- **API Not Responding**: Check if the Go server is running on the correct port

### Frontend Issues
- **Auth0 Login Failure**: Ensure callback URLs are correctly configured
- **API Connection Error**: Check if the backend URL is correct in environment variables
- **Build Errors**: Make sure all dependencies are installed with `npm install`

## Future Enhancements

1. **Data Visualization**: Add charts and graphs for voting patterns
2. **Geolocation**: Automatically detect user's location for relevant policies
3. **Email Notifications**: Send alerts about new policies and votes
4. **Mobile App**: Develop a dedicated mobile application
5. **Advanced Filtering**: Add more sophisticated search and filter options
6. **Social Sharing**: Allow users to share policies and quiz results

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 