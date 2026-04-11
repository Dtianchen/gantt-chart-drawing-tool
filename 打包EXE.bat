@echo off
chcp 65001 >nul 2>&1
title Gantt Tool - Build EXE

cd /d "%~dp0"

::: Set mirrors for China network
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

::: Use timestamp-based temp dir to avoid file lock conflicts from previous runs
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "datetime=%%a"
set TEMP_BUILD_DIR=..\gantt-build-%datetime:~0,14%

echo ==========================================
echo    Gantt Tool - Build Windows EXE
echo    (Mirror: npmmirror.com)
echo ==========================================
echo.
echo [INFO] Temp output: %TEMP_BUILD_DIR%
echo.

::: Check node_modules
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

:::: Kill any lingering electron processes to avoid file locks
taskkill /F /IM "Gantt-Tool.exe" >nul 2>&1
taskkill /F /IM "electron.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

::: Clean old gantt-build-* temp dirs from previous failed runs (skip locked ones)
for /d %%d in (..\gantt-build-*) do (
    rd /s /q "%%d" >nul 2>&1
)

:::: Build to unique temp English path
call npx electron-builder --win --config.directories.output="%TEMP_BUILD_DIR%" --config.win.forceCodeSigning=false --config.win.signAndEditExecutable=false

if %errorlevel% equ 0 (
    echo.
    
    ::: Copy result back to dist-exe/
    if exist "dist-exe" rd /s /q "dist-exe"
    move "%TEMP_BUILD_DIR%" "dist-exe" >nul
    
    echo ==========================================
    echo   Build Complete!
    echo   Output: dist-exe\
    echo   Files:
    echo     - Gantt-Tool Setup x.x.x.exe (Installer)
    echo     - Gantt-Tool x.x.x.exe (Portable)
    echo ==========================================
    
    :: Open output folder
    explorer dist-exe
    
    ::: Clean any remaining old temp dirs
    for /d %%d in (..\gantt-build-*) do rd /s /q "%%d" >nul 2>&1
) else (
    echo [WARNING] Build failed. Temp dir kept at: %TEMP_BUILD_DIR%
    echo           You may need to close CodeBuddy and delete it manually.
)
echo.
pause
