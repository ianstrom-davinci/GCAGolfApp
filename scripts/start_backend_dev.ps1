# start_backend_dev.ps1
$ProjectRoot = $PSScriptRoot | Split-Path
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath "venv_backend\Scripts\Activate.ps1"
$BackendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"
if (-not (Test-Path $VenvPath)) { Write-Error "Venv not found: $VenvPath"; exit 1 }
Write-Host "Activating venv..."
& $VenvPath
Write-Host "Starting Django development server..."
Push-Location $BackendPath
python manage.py runserver
Pop-Location
Read-Host -Prompt "Press Enter to exit"
