# generate_api_client.ps1
$ProjectRoot = $PSScriptRoot | Split-Path
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath "venv_backend\Scripts\Activate.ps1"
$BackendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"
$FrontendPath = Join-Path -Path $ProjectRoot -ChildPath "frontend"
$OpenApiFile = Join-Path -Path $BackendPath -ChildPath "openapi.yaml"

if (-not (Test-Path $VenvPath)) { Write-Error "Backend venv not found: $VenvPath"; exit 1 }
Write-Host "Activating backend venv..."
& $VenvPath
Write-Host "Generating OpenAPI schema (openapi.yaml)..."
Push-Location $BackendPath
python manage.py spectacular --color --file $OpenApiFile
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate OpenAPI schema."; Pop-Location; exit 1 }
Pop-Location
Write-Host "OpenAPI schema generated: $OpenApiFile"

if (-not (Test-Path (Join-Path $FrontendPath "package.json"))) { Write-Error "frontend package.json not found"; exit 1 }
Write-Host "Generating TypeScript API client for frontend..."
Push-Location $FrontendPath
npm run generate-api
if ($LASTEXITCODE -ne 0) { Write-Error "Failed to generate frontend API client."; Pop-Location; exit 1 }
Pop-Location
Write-Host "API client generation complete."
Read-Host -Prompt "Press Enter to exit"
