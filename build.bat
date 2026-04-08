@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   进度工具 - 一键构建脚本
echo ============================================.
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [信息] 检测到依赖缺失，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败！请检查 Node.js 是否已安装。
        pause
        exit /b 1
    )
    echo.
)

echo [信息] 正在构建生产版本...
echo.
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo   构建成功！输出目录: dist/
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   构建失败，请检查上方错误信息
    echo ============================================
)
echo.
pause
