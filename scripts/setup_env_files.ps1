# setup_env_files.ps1
$ProjectRoot = $PSScriptRoot | Split-Path

$BackendEnvExample = Join-Path -Path $ProjectRoot -ChildPath "backend\.env.backend.example"
$BackendEnv = Join-Path -Path $ProjectRoot -ChildPath "backend\.env.backend"
$FrontendEnvExample = Join-Path -Path $ProjectRoot -ChildPath "frontend\.env.frontend.example"
$FrontendEnv = Join-Path -Path $ProjectRoot -ChildPath "frontend\.env.frontend"

if (-not (Test-Path $BackendEnv) -and (Test-Path $BackendEnvExample)) {
    Copy-Item -Path $BackendEnvExample -Destination $BackendEnv
    Write-Host "Created backend\.env.backend. Please edit it."
} else { Write-Host "backend\.env.backend already exists or example missing." }

if (-not (Test-Path $FrontendEnv) -and (Test-Path $FrontendEnvExample)) {
    Copy-Item -Path $FrontendEnvExample -Destination $FrontendEnv
    Write-Host "Created frontend\.env.frontend. Please review it."
} else { Write-Host "frontend\.env.frontend already exists or example missing." }
Write-Host "Edit .env files with specific configurations (SECRET_KEY, DB_PASSWORD, etc.)."
