# Download all npm dependencies as tgz files for offline installation

$ErrorActionPreference = "Continue"

# Create offline packages directory
$offlineDir = "offline-packages"
if (Test-Path $offlineDir) {
    Remove-Item $offlineDir -Recurse -Force
}
New-Item -ItemType Directory -Path $offlineDir -Force | Out-Null
New-Item -ItemType Directory -Path "$offlineDir\tgz" -Force | Out-Null

Write-Host "Starting offline package download..." -ForegroundColor Green

# Read package.json
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    exit 1
}

$packageContent = Get-Content "package.json" | ConvertFrom-Json
$allDeps = @()

# Collect all dependencies
if ($packageContent.dependencies) {
    foreach ($dep in $packageContent.dependencies.PSObject.Properties) {
        $allDeps += @{ name = $dep.Name; version = $dep.Value }
    }
}

if ($packageContent.devDependencies) {
    foreach ($dep in $packageContent.devDependencies.PSObject.Properties) {
        $allDeps += @{ name = $dep.Name; version = $dep.Value }
    }
}

Write-Host "Found $($allDeps.Count) main dependencies" -ForegroundColor Yellow

# Enter offline packages directory
Set-Location $offlineDir

# Download main dependencies
$downloadedPackages = @()
$failedPackages = @()

foreach ($dep in $allDeps) {
    $packageName = $dep.name
    $packageVersion = $dep.version
    
    Write-Host "Downloading: $packageName@$packageVersion" -ForegroundColor Cyan
    
    try {
        $result = npm pack "$packageName@$packageVersion" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $tgzFiles = Get-ChildItem "*.tgz"
            foreach ($tgzFile in $tgzFiles) {
                Move-Item $tgzFile.FullName "tgz\" -Force
                $downloadedPackages += "$packageName@$packageVersion"
            }
        } else {
            $failedPackages += "$packageName@$packageVersion"
            Write-Host "  Failed: $packageName@$packageVersion" -ForegroundColor Red
        }
    } catch {
        $failedPackages += "$packageName@$packageVersion"
        Write-Host "  Error: $packageName@$packageVersion" -ForegroundColor Red
    }
}

# Try to get transitive dependencies
Write-Host "Getting transitive dependencies..." -ForegroundColor Yellow

try {
    npm install --package-lock-only --no-audit --no-fund 2>&1 | Out-Null
    
    if (Test-Path "package-lock.json") {
        $lockContent = Get-Content "package-lock.json" | ConvertFrom-Json
        
        if ($lockContent.packages) {
            $transitiveDeps = @()
            foreach ($pkg in $lockContent.packages.PSObject.Properties) {
                if ($pkg.Name -like "node_modules/*") {
                    $depName = $pkg.Name -replace "^node_modules/", ""
                    $depVersion = $pkg.Value.version
                    if ($depVersion -and $depName -notin ($allDeps | ForEach-Object { $_.name })) {
                        $transitiveDeps += @{ name = $depName; version = $depVersion }
                    }
                }
            }
            
            Write-Host "Found $($transitiveDeps.Count) transitive dependencies" -ForegroundColor Yellow
            
            $maxTransitive = [Math]::Min($transitiveDeps.Count, 30)
            for ($i = 0; $i -lt $maxTransitive; $i++) {
                $dep = $transitiveDeps[$i]
                $packageName = $dep.name
                $packageVersion = $dep.version
                
                Write-Host "Downloading transitive: $packageName@$packageVersion" -ForegroundColor DarkCyan
                
                try {
                    $result = npm pack "$packageName@$packageVersion" 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        $tgzFiles = Get-ChildItem "*.tgz"
                        foreach ($tgzFile in $tgzFiles) {
                            Move-Item $tgzFile.FullName "tgz\" -Force
                            $downloadedPackages += "$packageName@$packageVersion (transitive)"
                        }
                    }
                } catch {
                    Write-Host "  Transitive download failed: $packageName@$packageVersion" -ForegroundColor DarkRed
                }
            }
        }
    }
} catch {
    Write-Host "Failed to get transitive dependencies, downloading main dependencies only" -ForegroundColor Yellow
}

# Generate package list file
$downloadedPackages | Out-File "package-list.txt" -Encoding UTF8

# Clean up temporary files
if (Test-Path "package-lock.json") {
    Remove-Item "package-lock.json" -Force
}
if (Test-Path "node_modules") {
    Remove-Item "node_modules" -Recurse -Force
}

# Return to parent directory
Set-Location ..

Write-Host "Offline package download completed!" -ForegroundColor Green
Write-Host "Successfully downloaded: $($downloadedPackages.Count) packages" -ForegroundColor Green
Write-Host "Failed: $($failedPackages.Count) packages" -ForegroundColor Red
Write-Host "All tgz files saved in: $offlineDir\tgz\" -ForegroundColor Yellow
Write-Host "Package list file: $offlineDir\package-list.txt" -ForegroundColor Yellow

# Show directory size
if (Test-Path "$offlineDir\tgz") {
    $tgzFiles = Get-ChildItem "$offlineDir\tgz" -File
    $totalSize = ($tgzFiles | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "Total size: $sizeMB MB ($($tgzFiles.Count) files)" -ForegroundColor Cyan
}

Write-Host "Usage instructions:" -ForegroundColor Yellow
Write-Host "1. Copy the $offlineDir folder to target environment" -ForegroundColor White
Write-Host "2. Run install-offline-packages.ps1 script in target environment" -ForegroundColor White
Write-Host "3. Or manually use: npm install path/to/package.tgz" -ForegroundColor White

if ($failedPackages.Count -gt 0) {
    Write-Host "Failed packages:" -ForegroundColor Red
    $failedPackages | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
}