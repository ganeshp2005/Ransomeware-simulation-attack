@echo off
echo Starting RWSA Backend Server...
cd /d "%~dp0backend"
pip install -r requirements.txt
python main.py
pause
