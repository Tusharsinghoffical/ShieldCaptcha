@echo off
title ShieldCaptcha - Python FastAPI Backend (:8000)
cd /d "%~dp0\backend-python"
echo ====================================================
echo Starting ShieldCaptcha Python FastAPI Server...
echo Listening on http://localhost:8000
echo ====================================================
python -m uvicorn captcha_server:app --host 0.0.0.0 --port 8000 --reload
pause
