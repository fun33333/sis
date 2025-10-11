@echo off
echo Installing npm packages...
cd /d "%~dp0"
call npm install
echo.
echo Installation complete!
pause

