# PowerShell Chinese Encoding Configuration Script
# Solve PowerShell Chinese display garbled characters problem

param(
    [switch]$Permanent,
    [switch]$ShowCurrent,
    [switch]$Reset
)

# Color output function
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# Show current encoding settings
function Show-CurrentEncoding {
    Write-ColorOutput "=== Current Encoding Settings ===" "Cyan"
    Write-ColorOutput "Console Input Encoding: $([Console]::InputEncoding.EncodingName)" "Yellow"
    Write-ColorOutput "Console Output Encoding: $([Console]::OutputEncoding.EncodingName)" "Yellow"
    Write-ColorOutput "PowerShell Output Encoding: $($OutputEncoding.EncodingName)" "Yellow"
    Write-ColorOutput "System Default Encoding: $([System.Text.Encoding]::Default.EncodingName)" "Yellow"
    Write-ColorOutput "Current Code Page: $(chcp.com)" "Yellow"
    Write-ColorOutput ""
}

# Configure Chinese encoding
function Set-ChineseEncoding {
    Write-ColorOutput "=== Configure PowerShell Chinese Encoding ===" "Cyan"
    
    try {
        # Set console encoding to UTF-8
        Write-ColorOutput "[1/5] Setting console encoding to UTF-8..." "Yellow"
        [Console]::InputEncoding = [System.Text.Encoding]::UTF8
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Write-ColorOutput "Console encoding configured successfully" "Green"
        
        # Set PowerShell output encoding
        Write-ColorOutput "[2/5] Setting PowerShell output encoding..." "Yellow"
        $global:OutputEncoding = [System.Text.Encoding]::UTF8
        Write-ColorOutput "PowerShell output encoding configured successfully" "Green"
        
        # Set code page to UTF-8
        Write-ColorOutput "[3/5] Setting code page to UTF-8..." "Yellow"
        chcp 65001 | Out-Null
        Write-ColorOutput "Code page configured successfully" "Green"
        
        # Set file system encoding
        Write-ColorOutput "[4/5] Configuring file system encoding..." "Yellow"
        $PSDefaultParameterValues['*:Encoding'] = 'utf8'
        Write-ColorOutput "File system encoding configured successfully" "Green"
        
        # Test Chinese display
        Write-ColorOutput "[5/5] Testing Chinese display..." "Yellow"
        Write-ColorOutput "Test Chinese characters: Hello World" "Magenta"
        Write-ColorOutput "Test special characters: 12345" "Magenta"
        Write-ColorOutput "Chinese encoding configuration completed successfully" "Green"
        
    }
    catch {
        Write-ColorOutput "Encoding configuration failed: $($_.Exception.Message)" "Red"
        return $false
    }
    
    return $true
}

# Create PowerShell profile
function Set-PermanentEncoding {
    Write-ColorOutput "=== Create Permanent Configuration ===" "Cyan"
    
    # Get PowerShell profile path
    $profilePath = $PROFILE.CurrentUserCurrentHost
    $profileDir = Split-Path $profilePath -Parent
    
    Write-ColorOutput "Profile path: $profilePath" "Gray"
    
    # Create profile directory if not exists
    if (-not (Test-Path $profileDir)) {
        Write-ColorOutput "Creating profile directory..." "Yellow"
        New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    }
    
    # Chinese encoding configuration content
    $encodingConfig = @"
# PowerShell Chinese Encoding Configuration
# Auto-generated at: $(Get-Date)

# Set console encoding to UTF-8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Set PowerShell output encoding
`$OutputEncoding = [System.Text.Encoding]::UTF8

# Set default file encoding
`$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Set code page to UTF-8
chcp 65001 | Out-Null

# Display encoding configuration info
Write-Host "PowerShell Chinese encoding configured" -ForegroundColor Green

"@
    
    try {
        # Check if configuration already exists
        $existingContent = ""
        if (Test-Path $profilePath) {
            $existingContent = Get-Content $profilePath -Raw -ErrorAction SilentlyContinue
        }
        
        # Remove existing encoding configuration if present
        if ($existingContent -match "PowerShell Chinese Encoding Configuration") {
            Write-ColorOutput "Removing existing encoding configuration..." "Yellow"
            $lines = $existingContent -split "`n"
            $newLines = @()
            $skipMode = $false
            
            foreach ($line in $lines) {
                if ($line -match "# PowerShell Chinese Encoding Configuration") {
                    $skipMode = $true
                    continue
                }
                if ($skipMode -and $line -match "Write-Host.*PowerShell Chinese encoding configured") {
                    $skipMode = $false
                    continue
                }
                if (-not $skipMode) {
                    $newLines += $line
                }
            }
            
            $existingContent = $newLines -join "`n"
        }
        
        # Add new encoding configuration
        $newContent = $existingContent + "`n" + $encodingConfig
        
        # Write to profile file
        $newContent | Out-File -FilePath $profilePath -Encoding UTF8 -Force
        
        Write-ColorOutput "Permanent configuration saved to: $profilePath" "Green"
        Write-ColorOutput "Configuration will take effect after restarting PowerShell" "Cyan"
        
        return $true
    }
    catch {
        Write-ColorOutput "Failed to save permanent configuration: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Reset encoding settings
function Reset-Encoding {
    Write-ColorOutput "=== Reset Encoding Settings ===" "Cyan"
    
    try {
        # Reset console encoding
        Write-ColorOutput "Resetting console encoding..." "Yellow"
        [Console]::InputEncoding = [System.Text.Encoding]::Default
        [Console]::OutputEncoding = [System.Text.Encoding]::Default
        
        # Reset PowerShell output encoding
        Write-ColorOutput "Resetting PowerShell output encoding..." "Yellow"
        $global:OutputEncoding = [System.Text.Encoding]::ASCII
        
        # Reset code page
        Write-ColorOutput "Resetting code page..." "Yellow"
        chcp 936 | Out-Null  # Chinese GBK code page
        
        # Remove file encoding setting
        Write-ColorOutput "Removing file encoding setting..." "Yellow"
        $PSDefaultParameterValues.Remove('*:Encoding')
        
        Write-ColorOutput "Encoding settings have been reset" "Green"
        
        return $true
    }
    catch {
        Write-ColorOutput "Reset failed: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Remove permanent configuration
function Remove-PermanentEncoding {
    $profilePath = $PROFILE.CurrentUserCurrentHost
    
    if (Test-Path $profilePath) {
        try {
            $content = Get-Content $profilePath -Raw
            
            if ($content -match "PowerShell Chinese Encoding Configuration") {
                Write-ColorOutput "Removing permanent configuration..." "Yellow"
                
                $lines = $content -split "`n"
                $newLines = @()
                $skipMode = $false
                
                foreach ($line in $lines) {
                    if ($line -match "# PowerShell Chinese Encoding Configuration") {
                        $skipMode = $true
                        continue
                    }
                    if ($skipMode -and $line -match "Write-Host.*PowerShell Chinese encoding configured") {
                        $skipMode = $false
                        continue
                    }
                    if (-not $skipMode) {
                        $newLines += $line
                    }
                }
                
                $newContent = ($newLines -join "`n").Trim()
                
                if ($newContent) {
                    $newContent | Out-File -FilePath $profilePath -Encoding UTF8 -Force
                } else {
                    Remove-Item $profilePath -Force
                }
                
                Write-ColorOutput "Permanent configuration removed" "Green"
            } else {
                Write-ColorOutput "No encoding configuration found" "Cyan"
            }
        }
        catch {
            Write-ColorOutput "Failed to remove configuration: $($_.Exception.Message)" "Red"
        }
    } else {
        Write-ColorOutput "Profile file does not exist" "Cyan"
    }
}

# Show help information
function Show-Help {
    Write-ColorOutput "PowerShell Chinese Encoding Configuration Tool" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Usage:" "Yellow"
    Write-ColorOutput "  .\configure-powershell-chinese.ps1 [parameters]" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Parameters:" "Yellow"
    Write-ColorOutput "  -ShowCurrent    Show current encoding settings" "White"
    Write-ColorOutput "  -Permanent      Create permanent configuration (write to PowerShell profile)" "White"
    Write-ColorOutput "  -Reset          Reset encoding settings to default" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" "Yellow"
    Write-ColorOutput "  .\configure-powershell-chinese.ps1                # Temporary Chinese encoding configuration" "White"
    Write-ColorOutput "  .\configure-powershell-chinese.ps1 -Permanent     # Permanent Chinese encoding configuration" "White"
    Write-ColorOutput "  .\configure-powershell-chinese.ps1 -ShowCurrent   # Show current encoding" "White"
    Write-ColorOutput "  .\configure-powershell-chinese.ps1 -Reset         # Reset encoding settings" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Notes:" "Yellow"
    Write-ColorOutput "  • Temporary configuration is only valid for current session" "Gray"
    Write-ColorOutput "  • Permanent configuration modifies PowerShell profile, takes effect after restart" "Gray"
    Write-ColorOutput "  • Recommend testing temporary configuration first" "Gray"
}

# Main function
function Main {
    # Check help parameters
    if ($args -contains "-help" -or $args -contains "--help" -or $args -contains "-h") {
        Show-Help
        return
    }
    
    Write-ColorOutput "PowerShell Chinese Encoding Configuration Tool" "Cyan"
    Write-ColorOutput "============================================" "Cyan"
    Write-ColorOutput ""
    
    # Show current encoding
    if ($ShowCurrent) {
        Show-CurrentEncoding
        return
    }
    
    # Reset encoding
    if ($Reset) {
        if (Reset-Encoding) {
            Remove-PermanentEncoding
            Write-ColorOutput ""
            Write-ColorOutput "Encoding settings reset, recommend restarting PowerShell" "Cyan"
        }
        return
    }
    
    # Show current encoding (before configuration)
    Write-ColorOutput "Encoding settings before configuration:" "Gray"
    Show-CurrentEncoding
    
    # Configure Chinese encoding
    if (Set-ChineseEncoding) {
        Write-ColorOutput ""
        Write-ColorOutput "Encoding settings after configuration:" "Gray"
        Show-CurrentEncoding
        
        # Permanent configuration
        if ($Permanent) {
            Write-ColorOutput ""
            if (Set-PermanentEncoding) {
                Write-ColorOutput ""
                Write-ColorOutput "=== Configuration Complete ===" "Green"
                Write-ColorOutput "Chinese encoding permanently configured, will take effect after restarting PowerShell" "Green"
            }
        } else {
            Write-ColorOutput ""
            Write-ColorOutput "=== Temporary Configuration Complete ===" "Green"
            Write-ColorOutput "Chinese encoding configured for current session" "Green"
            Write-ColorOutput "For permanent configuration, run: .\configure-powershell-chinese.ps1 -Permanent" "Cyan"
        }
        
        Write-ColorOutput ""
        Write-ColorOutput "Test suggestions:" "Yellow"
        Write-ColorOutput "1. Try outputting Chinese: Write-Host '你好世界'" "White"
        Write-ColorOutput "2. Try creating Chinese file: '测试内容' | Out-File test-chinese.txt" "White"
        Write-ColorOutput "3. Try reading Chinese file: Get-Content test-chinese.txt" "White"
    }
}

# Execute main function
Main