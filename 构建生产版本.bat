@echo off
chcp 65001 >nul 2>&1
title Gantt Tool - Build Production

cd /d "%~dp0"

:: Use built-in Node.js runtime
set "NODE_EXE=%~dp0runtime\node-v20.18.0-win-x64\node.exe"
set "NPM_EXE=%~dp0runtime\node-v20.18.0-win-x64\npm.cmd"
set "PATH=%~dp0runtime\node-v20.18.0-win-x64;%PATH%"

echo ==========================================
echo    Gantt Tool - Build Production
echo ==========================================
echo.

:: Check dependencies
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call "%NPM_EXE%" install
    if %errorlevel% neq 0 (
        echo [ERROR] Install failed!
        pause
        exit /b 1
    )
    echo.
)

echo [INFO] Building production version...
echo.

call "%NPM_EXE%" run build

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   Build SUCCESS!
    echo   Output: dist\
    echo   Ready for static server deployment
    echo ==========================================
) else (
    echo.
    echo [ERROR] Build failed, check errors above
)
echo.
pause
