@echo off
REM stop_nginx.bat - Run as Administrator
SET "PROJECT_BASE_PATH=%~dp0.."
for %%i in ("%PROJECT_BASE_PATH%") do SET "ABS_PROJECT_PATH=%%~fi"
SET "NGINX_PREFIX_PATH=%ABS_PROJECT_PATH:\=/%/nginx/"

echo Stopping Nginx with prefix: %NGINX_PREFIX_PATH%
REM Assumes nginx.exe is in PATH.
nginx -p %NGINX_PREFIX_PATH% -s stop
IF ERRORLEVEL 1 (
    echo Failed to stop Nginx. Maybe not running or try: taskkill /F /IM nginx.exe /T
) ELSE ( echo Nginx stop signal sent. )
pause
