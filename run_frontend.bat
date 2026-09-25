@echo off
echo Starting RWSA Frontend Dashboard...
cd /d "%~dp0frontend"
set HTTPS=true
npm start
pause
