param(
    [string]$PackageDir = "offline-packages\tgz"
)

Write-Host "Starting offline package installation..." -ForegroundColor Green

if (-not (Test-Path $PackageDir)) {
    Write-Host "Error: Package directory not found: $PackageDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found" -ForegroundColor Red
    exit 1
}

if (Test-Path "node_modules") {
    Write-Host "Cleaning existing node_modules..." -ForegroundColor Yellow
    Remove-Item "node_modules" -Recurse -Force
}

$tgzFiles = Get-ChildItem "$PackageDir\*.tgz"
Write-Host "Found $($tgzFiles.Count) tgz files" -ForegroundColor Yellow

if ($tgzFiles.Count -eq 0) {
    Write-Host "Error: No tgz files found in $PackageDir" -ForegroundColor Red
    exit 1
}

$installed = 0
$failed = 0
$failedPackages = @()

foreach ($tgzFile in $tgzFiles) {
    Write-Host "Installing: $($tgzFile.Name)" -ForegroundColor Cyan
    
    $result = & npm install $tgzFile.FullName --no-save --legacy-peer-deps 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $installed++
        Write-Host "Success: $($tgzFile.Name)" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "Failed: $($tgzFile.Name)" -ForegroundColor Red
        
        $failedPackages += @{
            PackageName = $tgzFile.Name
            ErrorOutput = $result
            ExitCode = $LASTEXITCODE
        }
        
        Write-Host "   Exit Code: $LASTEXITCODE" -ForegroundColor Yellow
        Write-Host "   Error Details:" -ForegroundColor Yellow
        
        $errorLines = $result | Where-Object { $_ -match "(error|Error|ERROR|WARN|warn|Warn)" }
        if ($errorLines) {
            foreach ($errorLine in $errorLines) {
                Write-Host "     $errorLine" -ForegroundColor Gray
            }
        } else {
            $lastLines = $result | Select-Object -Last 5
            foreach ($line in $lastLines) {
                if ($line.Trim() -ne "") {
                    Write-Host "     $line" -ForegroundColor Gray
                }
            }
        }
        Write-Host ""
    }
}

Write-Host ""
Write-Host "Installation Summary:" -ForegroundColor Green
Write-Host "Successfully installed: $installed packages" -ForegroundColor Green
Write-Host "Failed: $failed packages" -ForegroundColor Red

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "=== Detailed Failure Report ===" -ForegroundColor Red
    Write-Host ""
    
    for ($i = 0; $i -lt $failedPackages.Count; $i++) {
        $failedPkg = $failedPackages[$i]
        Write-Host "[$($i + 1)] Package: $($failedPkg.PackageName)" -ForegroundColor Red
        Write-Host "    Exit Code: $($failedPkg.ExitCode)" -ForegroundColor Yellow
        
        if ($failedPkg.PackageName -match "^(.+?)-(\d+\.\d+\.\d+.*?)\.tgz$") {
            $packageName = $matches[1]
            $packageVersion = $matches[2]
            Write-Host "    Package Name: $packageName" -ForegroundColor Cyan
            Write-Host "    Version: $packageVersion" -ForegroundColor Cyan
        }
        
        $errorOutput = $failedPkg.ErrorOutput -join "`n"
        
        if ($errorOutput -match "ENOENT|not found") {
            Write-Host "    Error Type: File or dependency not found" -ForegroundColor Magenta
        } elseif ($errorOutput -match "EACCES|permission") {
            Write-Host "    Error Type: Permission issue" -ForegroundColor Magenta
        } elseif ($errorOutput -match "peer dep|peerDependencies") {
            Write-Host "    Error Type: Peer dependency conflict" -ForegroundColor Magenta
        } elseif ($errorOutput -match "version conflict|conflicting") {
            Write-Host "    Error Type: Version conflict" -ForegroundColor Magenta
        } elseif ($errorOutput -match "network|timeout|fetch") {
            Write-Host "    Error Type: Network issue" -ForegroundColor Magenta
        } else {
            Write-Host "    Error Type: Unknown error" -ForegroundColor Magenta
        }
        
        $criticalErrors = $failedPkg.ErrorOutput | Where-Object { 
            $_ -match "(npm ERR!|Error:|ENOENT|EACCES|peer dep|version conflict)" 
        } | Select-Object -First 3
        
        if ($criticalErrors) {
            Write-Host "    Critical Error Messages:" -ForegroundColor Yellow
            foreach ($error in $criticalErrors) {
                $cleanError = $error.Trim() -replace "^npm ERR! ", ""
                Write-Host "      - $cleanError" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
    }
    
    Write-Host "Suggested Solutions:" -ForegroundColor Yellow
    Write-Host "1. Check network connection and npm configuration" -ForegroundColor White
    Write-Host "2. Try clearing npm cache: npm cache clean --force" -ForegroundColor White
    Write-Host "3. Check Node.js and npm version compatibility" -ForegroundColor White
    Write-Host "4. Manually install failed packages for debugging" -ForegroundColor White
    Write-Host ""
    
    $logFile = "install-errors-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
    $logContent = @()
    $logContent += "Offline Installation Error Log - $(Get-Date)"
    $logContent += "=" * 50
    $logContent += ""
    $logContent += "Total: $($tgzFiles.Count) packages"
    $logContent += "Success: $installed packages"
    $logContent += "Failed: $failed packages"
    $logContent += ""
    
    for ($i = 0; $i -lt $failedPackages.Count; $i++) {
        $failedPkg = $failedPackages[$i]
        $logContent += "[$($i + 1)] Failed Package: $($failedPkg.PackageName)"
        $logContent += "Exit Code: $($failedPkg.ExitCode)"
        $logContent += "Complete Error Output:"
        $logContent += "-" * 30
        $logContent += $failedPkg.ErrorOutput
        $logContent += "-" * 30
        $logContent += ""
    }
    
    $logContent | Out-File -FilePath $logFile -Encoding UTF8
    Write-Host "Detailed error log saved to: $logFile" -ForegroundColor Cyan
}

if (Test-Path "node_modules") {
    $nodeModulesCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host ""
    Write-Host "node_modules created with $nodeModulesCount packages" -ForegroundColor Green
    
    $size = (Get-ChildItem "node_modules" -Recurse | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [math]::Round($size / 1MB, 2)
    Write-Host "node_modules size: $sizeMB MB" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "node_modules directory not created" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Offline installation completed!" -ForegroundColor Green