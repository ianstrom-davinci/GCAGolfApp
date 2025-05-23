@echo off
REM start_nginx.bat - Run as Administrator
SET "PROJECT_BASE_PATH=%~dp0.."
for %%i in ("%PROJECT_BASE_PATH%") do SET "ABS_PROJECT_PATH=%%~fi"
SET "NGINX_PREFIX_PATH=%ABS_PROJECT_PATH:\=/%/nginx/"

echo Starting Nginx with prefix: %NGINX_PREFIX_PATH%
REM Assumes nginx.exe is in PATH. If not, provide full path to nginx.exe
nginx -p %NGINX_PREFIX_PATH% -c conf/nginx.conf

IF ERRORLEVEL 1 (
    echo Failed to start Nginx. Check port 80, paths, or run:
    echo nginx -t -p %NGINX_PREFIX_PATH% -c conf/nginx.conf
) ELSE (
    echo Nginx started.
)
pause
