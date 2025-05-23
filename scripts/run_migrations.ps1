# run_migrations.ps1
$ProjectRoot = $PSScriptRoot | Split-Path
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath "venv_backend\Scripts\Activate.ps1"
$BackendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"
if (-not (Test-Path $VenvPath)) { Write-Error "Venv not found: $VenvPath"; exit 1 }
Write-Host "Activating venv..."
& $VenvPath
Write-Host "Running Django makemigrations and migrate..."
Push-Location $BackendPath
python manage.py makemigrations golf_metrics_app
python manage.py migrate
Pop-Location
Write-Host "Migrations complete."
Read-Host -Prompt "Press Enter to exit"
