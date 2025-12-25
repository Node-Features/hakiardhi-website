@echo off
echo ============================================
echo HakiArdhi Flowchart Converter
echo ============================================
echo.

REM Check if mermaid-cli is installed
where mmdc >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: mermaid-cli is not installed!
    echo.
    echo Please install it first by running:
    echo npm install -g @mermaid-js/mermaid-cli
    echo.
    pause
    exit /b 1
)

echo Converting flowcharts to PNG format...
echo.

for %%f in (*.mmd) do (
    echo [Processing] %%f
    mmdc -i "%%f" -o "%%~nf.png" -w 1920 -H 1080
    if %errorlevel% equ 0 (
        echo [SUCCESS] Created %%~nf.png
    ) else (
        echo [FAILED] Could not convert %%f
    )
    echo.
)

echo ============================================
echo Conversion complete!
echo ============================================
echo.
echo PNG files created in this folder.
echo You can now use them in PowerPoint presentations.
echo.
pause
