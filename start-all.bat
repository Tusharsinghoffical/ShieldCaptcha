@echo off
title ShieldCaptcha Enterprise - Launcher
cd /d "%~dp0"

echo =========================================================
echo [LAUNCH] Starting ShieldCaptcha Enterprise Ecosystem...
echo =========================================================
echo [1/2] Starting Node.js Engine on https://shieldcaptcha.vercel.app...
start "ShieldCaptcha - Node.js Backend (:3000)" cmd /k "cd /d "%~dp0\backend-node" && node server.js"

echo [2/2] Starting Next.js 16 TypeScript Frontend on http://localhost:3001...
start "ShieldCaptcha - Next.js Frontend (:3001)" cmd /k "cd /d "%~dp0\frontend" && npm run dev"

echo Waiting 5 seconds for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening browser at http://localhost:3001...
start http://localhost:3001

echo =========================================================
echo [READY] ShieldCaptcha is now running!
echo - Frontend Portal: http://localhost:3001
echo - Backend Engine:   https://shieldcaptcha.vercel.app
echo =========================================================
