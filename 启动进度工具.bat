@echo off
chcp 65001 >nul 2>&1
title Gantt Tool

cd /d "%~dp0"

:: Use built-in Node.js runtime
set "NODE_EXE=%~dp0runtime\node-v20.18.0-win-x64\node.exe"
set "NPM_EXE=%~dp0runtime\node-v20.18.0-win-x64\npm.cmd"
set "PATH=%~dp0runtime\node-v20.18.0-win-x64;%PATH%"

echo ==========================================
echo    Gantt Tool - Portable Version
echo    (Built-in Runtime)
echo ==========================================
echo.

:: Check dependencies
if not exist "node_modules" (
    echo [INFO] First run, installing dependencies...
    echo.
    call "%NPM_EXE%" install
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

:: Check build output
if not exist "dist\index.html" (
    echo [INFO] Building production version...
    call "%NPM_EXE%" run build
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

call "%NPM_EXE%" run dev

pause
