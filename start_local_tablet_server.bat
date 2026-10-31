@echo off
title CraftStudio Local Tablet Hub (Zero Dependencies)
cd /d "%~dp0"
echo =======================================================
echo   Starting CraftStudio Local Hub for PC and Android Tablet...
echo   No npm install needed (100%% pure Node.js)
echo =======================================================
echo.
node server.js
pause
