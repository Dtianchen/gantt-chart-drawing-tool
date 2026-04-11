@echo off
chcp 65001 >nul 2>&1
title Gantt Tool - Build Production

cd /d "%~dp0"

echo ==========================================
echo   Gantt Tool - Build Production
echo ==========================================
echo.

:: Check dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Install failed!
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Building production version...
echo.

call npm run build

:: Use goto pattern for reliable flow control
if %errorlevel% neq 0 goto :build_fail

echo.
echo ==========================================
echo   Build SUCCESS!
echo   Output: dist\
echo   Ready for static server deployment
echo ==========================================
goto :end

:build_fail
echo.
echo [ERROR] Build failed, check errors above

:end
echo.
pause
