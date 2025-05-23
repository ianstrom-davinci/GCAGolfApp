# build_frontend.ps1
$ProjectRoot = $PSScriptRoot | Split-Path
$FrontendPath = Join-Path -Path $ProjectRoot -ChildPath "frontend"
if (-not (Test-Path (Join-Path $FrontendPath "package.json"))) { Write-Error "package.json not found in $FrontendPath"; exit 1 }
Write-Host "Building React frontend..."
Push-Location $FrontendPath
npm run build
Pop-Location
Write-Host "Frontend build complete in frontend\build."
Read-Host -Prompt "Press Enter to exit"
