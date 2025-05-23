# start_backend.ps1
$ProjectRoot = $PSScriptRoot | Split-Path
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath "venv_backend\Scripts\Activate.ps1"
$BackendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"
$BackendEnvFile = Join-Path -Path $BackendPath -ChildPath ".env.backend"
$BackendPort = "8000" 

if (Test-Path $BackendEnvFile) {
    Get-Content $BackendEnvFile | ForEach-Object {
        if ($_ -match "^\s*BACKEND_SERVER_PORT\s*=\s*(.+)") { $BackendPort = $Matches[1].Trim() }
    }
} else { Write-Warning ".env.backend not found. Using default port $BackendPort." }

if (-not (Test-Path $VenvPath)) { Write-Error "Venv not found: $VenvPath"; exit 1 }
Write-Host "Activating venv..."
& $VenvPath
Write-Host "Starting Waitress on port $BackendPort for gcagolfapp_backend..."
Push-Location $BackendPath
waitress-serve --port=$BackendPort gcagolfapp_backend.wsgi:application
Pop-Location
Read-Host -Prompt "Press Enter to exit"
