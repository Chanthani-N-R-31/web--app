@echo off
title Interactive Python Learning Web App
color 0A

echo.
echo ========================================
echo  Interactive Python Learning Web App
echo ========================================
echo.
echo Starting the application...
echo.

REM Start the Flask server
start /B python app_simple.py

REM Wait a moment for server to start
timeout /t 3 /nobreak >nul

echo Server is starting...
echo.
echo Opening your browser...
echo.

REM Open the browser
start http://localhost:5000

echo.
echo ========================================
echo  App is now running!
echo ========================================
echo.
echo  URL: http://localhost:5000
echo.
echo  Features available:
echo  - Mode 1: Problem to Code
echo  - Mode 2: Code Analysis  
echo  - AI Chatbot with Error Detection
echo.
echo  To stop the server, close this window
echo  or press Ctrl+C
echo ========================================
echo.

REM Keep the window open
pause
