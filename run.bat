@echo off

echo "NOTE: Make sure MongoDB is installed and running before proceeding."
echo "If you haven't installed MongoDB, please visit: https://www.mongodb.com/try/download/community"
echo "You can also use MongoDB Atlas cloud service instead of a local installation."
echo.
echo "Press any key to continue or Ctrl+C to cancel..."
pause > nul

REM Start the backend
echo Starting the backend...
cd backend
start /B cmd /c run.bat
cd ..

REM Start the frontend
echo Starting the frontend...
cd frontend
npm install
npm run dev

echo Both frontend and backend are running! 