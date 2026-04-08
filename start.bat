@echo off
chcp 65001 >nul 2>&1
echo ============================================
echo   进度工具 - 一键启动脚本
echo ============================================.
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败！请检查 Node.js 是否已安装。
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依赖安装完成！
) else (
    echo [信息] 依赖已就绪，启动开发服务器...
)

echo.
echo ============================================
echo   启动中... 按 Ctrl+C 停止
echo ============================================
call npm run dev
