@echo off
cd /d "%~dp0"
"C:\Users\vPro\AppData\Local\Programs\Python\Python311\python.exe" manage.py notify_expiring_contracts >> "%~dp0logs\notify_expiring_contracts.log" 2>&1
