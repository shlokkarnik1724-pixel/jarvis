@echo off
setlocal
cd /d "%~dp0"

echo.
echo === Tactix AI Demo Starter ===
echo Working folder: %CD%
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not installed or not in PATH.
  echo Install from https://nodejs.org then reopen this window.
  pause
  exit /b 1
)

echo Node version:
node -v
echo.

if not exist "package.json" (
  echo ERROR: package.json not found.
  echo You must run this from the jarvis project folder.
  pause
  exit /b 1
)

echo Installing dependencies...
call npm install
if errorlevel 1 (
  echo ERROR: npm install failed.
  pause
  exit /b 1
)

echo.
echo Freeing port 3000 if needed...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  echo Killing PID %%a on port 3000
  taskkill /F /PID %%a >nul 2>nul
)

echo.
echo Starting server on http://127.0.0.1:3000
echo When you see "Ready", open this link in Chrome:
echo.
echo    http://127.0.0.1:3000/demo
echo.
echo Keep this window OPEN while using the app.
echo.

call npm run dev
pause
