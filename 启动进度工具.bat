@echo off
chcp 65001 >nul 2>&1
title Gantt Tool

cd /d "%~dp0"

echo ==========================================
echo    Gantt Tool - Dev Server
echo ==========================================
echo.

::: Check dependencies
if not exist "node_modules" (
    echo [INFO] First run, installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Install failed!
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

::: Check build output
if not exist "dist\index.html" (
    echo [INFO] Building production version...
    call npm run build
    if %errorlevel% equ 0 (
        echo [SUCCESS] Build complete!
    )
    echo.
)

echo ==========================================
echo   Starting dev server...
echo   Browser: http://localhost:5173
echo   Press Ctrl+C to stop
echo ==========================================
echo.

call npm run dev

pause
