@echo off
setlocal
cd /d "%~dp0"

echo.
echo ========================================
echo   Tactix AI - One Click Demo
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is missing.
  echo Download and install it from: https://nodejs.org
  echo Then double-click this file again.
  start https://nodejs.org
  pause
  exit /b 1
)

if not exist "package.json" (
  echo Wrong folder. Put start-demo.bat inside the jarvis folder.
  pause
  exit /b 1
)

echo Installing packages (first time only may take 1-2 minutes)...
call npm install --silent
if errorlevel 1 (
  echo npm install failed. Check your internet connection.
  pause
  exit /b 1
)

echo Freeing port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
  taskkill /F /PID %%a >nul 2>nul
)

echo.
echo Starting Tactix...
echo A browser tab will open automatically.
echo Keep the server window open.
echo.

REM Start server in a new window
start "Tactix AI Server - keep open" cmd /k "cd /d ""%~dp0"" && npm run dev"

REM Wait for server to become ready
echo Waiting for server...
set /a tries=0
:waitloop
set /a tries+=1
if %tries% GTR 60 goto openanyway
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -UseBasicParsing http://127.0.0.1:3000/demo -TimeoutSec 2; if ($r.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>nul
if errorlevel 1 (
  timeout /t 2 /nobreak >nul
  goto waitloop
)

:openanyway
echo Opening demo...
start "" "http://127.0.0.1:3000/demo"
echo.
echo Done. Demo should be open in your browser.
echo If not, manually open: http://127.0.0.1:3000/demo
echo.
pause
