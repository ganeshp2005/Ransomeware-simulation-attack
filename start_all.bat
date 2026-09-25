@echo off
echo ========================================================
echo   Launching RWSA Enterprise Ransomware Defense System
echo ========================================================
start "RWSA Backend Server (Port 5000)" "%~dp0run_backend.bat"
start "RWSA Frontend Dashboard (Port 3000)" "%~dp0run_frontend.bat"
echo Services starting in separate console windows...
