@echo off
chcp 65001 >nul 2>&1
title Stop Nginx

cd /d "%~dp0"

echo Stopping Nginx...
taskkill /F /IM nginx.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] Nginx stopped.
) else (
    echo [INFO] Nginx was not running.
)

echo.
pause
