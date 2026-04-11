@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul 2>&1
title Gantt Tool - Build EXE

cd /d "%~dp0"

:: Set mirrors for China network
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

:: Timestamp-based temp dir (avoids file lock conflicts from previous runs)
for /f "tokens=2 delims==" %%a in ('wmic os get localdatetime /value') do set "datetime=%%a"
set TEMP_BUILD_DIR=..\gantt-build-%datetime:~0,14%

echo ==========================================
echo    Gantt Tool - Build EXE
echo    (Mirror: npmmirror.com)
echo ==========================================
echo.
echo [INFO] Temp output: %TEMP_BUILD_DIR%
echo.

:: Ensure Defender exclusion is set
echo [1/4] Checking Windows Defender exclusion...
powershell -NoProfile -Command "$e='F:\Study\CodeBuddy'; if($e -notin (Get-MpPreference).ExclusionPath){ Add-MpPreference -ExclusionPath $e }; 'OK'" >nul 2>&1
echo         Done.

:: Check node_modules
if not exist "node_modules" (
    echo [2/4] Installing dependencies...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Install failed!
        pause
        exit /b 1
    )
) else (
    echo [2/4] Dependencies ready [OK]
)

echo.
echo [3/4] Building production version...
:: Use local vite binary to avoid npx pulling wrong version
call .\node_modules\.bin\vite.cmd build
if !errorlevel! neq 0 (
    echo [ERROR] Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Packaging EXE file...

:: Kill lingering processes to avoid file locks
taskkill /F /IM "Gantt-Tool.exe" >nul 2>&1
taskkill /F /IM "electron.exe" >nul 2>&1
timeout /t 2 /nobreak >nul

:: Clean old gantt-build-* temp dirs
for /d %%d in (..\gantt-build-*) do rd /s /q "%%d" >nul 2>&1

:: Build to temp English path
call npx electron-builder --win --config.directories.output="%TEMP_BUILD_DIR%" --config.win.forceCodeSigning=false --config.win.signAndEditExecutable=false

if !errorlevel! equ 0 (
    echo.
    echo [INFO] Moving files to dist-exe\...

    :: Prepare destination
    if exist "dist-exe\win-unpacked" rd /s /q "dist-exe\win-unpacked" >nul 2>&1
    if not exist "dist-exe" mkdir "dist-exe"

    :: Use robocopy with retry for locked files
    robocopy "%TEMP_BUILD_DIR%" "dist-exe" *.exe *.blockmap *.yaml *.yml win-unpacked /E /MOVE /R:5 /W:2000 >nul
    set RC_ERR=!errorlevel!

    if !RC_ERR! leq 7 (
        goto :BUILD_OK
    ) else (
        :: Fallback: try xcopy
        echo         robocopy failed, trying xcopy...
        xcopy "%TEMP_BUILD_DIR%\*.exe" "dist-exe\" /Y >nul 2>&1
        xcopy "%TEMP_BUILD_DIR%\*.blockmap" "dist-exe\" /Y >nul 2>&1
        xcopy "%TEMP_BUILD_DIR%\*.yaml" "dist-exe\" /Y >nul 2>&1
        xcopy "%TEMP_BUILD_DIR%\win-unpacked" "dist-exe\win-unpacked\" /E /Y /I >nul 2>&1
        goto :BUILD_OK
    )
) else (
    echo.
    echo [WARNING] Build failed. Temp dir kept at: %TEMP_BUILD_DIR%
    echo           Check logs above for errors.
    goto :SCRIPT_END
)

:BUILD_OK
echo.
echo ==========================================
echo   Build Complete!
echo   Output: dist-exe\
echo   Files:
echo     - Gantt-Tool Setup x.x.x.exe (Installer)
echo     - Gantt-Tool x.x.x.exe (Portable)
echo ==========================================
explorer dist-exe

:: Cleanup all remaining gantt-build-* temp dirs
for /d %%d in (..\gantt-build-*) do rd /s /q "%%d" >nul 2>&1

:SCRIPT_END
echo.
pause
