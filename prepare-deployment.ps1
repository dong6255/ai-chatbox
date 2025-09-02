# AI聊天盒子项目部署包准备脚本
# 用于在有网络的电脑上准备完整的离线部署包

param(
    [string]$OutputPath = "ai-chatbox-deployment",
    [switch]$IncludeCache,
    [switch]$IncludeNodeJs,
    [switch]$CreateZip,
    [switch]$Verbose
)

# 设置错误处理
$ErrorActionPreference = "Stop"

# 颜色输出函数
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

# 检查命令是否存在
function Test-Command {
    param([string]$Command)
    return Get-Command $Command -ErrorAction SilentlyContinue
}

# 获取文件夹大小
function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -File | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

# 主准备函数
function Start-DeploymentPreparation {
    Write-ColorOutput "=== AI聊天盒子项目部署包准备 ===" "Cyan"
    Write-ColorOutput "准备时间: $(Get-Date)" "Gray"
    Write-ColorOutput "输出路径: $OutputPath" "Gray"
    Write-ColorOutput ""

    # 步骤1: 环境检查
    Write-ColorOutput "[1/8] 检查环境..." "Yellow"
    
    # 检查Node.js
    if (-not (Test-Command "node")) {
        Write-ColorOutput "❌ Node.js未安装" "Red"
        exit 1
    }
    
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-ColorOutput "✅ Node.js版本: $nodeVersion" "Green"
    Write-ColorOutput "✅ npm版本: $npmVersion" "Green"
    
    # 检查项目文件
    if (-not (Test-Path "package.json")) {
        Write-ColorOutput "❌ 当前目录不是有效的Node.js项目" "Red"
        exit 1
    }
    
    Write-ColorOutput "✅ 环境检查通过" "Green"

    # 步骤2: 创建输出目录
    Write-ColorOutput "[2/8] 创建输出目录..." "Yellow"
    
    if (Test-Path $OutputPath) {
        Write-ColorOutput "删除现有输出目录..." "Gray"
        Remove-Item $OutputPath -Recurse -Force
    }
    
    New-Item -ItemType Directory -Path $OutputPath -Force | Out-Null
    Write-ColorOutput "✅ 输出目录创建完成: $OutputPath" "Green"

    # 步骤3: 复制项目文件
    Write-ColorOutput "[3/8] 复制项目文件..." "Yellow"
    
    # 定义要排除的目录和文件
    $excludeDirs = @("node_modules", ".git", "dist", "build", $OutputPath)
    $excludeFiles = @("*.log", "*.tmp", ".DS_Store", "Thumbs.db")
    
    # 获取所有文件和目录
    $items = Get-ChildItem -Path "." -Force | Where-Object {
        $item = $_
        $shouldExclude = $false
        
        # 检查目录排除
        if ($item.PSIsContainer) {
            $shouldExclude = $excludeDirs -contains $item.Name
        } else {
            # 检查文件排除
            foreach ($pattern in $excludeFiles) {
                if ($item.Name -like $pattern) {
                    $shouldExclude = $true
                    break
                }
            }
        }
        
        return -not $shouldExclude
    }
    
    foreach ($item in $items) {
        $destPath = Join-Path $OutputPath $item.Name
        
        if ($item.PSIsContainer) {
            Write-ColorOutput "复制目录: $($item.Name)" "Gray"
            robocopy $item.FullName $destPath /E /R:3 /W:1 /NJH /NJS
        } else {
            Write-ColorOutput "复制文件: $($item.Name)" "Gray"
            Copy-Item $item.FullName $destPath -Force
        }
    }
    
    Write-ColorOutput "✅ 项目文件复制完成" "Green"

    # 步骤4: 下载离线包
    Write-ColorOutput "[4/8] 下载离线依赖包..." "Yellow"
    
    if (Test-Path "download-offline-packages.ps1") {
        try {
            Write-ColorOutput "执行离线包下载脚本..." "Gray"
            & ".\download-offline-packages.ps1"
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ 离线包下载完成" "Green"
                
                # 复制离线包到输出目录
                if (Test-Path "offline-packages") {
                    $offlineSize = Get-FolderSize "offline-packages"
                    Write-ColorOutput "离线包大小: ${offlineSize}MB" "Gray"
                    
                    robocopy "offline-packages" "$OutputPath\offline-packages" /E /R:3 /W:1 /NJH /NJS
                    Write-ColorOutput "✅ 离线包已复制到部署目录" "Green"
                }
            } else {
                Write-ColorOutput "⚠️ 离线包下载失败，但继续准备" "Yellow"
            }
        }
        catch {
            Write-ColorOutput "⚠️ 下载过程中发生错误: $($_.Exception.Message)" "Yellow"
        }
    } else {
        Write-ColorOutput "⚠️ 未找到下载脚本，请手动确保离线包完整" "Yellow"
    }

    # 步骤5: 备份npm缓存（可选）
    if ($IncludeCache) {
        Write-ColorOutput "[5/8] 备份npm缓存..." "Yellow"
        
        $cacheSource = npm config get cache
        $cacheTarget = "$OutputPath\npm-cache"
        
        if (Test-Path $cacheSource) {
            Write-ColorOutput "缓存源路径: $cacheSource" "Gray"
            
            try {
                robocopy $cacheSource $cacheTarget /E /R:3 /W:1 /NJH /NJS
                $cacheSize = Get-FolderSize $cacheTarget
                Write-ColorOutput "✅ npm缓存备份完成，大小: ${cacheSize}MB" "Green"
            }
            catch {
                Write-ColorOutput "⚠️ 缓存备份失败: $($_.Exception.Message)" "Yellow"
            }
        } else {
            Write-ColorOutput "⚠️ npm缓存目录不存在" "Yellow"
        }
    } else {
        Write-ColorOutput "[5/8] 跳过缓存备份" "Gray"
    }

    # 步骤6: 下载Node.js安装包（可选）
    if ($IncludeNodeJs) {
        Write-ColorOutput "[6/8] 下载Node.js安装包..." "Yellow"
        
        $nodeVersion = (node --version).TrimStart('v')
        $nodejsDir = "$OutputPath\nodejs-installer"
        New-Item -ItemType Directory -Path $nodejsDir -Force | Out-Null
        
        # 创建Node.js下载说明
        $nodeInfo = @"
# Node.js安装包信息

当前项目使用的Node.js版本: $nodeVersion

## 下载地址
- Windows x64: https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x64.msi
- Windows x86: https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-x86.msi
- Linux x64: https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion-linux-x64.tar.xz
- macOS: https://nodejs.org/dist/v$nodeVersion/node-v$nodeVersion.pkg

## 安装说明
1. 根据目标系统选择对应的安装包
2. 在目标电脑上运行安装包
3. 验证安装: node --version

"@
        
        $nodeInfo | Out-File -FilePath "$nodejsDir\README.md" -Encoding UTF8
        Write-ColorOutput "✅ Node.js安装说明已创建" "Green"
    } else {
        Write-ColorOutput "[6/8] 跳过Node.js安装包" "Gray"
    }

    # 步骤7: 创建部署说明
    Write-ColorOutput "[7/8] 创建部署说明..." "Yellow"
    
    $deploymentInfo = @"
# AI聊天盒子项目部署包

生成时间: $(Get-Date)
Node.js版本: $nodeVersion
npm版本: $npmVersion

## 部署步骤

1. **安装Node.js环境**
   - 在目标电脑上安装Node.js（版本 $nodeVersion 或兼容版本）
   - 验证安装: `node --version` 和 `npm --version`

2. **解压项目文件**
   - 将此部署包解压到目标位置
   - 进入项目目录

3. **自动化部署**
   ```powershell
   # 运行自动化部署脚本
   .\deploy.ps1
   
   # 或者手动部署
   .\install-offline-packages.ps1
   ```

4. **启动项目**
   ```powershell
   # 开发模式
   npm run dev
   
   # 构建生产版本
   npm run build
   npm run preview
   ```

## 文件说明

- `deploy.ps1` - 自动化部署脚本
- `install-offline-packages.ps1` - 离线依赖安装脚本
- `offline-packages/` - 离线依赖包目录
- `offline-deployment-guide.md` - 详细部署指南
$(if ($IncludeCache) { "- `npm-cache/` - npm缓存备份`n" } else { "" })
$(if ($IncludeNodeJs) { "- `nodejs-installer/` - Node.js安装包信息`n" } else { "" })

## 故障排除

如果遇到问题，请参考 `offline-deployment-guide.md` 获取详细的故障排除指南。

"@
    
    $deploymentInfo | Out-File -FilePath "$OutputPath\DEPLOYMENT.md" -Encoding UTF8
    Write-ColorOutput "✅ 部署说明已创建" "Green"

    # 步骤8: 创建压缩包（可选）
    if ($CreateZip) {
        Write-ColorOutput "[8/8] 创建压缩包..." "Yellow"
        
        $zipPath = "$OutputPath.zip"
        
        if (Test-Path $zipPath) {
            Remove-Item $zipPath -Force
        }
        
        try {
            Write-ColorOutput "压缩到: $zipPath" "Gray"
            Compress-Archive -Path $OutputPath -DestinationPath $zipPath -CompressionLevel Optimal
            
            $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
            Write-ColorOutput "✅ 压缩包创建完成，大小: ${zipSize}MB" "Green"
        }
        catch {
            Write-ColorOutput "⚠️ 压缩包创建失败: $($_.Exception.Message)" "Yellow"
        }
    } else {
        Write-ColorOutput "[8/8] 跳过压缩包创建" "Gray"
    }

    # 完成总结
    Write-ColorOutput "" 
    Write-ColorOutput "=== 部署包准备完成 ===" "Green"
    
    $totalSize = Get-FolderSize $OutputPath
    Write-ColorOutput "部署包大小: ${totalSize}MB" "Green"
    Write-ColorOutput "输出位置: $((Get-Item $OutputPath).FullName)" "Green"
    
    if ($CreateZip -and (Test-Path "$OutputPath.zip")) {
        $zipSize = [math]::Round((Get-Item "$OutputPath.zip").Length / 1MB, 2)
        Write-ColorOutput "压缩包大小: ${zipSize}MB" "Green"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "下一步操作:" "Cyan"
    Write-ColorOutput "1. 将部署包传输到目标电脑" "White"
    Write-ColorOutput "2. 在目标电脑上运行 deploy.ps1" "White"
    Write-ColorOutput "3. 或参考 DEPLOYMENT.md 手动部署" "White"
    Write-ColorOutput ""
    Write-ColorOutput "传输建议:" "Yellow"
    Write-ColorOutput "- U盘/移动硬盘: 适合小型部署" "White"
    Write-ColorOutput "- 网络共享: 适合局域网环境" "White"
    Write-ColorOutput "- 压缩包: 减少传输时间" "White"
}

# 错误处理
trap {
    Write-ColorOutput "" 
    Write-ColorOutput "❌ 准备失败" "Red"
    Write-ColorOutput "错误信息: $($_.Exception.Message)" "Red"
    Write-ColorOutput "错误位置: $($_.InvocationInfo.ScriptLineNumber)行" "Red"
    exit 1
}

# 显示帮助信息
if ($args -contains "-help" -or $args -contains "--help" -or $args -contains "-h") {
    Write-ColorOutput "AI聊天盒子项目部署包准备脚本" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "用法:" "Yellow"
    Write-ColorOutput "  .\prepare-deployment.ps1 [参数]" "White"
    Write-ColorOutput ""
    Write-ColorOutput "参数:" "Yellow"
    Write-ColorOutput "  -OutputPath <路径>    输出目录路径 (默认: ai-chatbox-deployment)" "White"
    Write-ColorOutput "  -IncludeCache         包含npm缓存备份" "White"
    Write-ColorOutput "  -IncludeNodeJs        包含Node.js安装包信息" "White"
    Write-ColorOutput "  -CreateZip            创建压缩包" "White"
    Write-ColorOutput "  -Verbose              显示详细信息" "White"
    Write-ColorOutput ""
    Write-ColorOutput "示例:" "Yellow"
    Write-ColorOutput "  .\prepare-deployment.ps1 -CreateZip -IncludeCache" "White"
    Write-ColorOutput "  .\prepare-deployment.ps1 -OutputPath my-deployment -IncludeNodeJs" "White"
    exit 0
}

# 开始准备
Start-DeploymentPreparation