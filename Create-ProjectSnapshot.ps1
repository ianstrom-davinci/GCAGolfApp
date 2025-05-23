<#
.SYNOPSIS
    Creates a snapshot of the GCAGolfApp project, including a project summary,
    and the content of meaningful source code and configuration files.
    Excludes virtual environments, node_modules, build artifacts, etc.

.DESCRIPTION
    This script should be run from within the root directory of the GCAGolfApp project.
    It generates a single text file named "GCAGolfApp_Snapshot.txt" in the project root,
    containing a summary of the project's goal and the concatenated content of key files.

.EXAMPLE
    PS C:\Users\IanStrom\DevelopmentProjects\GCAGolfApp> .\Create-ProjectSnapshot.ps1
    This will create GCAGolfApp_Snapshot.txt in the current directory.
#>

param (
    # The root path of the GCAGolfApp project. Defaults to the current directory.
    [string]$ProjectRootPath = (Get-Location).Path,
    # The name of the output snapshot file.
    [string]$OutputFileName = "GCAGolfApp_Snapshot.txt"
)

$OutputFilePath = Join-Path -Path $ProjectRootPath -ChildPath $OutputFileName

# Define project goal summary
$projectGoal = @"
The GCAGolfApp is a web application designed to capture golf launch monitor metrics. 
It uses OpenCV and Pytesseract (in a separate, future script) to parse a display screen, 
extract numerical data (like ball speed, spin rate, launch angle, club head speed, 
carry distance, total distance), and save this data to a PostgreSQL database. 
The application features a Django backend API and a React frontend. 
Users can create and delete sessions of golf shots, and view shot data in a sortable,
resizable table. The current setup focuses on native Windows 11 deployment 
without Docker, using Nginx as a web server.
"@

# Initialize output file with header and project goal
$fileHeader = "# Project: GCAGolfApp Snapshot"
$fileHeader += "`n# Date: $(Get-Date)"
$fileHeader += "`n# Project Root Path: $ProjectRootPath"
$fileHeader += "`n`n# Project Goal Summary`n----------------------`n$projectGoal"
$fileHeader += "`n`n# ===================================`n# FILE CONTENTS`n# ==================================="
Set-Content -Path $OutputFilePath -Value $fileHeader -Encoding UTF8

Write-Host "Starting project snapshot creation for: $ProjectRootPath"
Write-Host "Output will be saved to: $OutputFilePath"

# Define directories to completely exclude from scanning
$excludeDirs = @(
    "venv_backend",
    ".venv",        # Common alternative name for virtual environments
    "node_modules",
    "frontend\build", # Path relative to ProjectRootPath
    "__pycache__",
    ".git",
    ".idea",        # Common IDE folder
    "dist",         # Common build output folder
    "build"         # Common build output folder (generic)
)

# Define specific files or patterns to include. Paths are relative to ProjectRootPath.
# For patterns with subdirectories, ensure they are specific enough or handle recursion carefully.
$includeFilePatterns = @(
    # Root project files
    ".gitignore", 
    "README.md",
    # Backend files
    "backend\manage.py", 
    "backend\requirements.txt", 
    "backend\.env.backend.example", 
    "backend\openapi.yaml",
    "backend\gcagolfapp_backend\settings.py",
    "backend\gcagolfapp_backend\urls.py",
    "backend\gcagolfapp_backend\wsgi.py",
    "backend\gcagolfapp_backend\asgi.py",
    "backend\gcagolfapp_backend\__init__.py",
    "backend\golf_metrics_app\models.py",
    "backend\golf_metrics_app\views.py",
    "backend\golf_metrics_app\serializers.py",
    "backend\golf_metrics_app\urls.py",
    "backend\golf_metrics_app\admin.py",
    "backend\golf_metrics_app\apps.py",
    "backend\golf_metrics_app\__init__.py",
    "backend\golf_metrics_app\migrations\*_initial.py", # Only the first migration for brevity
    # Frontend files
    "frontend\package.json", 
    "frontend\tsconfig.json", 
    "frontend\.env.frontend.example",
    "frontend\public\index.html", 
    "frontend\public\manifest.json", 
    "frontend\public\GCAGolfLogo.png", # Assuming this is the logo you added
    "frontend\public\logo192.png",     # If you renamed/created this
    "frontend\public\logo512.png",     # If you created this
    "frontend\public\favicon.ico",     # Standard favicon
    "frontend\src\App.tsx", 
    "frontend\src\index.tsx", 
    "frontend\src\App.css", 
    "frontend\src\index.css", 
    "frontend\src\reportWebVitals.ts",
    "frontend\src\api-client\gcagolfapp.ts",
    # Nginx configuration
    "nginx\conf\nginx.conf", 
    "nginx\conf\mime.types",
    # Helper scripts
    "scripts\*.ps1", 
    "scripts\*.bat"
)

# Get all files in the project directory recursively
$allFiles = Get-ChildItem -Path $ProjectRootPath -Recurse -File -ErrorAction SilentlyContinue

$processedFilesCount = 0

# Process and append content of relevant files
foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Substring($ProjectRootPath.Length).TrimStart("\")

    # Check if the file is within an excluded directory
    $isExcluded = $false
    foreach ($dirToExclude in $excludeDirs) {
        $fullExcludePath = Join-Path -Path $ProjectRootPath -ChildPath $dirToExclude
        if ($file.FullName.StartsWith($fullExcludePath, [System.StringComparison]::OrdinalIgnoreCase)) {
            $isExcluded = $true
            break
        }
    }
    if ($isExcluded) {
        continue # Skip this file
    }

    # Check if the file matches any of the include patterns
    $isIncluded = $false
    foreach ($pattern in $includeFilePatterns) {
        # For frontend/src/components, we need a more specific check if using **
        # The current patterns are specific enough or use simple wildcards.
        if ($relativePath -like $pattern) {
            $isIncluded = $true
            break
        }
    }
    
    # Special handling for files within frontend/src/components (if any)
    # This assumes components are .tsx or .ts files.
    if (-not $isIncluded -and $relativePath.StartsWith("frontend\src\components\", [System.StringComparison]::OrdinalIgnoreCase) `
        -and ($relativePath.EndsWith(".tsx", [System.StringComparison]::OrdinalIgnoreCase) -or $relativePath.EndsWith(".ts", [System.StringComparison]::OrdinalIgnoreCase)) ) {
        $isIncluded = $true
    }


    if ($isIncluded) {
        Write-Verbose "Processing file: $relativePath"
        Add-Content -Path $OutputFilePath -Value "`n`n# File: $relativePath" -Encoding UTF8
        Add-Content -Path $OutputFilePath -Value "# $(('-')*($relativePath.Length + 7))" -Encoding UTF8 # Dashed line
        
        try {
            # For known non-text files like PNG, just note their presence.
            if ($file.Extension -eq ".png" -or $file.Extension -eq ".ico") {
                 Add-Content -Path $OutputFilePath -Value "[Binary file: $relativePath - Content not included]" -Encoding UTF8
            } else {
                $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
                Add-Content -Path $OutputFilePath -Value $content -Encoding UTF8
            }
        } catch {
            Add-Content -Path $OutputFilePath -Value "## ERROR: Could not read content for $relativePath ##" -Encoding UTF8
            Add-Content -Path $OutputFilePath -Value "## Error details: $($_.Exception.Message) ##" -Encoding UTF8
        }
        
        Add-Content -Path $OutputFilePath -Value "# $(('-')*($relativePath.Length + 7))" -Encoding UTF8
        Add-Content -Path $OutputFilePath -Value "# END File: $relativePath" -Encoding UTF8
        $processedFilesCount++
    }
}

Add-Content -Path $OutputFilePath -Value "`n`n# ===================================`n# END OF SNAPSHOT`n# ===================================" -Encoding UTF8
Write-Host "Snapshot complete. Processed $processedFilesCount relevant files."
Write-Host "Project snapshot saved to: $OutputFilePath"
