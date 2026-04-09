@echo off
chcp 65001 >nul 2>&1
title Gantt Tool - Build EXE

cd /d "%~dp0"

:: Set mirrors for China network
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

echo ==========================================
echo    Gantt Tool - Build Windows EXE
echo    (Mirror: npmmirror.com)
echo ==========================================
echo.

:: Check node_modules
if not exist "node_modules" (
    echo [1/3] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Install failed!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies ready [OK]
)

echo.
echo [2/3] Building production version...
call npx vite build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Packaging EXE file (this may take a few minutes)...

::: Kill any lingering electron processes to avoid file locks
taskkill /F /IM "进度工具.exe" >nul 2>&1
taskkill /F /IM electron.exe >nul 2>&1
timeout /t 1 /nobreak >nul

call npx electron-builder --win --config.win.forceCodeSigning=false --config.win.signAndEditExecutable=false

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   Build Complete!
    echo   Output: dist-exe\
    echo   Files:
    echo     - Gantt-Tool Setup x.x.x.exe (Installer)
    echo     - Gantt-Tool x.x.x.exe (Portable)
    echo ==========================================
    
    :: Open output folder
    explorer dist-exe
) else (
    echo [ERROR] Packaging failed, check errors above
)
echo.
pause
