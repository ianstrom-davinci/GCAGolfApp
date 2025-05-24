# start-development.ps1 - Start GCAGolfApp Backend and Frontend
# Place this file in the root of your GCAGolfApp project

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$Production,
    [switch]$Fresh
)

$ProjectRoot = $PSScriptRoot
$VenvPath = Join-Path -Path $ProjectRoot -ChildPath "venv_backend\Scripts\Activate.ps1"
$BackendPath = Join-Path -Path $ProjectRoot -ChildPath "backend"
$FrontendPath = Join-Path -Path $ProjectRoot -ChildPath "frontend"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    $issues = @()

    # Check if virtual environment exists
    if (-not (Test-Path $VenvPath)) {
        $issues += "Virtual environment not found at: $VenvPath"
    }

    # Check if backend folder exists
    if (-not (Test-Path $BackendPath)) {
        $issues += "Backend folder not found at: $BackendPath"
    }

    # Check if frontend folder exists
    if (-not (Test-Path $FrontendPath)) {
        $issues += "Frontend folder not found at: $FrontendPath"
    }

    # Check if package.json exists
    if (-not (Test-Path (Join-Path $FrontendPath "package.json"))) {
        $issues += "Frontend package.json not found. Run 'npm install' in frontend folder first."
    }

    # Check if .env.backend exists
    if (-not (Test-Path (Join-Path $BackendPath ".env.backend"))) {
        $issues += "Backend .env.backend not found. Run '.\scripts\setup_env_files.ps1' first."
    }

    return $issues
}

function Start-Backend {
    param([bool]$ProductionMode = $false)

    if ($ProductionMode) {
        $backendScript = @"
Write-Host 'Starting GCAGolfApp Backend (Production - Waitress)...' -ForegroundColor Green
Set-Location '$BackendPath'
& '$VenvPath'
Write-Host 'Virtual environment activated' -ForegroundColor Yellow
Write-Host 'Starting Waitress server...' -ForegroundColor Yellow
waitress-serve --port=8000 gcagolfapp_backend.wsgi:application
"@
    } else {
        $backendScript = @"
Write-Host 'Starting GCAGolfApp Backend (Development)...' -ForegroundColor Green
Set-Location '$BackendPath'
& '$VenvPath'
Write-Host 'Virtual environment activated' -ForegroundColor Yellow
Write-Host 'Starting Django development server...' -ForegroundColor Yellow
python manage.py runserver
"@
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
}

function Start-Frontend {
    param([bool]$ProductionMode = $false, [bool]$FreshBuild = $false)

    # Determine which command to run
    if ($FreshBuild) {
        $frontendCommand = "npm run build"
        $mode = "Fresh Build"
    } elseif ($ProductionMode) {
        $frontendCommand = "npm run build"
        $mode = "Production Build"
    } else {
        $frontendCommand = "npm start"
        $mode = "Development"
    }

    $frontendScript = @"
Write-Host 'Starting GCAGolfApp Frontend ($mode)...' -ForegroundColor Blue
Set-Location '$FrontendPath'
Write-Host 'Checking for node_modules...' -ForegroundColor Yellow
if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing npm dependencies...' -ForegroundColor Yellow
    npm install
}
Write-Host 'Running: $frontendCommand' -ForegroundColor Yellow
$frontendCommand
"@

    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
}

# Main execution
Write-ColorOutput "=== GCAGolfApp Development Startup ===" "Cyan"
if ($Fresh) {
    Write-ColorOutput "Fresh Build Mode Enabled" "Magenta"
}
Write-ColorOutput "Project Root: $ProjectRoot" "Gray"

# Check prerequisites
$issues = Test-Prerequisites
if ($issues.Count -gt 0) {
    Write-ColorOutput "Setup Issues Found:" "Red"
    foreach ($issue in $issues) {
        Write-ColorOutput "   • $issue" "Yellow"
    }
    Write-ColorOutput "" "White"
    Write-ColorOutput "Please resolve these issues before starting the application." "Red"
    Write-ColorOutput "" "White"
    Write-ColorOutput "Quick setup commands:" "Cyan"
    Write-ColorOutput "   1. Create venv: python -m venv venv_backend" "White"
    Write-ColorOutput "   2. Setup env files: .\scripts\setup_env_files.ps1" "White"
    Write-ColorOutput "   3. Install backend deps: .\venv_backend\Scripts\activate; pip install -r backend\requirements.txt" "White"
    Write-ColorOutput "   4. Install frontend deps: cd frontend; npm install" "White"
    Read-Host "Press Enter to exit"
    exit 1
}

# Determine what to start
$startBackend = $Backend -or (-not $Backend -and -not $Frontend)
$startFrontend = $Frontend -or (-not $Backend -and -not $Frontend)

if ($startBackend) {
    Write-ColorOutput "Starting Backend..." "Green"
    Start-Backend -ProductionMode $Production
    Start-Sleep -Seconds 2
}

if ($startFrontend) {
    Write-ColorOutput "Starting Frontend..." "Blue"
    if ($Fresh) {
        Write-ColorOutput "Fresh build will clear node_modules and reinstall..." "Magenta"
    }
    Start-Frontend -ProductionMode $Production -FreshBuild $Fresh
    Start-Sleep -Seconds 2
}

if ($startBackend -and $startFrontend) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "Both services are starting in separate windows!" "Green"
    Write-ColorOutput "Backend will be available at: http://localhost:8000" "Cyan"
    Write-ColorOutput "Frontend will be available at: http://localhost:3000" "Cyan"
    Write-ColorOutput "API Documentation: http://localhost:8000/api/schema/swagger-ui/" "Cyan"
} elseif ($startBackend) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "Backend is starting!" "Green"
    Write-ColorOutput "Backend will be available at: http://localhost:8000" "Cyan"
} elseif ($startFrontend) {
    Write-ColorOutput "" "White"
    Write-ColorOutput "Frontend is starting!" "Blue"
    Write-ColorOutput "Frontend will be available at: http://localhost:3000" "Cyan"
}

Write-ColorOutput "" "White"
Write-ColorOutput "Usage Examples:" "Gray"
Write-ColorOutput "  .\start-development.ps1              # Start both normally" "Gray"
Write-ColorOutput "  .\start-development.ps1 -Fresh       # Fresh build both" "Gray"
Write-ColorOutput "  .\start-development.ps1 -Frontend    # Frontend only" "Gray"
Write-ColorOutput "  .\start-development.ps1 -Frontend -Fresh  # Fresh frontend only" "Gray"
Write-ColorOutput "  .\start-development.ps1 -Production  # Production mode" "Gray"
Write-ColorOutput "" "White"
Write-ColorOutput "Press Enter to continue..." "Gray"
Read-Host