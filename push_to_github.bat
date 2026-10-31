@echo off
title CraftStudio Pro - GitHub Publisher & Deployment Engine
cd /d "%~dp0"
echo =======================================================
echo   Publishing CraftStudio Pro to GitHub...
echo   Repository: https://github.com/debasishmallik-crazyboy/craftstudio-android-web
echo =======================================================
echo.

git status
echo.
git add -A
git commit -m "Deploy CraftStudio: Corel & Adobe replacement for Android Tablet with ChatGPT Generative Design Bridge"
echo.
git branch -M main
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code pushed successfully to GitHub!
    echo Your repository: https://github.com/debasishmallik-crazyboy/craftstudio-android-web
    echo GitHub Pages live URL: https://debasishmallik-crazyboy.github.io/craftstudio-android-web/
) else (
    echo [NOTE] If this is your first push and the GitHub repo does not exist yet:
    echo 1. Go to https://github.com/new
    echo 2. Create repository named: craftstudio-android-web (Public)
    echo 3. Re-run this script to push and automatically deploy to GitHub Pages!
)
echo.
pause
