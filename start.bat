@echo off
title FileDrop Server
cd /d "%~dp0backend"
cls
echo ========================================================
echo   FILEDROP - FAST CROSS-DEVICE FILE & CODE SHARING
echo ========================================================
echo.
echo 1. Starting FileDrop backend server on port 3000...
start "FileDrop Backend" /min cmd /c "node server.js"
echo 2. Waiting for server to initialize...
timeout /t 2 /nobreak >nul
echo 3. Launching FileDrop in your web browser...
start http://localhost:3000
echo.
echo ========================================================
echo   FileDrop is now active at: http://localhost:3000
echo ========================================================
echo.
echo Press any key to stop the server when you are finished.
pause >nul
taskkill /f /im node.exe >nul 2>&1
