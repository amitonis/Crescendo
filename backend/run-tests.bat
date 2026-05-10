@echo off
REM Silver Ride - Automated Backend Testing Script
REM Run this to test all backend endpoints

echo.
echo ========================================
echo Silver Ride - Backend Testing Suite
echo ========================================
echo.

REM Colors for output
setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:5000"
set "API_URL=http://localhost:5000/api"

REM Test Data
set "ARTIST_EMAIL=testartist_%random%@example.com"
set "FAN_EMAIL=testfan_%random%@example.com"
set "PASSWORD=TestPass123!"
set "ARTIST_USERNAME=artist_%random%"
set "FAN_USERNAME=fan_%random%"

echo [1/20] Testing Health Endpoint...
curl -s %BASE_URL%/health | findstr "status" >nul
if %errorlevel% equ 0 (
    echo [OK] Health check passed
    set HEALTH_PASS=1
) else (
    echo [ERROR] Health check failed
    set HEALTH_PASS=0
)
echo.

echo [2/20] Registering Artist User...
for /f "delims=" %%A in ('curl -s -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d {"username":"%ARTIST_USERNAME%","email":"%ARTIST_EMAIL%","password":"%PASSWORD%","role":"artist"} ^
  ^| findstr "_id"') do (
    set ARTIST_RESPONSE=%%A
)
if defined ARTIST_RESPONSE (
    echo [OK] Artist registered: %ARTIST_EMAIL%
    set ARTIST_PASS=1
) else (
    echo [ERROR] Artist registration failed
    set ARTIST_PASS=0
)
echo.

echo [3/20] Registering Fan User...
for /f "delims=" %%A in ('curl -s -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d {"username":"%FAN_USERNAME%","email":"%FAN_EMAIL%","password":"%PASSWORD%","role":"fan"} ^
  ^| findstr "_id"') do (
    set FAN_RESPONSE=%%A
)
if defined FAN_RESPONSE (
    echo [OK] Fan registered: %FAN_EMAIL%
    set FAN_PASS=1
) else (
    echo [ERROR] Fan registration failed
    set FAN_PASS=0
)
echo.

echo [4/20] Testing Artist Login...
curl -s -X POST %API_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d {"email":"%ARTIST_EMAIL%","password":"%PASSWORD%"} | findstr "success" >nul
if %errorlevel% equ 0 (
    echo [OK] Artist login successful
    set LOGIN_PASS=1
) else (
    echo [ERROR] Artist login failed
    set LOGIN_PASS=0
)
echo.

echo [5/20] Testing Fan Login...
curl -s -X POST %API_URL%/auth/login ^
  -H "Content-Type: application/json" ^
  -d {"email":"%FAN_EMAIL%","password":"%PASSWORD%"} | findstr "success" >nul
if %errorlevel% equ 0 (
    echo [OK] Fan login successful
    set FAN_LOGIN_PASS=1
) else (
    echo [ERROR] Fan login failed
    set FAN_LOGIN_PASS=0
)
echo.

echo [6/20] Testing Marketplace (List Tracks)...
curl -s %API_URL%/tracks | findstr "success" >nul
if %errorlevel% equ 0 (
    echo [OK] Marketplace listing works
    set MARKETPLACE_PASS=1
) else (
    echo [ERROR] Marketplace listing failed
    set MARKETPLACE_PASS=0
)
echo.

echo [7/20] Testing Email Validation (Invalid Email)...
curl -s -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d {"username":"testuser","email":"not-an-email","password":"%PASSWORD%","role":"fan"} | findstr "error" >nul
if %errorlevel% equ 0 (
    echo [OK] Email validation working
    set EMAIL_VALIDATION_PASS=1
) else (
    echo [ERROR] Email validation failed
    set EMAIL_VALIDATION_PASS=0
)
echo.

echo [8/20] Testing Password Validation (Too Short)...
curl -s -X POST %API_URL%/auth/register ^
  -H "Content-Type: application/json" ^
  -d {"username":"testuser","email":"test@example.com","password":"short","role":"fan"} | findstr "error" >nul
if %errorlevel% equ 0 (
    echo [OK] Password validation working
    set PASSWORD_VALIDATION_PASS=1
) else (
    echo [ERROR] Password validation failed
    set PASSWORD_VALIDATION_PASS=0
)
echo.

echo [9/20] Testing CORS Headers...
curl -i -s %BASE_URL%/health | findstr "Access-Control-Allow-Origin" >nul
if %errorlevel% equ 0 (
    echo [OK] CORS headers present
    set CORS_PASS=1
) else (
    echo [ERROR] CORS headers missing
    set CORS_PASS=0
)
echo.

echo [10/20] Testing Rate Limiting Header...
curl -i -s %BASE_URL%/health | findstr "RateLimit" >nul
if %errorlevel% equ 0 (
    echo [OK] Rate limiting headers present
    set RATELIMIT_PASS=1
) else (
    echo [WARNING] Rate limiting headers not visible
    set RATELIMIT_PASS=0
)
echo.

echo.
echo ========================================
echo Test Summary
echo ========================================
echo.
echo [1] Health Check: !HEALTH_PASS! (1=pass, 0=fail)
echo [2] Artist Registration: !ARTIST_PASS!
echo [3] Fan Registration: !FAN_PASS!
echo [4] Artist Login: !LOGIN_PASS!
echo [5] Fan Login: !FAN_LOGIN_PASS!
echo [6] Marketplace: !MARKETPLACE_PASS!
echo [7] Email Validation: !EMAIL_VALIDATION_PASS!
echo [8] Password Validation: !PASSWORD_VALIDATION_PASS!
echo [9] CORS Headers: !CORS_PASS!
echo [10] Rate Limiting: !RATELIMIT_PASS!
echo.

set /a total_pass=!HEALTH_PASS!+!ARTIST_PASS!+!FAN_PASS!+!LOGIN_PASS!+!FAN_LOGIN_PASS!+!MARKETPLACE_PASS!+!EMAIL_VALIDATION_PASS!+!PASSWORD_VALIDATION_PASS!+!CORS_PASS!+!RATELIMIT_PASS!

echo Total Passed: !total_pass!/10
echo.

if !total_pass! equ 10 (
    echo ✅ All tests PASSED!
) else (
    echo ⚠️  Some tests failed. Check output above.
)
echo.

pause
