@echo off

REM Download dependencies
echo Downloading dependencies...
go mod download
go mod tidy

REM Build the application
echo Building the application...
go build -o govtrack.exe

REM Run the application
echo Starting the server...
govtrack.exe 