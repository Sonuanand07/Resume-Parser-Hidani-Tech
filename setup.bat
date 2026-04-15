@echo off
REM Resume Parser - Quick Start Script for Windows

echo ================================================
echo Resume Parser - Quick Start
echo ================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 14 or higher.
    pause
    exit /b 1
)

echo ✅ Node.js check passed
for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
echo   Version: %NODE_VER%
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm check passed
for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
echo   Version: %NPM_VER%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create database directory if it doesn't exist
echo 📁 Creating database directory...
if not exist "database" mkdir database

echo.
echo ================================================
echo ✅ Setup complete!
echo ================================================
echo.
echo Start the server with:
echo   npm start
echo.
echo For development (auto-reload):
echo   npm run dev
echo.
echo Run tests:
echo   npm test
echo.
echo Run demo:
echo   node demo.js
echo.
echo Access the API:
echo   http://localhost:3000
echo.
pause
