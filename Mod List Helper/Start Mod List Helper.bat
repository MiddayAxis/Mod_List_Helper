@echo off
echo Starting Mod List Helper...
cd /d "%~dp0"
start /b cmd /c "npm start 1>nul 2>nul"
exit
