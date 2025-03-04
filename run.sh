#!/bin/bash

# Start MongoDB (if installed locally)
echo "Starting MongoDB..."
mongod &

# Start the backend
echo "Starting the backend..."
cd backend
chmod +x run.sh
./run.sh &
cd ..

# Start the frontend
echo "Starting the frontend..."
cd frontend
npm install
npm run dev

echo "Both frontend and backend are running!" 