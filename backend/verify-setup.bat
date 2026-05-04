@echo off
REM Quick Backend Setup Verification Script
REM Run this from the backend directory to verify everything is set up correctly

echo.
echo ========================================
echo Silver Ride - Backend Setup Verification
echo ========================================
echo.

REM Check if Node.js is installed
echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js is installed:
    node --version
) else (
    echo [ERROR] Node.js is not installed!
    echo Download from: https://nodejs.org/
    exit /b 1
)
echo.

REM Check if npm is installed
echo Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] npm is installed:
    npm --version
) else (
    echo [ERROR] npm is not installed!
    exit /b 1
)
echo.

REM Check if node_modules exists
echo Checking dependencies...
if exist node_modules (
    echo [OK] Dependencies installed (node_modules found)
) else (
    echo [WARNING] Dependencies not installed
    echo Run: npm install
    exit /b 1
)
echo.

REM Check if .env exists
echo Checking .env file...
if exist .env (
    echo [OK] .env file found
    echo.
    echo Checking environment variables...

    REM Simple check for required variables (not perfect but helpful)
    findstr /c:"MONGODB_URI" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] MONGODB_URI is set) else (echo   [ERROR] MONGODB_URI is missing)

    findstr /c:"JWT_SECRET" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] JWT_SECRET is set) else (echo   [ERROR] JWT_SECRET is missing)

    findstr /c:"CLOUDINARY_CLOUD_NAME" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] CLOUDINARY_CLOUD_NAME is set) else (echo   [ERROR] CLOUDINARY_CLOUD_NAME is missing)

    findstr /c:"CLOUDINARY_API_KEY" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] CLOUDINARY_API_KEY is set) else (echo   [ERROR] CLOUDINARY_API_KEY is missing)

    findstr /c:"CLOUDINARY_API_SECRET" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] CLOUDINARY_API_SECRET is set) else (echo   [ERROR] CLOUDINARY_API_SECRET is missing)

    findstr /c:"CLIENT_URL" .env >nul 2>&1
    if %errorlevel% equ 0 (echo   [OK] CLIENT_URL is set) else (echo   [ERROR] CLIENT_URL is missing)
) else (
    echo [ERROR] .env file not found!
    echo Create it by running: Copy-Item .env.example .env
    exit /b 1
)
echo.

REM Check TypeScript files
echo Checking TypeScript compilation...
findstr /c:"src/server.ts" .gitignore >nul 2>&1
if exist src\server.ts (
    echo [OK] src/server.ts found
) else (
    echo [ERROR] src/server.ts not found!
    exit /b 1
)
echo.

echo ========================================
echo Verification Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file and fill in all credentials
echo 2. Run: npm run dev
echo 3. You should see "[OK] MongoDB connected successfully"
echo.
echo For credentials help, see: CREDENTIALS_GUIDE.md
echo For setup help, see: BACKEND_SETUP.md
echo.
pause
