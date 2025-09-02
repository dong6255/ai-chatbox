# AI聊天盒子项目自动化部署脚本
# 用于在内网环境中快速部署项目

param(
    [string]$ProjectPath = ".",
    [switch]$SkipCache,
    [switch]$SkipNodeCheck,
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

# 主部署函数
function Start-Deployment {
    Write-ColorOutput "=== AI聊天盒子项目自动化部署 ===" "Cyan"
    Write-ColorOutput "部署时间: $(Get-Date)" "Gray"
    Write-ColorOutput ""

    # 步骤1: 检查Node.js环境
    if (-not $SkipNodeCheck) {
        Write-ColorOutput "[1/6] 检查Node.js环境..." "Yellow"
        
        if (-not (Test-Command "node")) {
            Write-ColorOutput "❌ Node.js未安装" "Red"
            Write-ColorOutput "请先安装Node.js，推荐版本: 18.x 或 20.x" "Red"
            Write-ColorOutput "下载地址: https://nodejs.org/" "Cyan"
            exit 1
        }
        
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-ColorOutput "✅ Node.js版本: $nodeVersion" "Green"
        Write-ColorOutput "✅ npm版本: $npmVersion" "Green"
    }

    # 步骤2: 验证项目结构
    Write-ColorOutput "[2/6] 验证项目结构..." "Yellow"
    
    Set-Location $ProjectPath
    $currentPath = Get-Location
    Write-ColorOutput "项目路径: $currentPath" "Gray"
    
    # 检查必要文件
    $requiredFiles = @(
        "package.json",
        "install-offline-packages.ps1",
        "offline-packages\tgz"
    )
    
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            Write-ColorOutput "❌ 缺少必要文件: $file" "Red"
            exit 1
        }
    }
    
    Write-ColorOutput "✅ 项目结构验证通过" "Green"

    # 步骤3: 恢复npm缓存（可选）
    if (-not $SkipCache) {
        Write-ColorOutput "[3/6] 恢复npm缓存..." "Yellow"
        
        if (Test-Path "npm-cache") {
            try {
                $cacheTarget = "$env:APPDATA\npm-cache"
                Write-ColorOutput "恢复缓存到: $cacheTarget" "Gray"
                
                if (Test-Path $cacheTarget) {
                    Remove-Item $cacheTarget -Recurse -Force -ErrorAction SilentlyContinue
                }
                
                robocopy "npm-cache" $cacheTarget /E /R:3 /W:1 /NJH /NJS
                Write-ColorOutput "✅ npm缓存恢复完成" "Green"
            }
            catch {
                Write-ColorOutput "⚠️ 缓存恢复失败，继续安装: $($_.Exception.Message)" "Yellow"
            }
        } else {
            Write-ColorOutput "ℹ️ 未找到缓存文件，跳过缓存恢复" "Cyan"
        }
    } else {
        Write-ColorOutput "[3/6] 跳过缓存恢复" "Gray"
    }

    # 步骤4: 清理现有安装
    Write-ColorOutput "[4/6] 清理现有安装..." "Yellow"
    
    if (Test-Path "node_modules") {
        Write-ColorOutput "删除现有node_modules目录..." "Gray"
        Remove-Item "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "package-lock.json") {
        Write-ColorOutput "删除现有package-lock.json..." "Gray"
        Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
    }
    
    Write-ColorOutput "✅ 清理完成" "Green"

    # 步骤5: 离线安装依赖
    Write-ColorOutput "[5/6] 离线安装依赖包..." "Yellow"
    
    if (-not (Test-Path "install-offline-packages.ps1")) {
        Write-ColorOutput "❌ 未找到离线安装脚本" "Red"
        exit 1
    }
    
    try {
        Write-ColorOutput "执行离线安装脚本..." "Gray"
        & ".\install-offline-packages.ps1"
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ 依赖包安装成功" "Green"
        } else {
            Write-ColorOutput "❌ 依赖包安装失败，退出代码: $LASTEXITCODE" "Red"
            
            # 检查错误日志
            $errorLogs = Get-ChildItem -Filter "install-errors-*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
            if ($errorLogs) {
                Write-ColorOutput "错误日志文件: $($errorLogs.Name)" "Red"
                Write-ColorOutput "请查看错误日志获取详细信息" "Red"
            }
            exit 1
        }
    }
    catch {
        Write-ColorOutput "❌ 安装过程中发生异常: $($_.Exception.Message)" "Red"
        exit 1
    }

    # 步骤6: 验证安装结果
    Write-ColorOutput "[6/6] 验证安装结果..." "Yellow"
    
    try {
        # 检查package.json中的依赖
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        $totalDeps = 0
        
        if ($packageJson.dependencies) {
            $totalDeps += $packageJson.dependencies.PSObject.Properties.Count
        }
        if ($packageJson.devDependencies) {
            $totalDeps += $packageJson.devDependencies.PSObject.Properties.Count
        }
        
        Write-ColorOutput "预期依赖包数量: $totalDeps" "Gray"
        
        # 验证node_modules
        if (Test-Path "node_modules") {
            $installedPackages = Get-ChildItem "node_modules" -Directory | Measure-Object | Select-Object -ExpandProperty Count
            Write-ColorOutput "已安装包数量: $installedPackages" "Gray"
            
            if ($installedPackages -gt 0) {
                Write-ColorOutput "✅ 依赖包验证通过" "Green"
            } else {
                Write-ColorOutput "⚠️ node_modules目录为空" "Yellow"
            }
        } else {
            Write-ColorOutput "❌ node_modules目录不存在" "Red"
            exit 1
        }
        
        # 尝试运行npm list验证
        Write-ColorOutput "执行依赖验证..." "Gray"
        $listOutput = npm list --depth=0 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ 依赖关系验证通过" "Green"
        } else {
            Write-ColorOutput "⚠️ 依赖关系验证有警告，但可能不影响运行" "Yellow"
            if ($Verbose) {
                Write-ColorOutput "详细信息:" "Gray"
                Write-ColorOutput $listOutput "Gray"
            }
        }
    }
    catch {
        Write-ColorOutput "⚠️ 验证过程中发生错误: $($_.Exception.Message)" "Yellow"
    }

    # 部署完成
    Write-ColorOutput "" 
    Write-ColorOutput "=== 部署完成 ===" "Green"
    Write-ColorOutput "项目已成功部署到内网环境" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "下一步操作:" "Cyan"
    Write-ColorOutput "  开发模式: npm run dev" "White"
    Write-ColorOutput "  构建项目: npm run build" "White"
    Write-ColorOutput "  预览构建: npm run preview" "White"
    Write-ColorOutput ""
    Write-ColorOutput "如有问题，请查看 offline-deployment-guide.md 获取详细说明" "Gray"
}

# 错误处理
trap {
    Write-ColorOutput "" 
    Write-ColorOutput "❌ 部署失败" "Red"
    Write-ColorOutput "错误信息: $($_.Exception.Message)" "Red"
    Write-ColorOutput "错误位置: $($_.InvocationInfo.ScriptLineNumber)行" "Red"
    Write-ColorOutput ""
    Write-ColorOutput "请检查:" "Yellow"
    Write-ColorOutput "1. Node.js是否正确安装" "White"
    Write-ColorOutput "2. 项目文件是否完整" "White"
    Write-ColorOutput "3. 离线包文件是否存在" "White"
    Write-ColorOutput "4. 磁盘空间是否充足" "White"
    Write-ColorOutput "5. 是否有足够的权限" "White"
    exit 1
}

# 开始部署
Start-Deployment