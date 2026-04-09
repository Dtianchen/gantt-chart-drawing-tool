@echo off
chcp 65001 >nul 2>&1
title Gantt Tool - Web Server (Nginx)

cd /d "%~dp0"

echo ==========================================
echo   Gantt Tool - Web Service (Nginx)
echo ==========================================
echo.

::: [1] Build if needed
if not exist "dist\index.html" (
    echo [1/3] Building production version...
    call npm run build
    if %errorlevel% neq 0 (
        echo [ERROR] Build failed!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Build output exists [OK]
)

::: [2] Stop existing Nginx
echo.
echo [2/3] Stopping any existing Nginx...
taskkill /F /IM nginx.exe >nul 2>&1
timeout /t 1 /nobreak >nul

::: [3] Start Nginx
echo [3/3] Starting Nginx...
cd nginx
start "" nginx.exe
timeout /t 1 /nobreak >nul
cd ..

::: Check if running
tasklist /FI "IMAGENAME eq nginx.exe" 2>nul | find /I "nginx.exe" >nul
if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   Web Server Started!
    echo   URL: http://localhost:8080
    echo ==========================================
    echo.
    echo Press any key to open browser...
    pause >nul
    start http://localhost:8080
    echo.
    echo Server is running. Close this window or run:
    echo   "停止Web服务.bat" to stop the server.
    echo.
) else (
    echo.
    echo [ERROR] Failed to start Nginx!
    pause
    exit /b 1
)

::: Keep window open (user closes to stop reference)
echo Press Ctrl+C or close this window to exit.
pause
