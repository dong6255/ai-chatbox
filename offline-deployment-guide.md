# 项目离线部署完整指南

本指南详细说明如何将AI聊天盒子项目从有互联网的电脑完整迁移到内网环境中。

## 📋 迁移清单

### 1. 项目源代码和配置
- [ ] 项目根目录所有文件
- [ ] `.gitignore` 和版本控制配置
- [ ] `package.json` 和 `package-lock.json`
- [ ] `vite.config.js` 和其他配置文件
- [ ] `src/` 目录下所有源代码
- [ ] `public/` 目录下静态资源

### 2. 依赖包和缓存
- [ ] `offline-packages/` 目录（包含所有tgz文件）
- [ ] npm全局缓存
- [ ] Node.js运行时环境
- [ ] 构建工具缓存

### 3. 开发工具和环境
- [ ] Node.js安装包
- [ ] npm/yarn包管理器
- [ ] 代码编辑器配置

## 🔧 源电脑准备步骤

### 步骤1：准备项目文件
```powershell
# 1. 确保项目完整性
git status
git add .
git commit -m "准备离线部署"

# 2. 清理不必要的文件
npm run build  # 如果需要预构建
```

### 步骤2：下载所有依赖包
```powershell
# 运行离线包下载脚本
.\download-offline-packages.ps1

# 验证下载完整性
ls offline-packages\tgz
```

### 步骤3：导出npm缓存
```powershell
# 查看npm缓存位置
npm config get cache

# 创建缓存备份目录
mkdir npm-cache-backup

# 复制npm缓存（可选，用于加速安装）
robocopy "$env:APPDATA\npm-cache" "npm-cache-backup" /E /R:3 /W:1
```

### 步骤4：准备Node.js环境
```powershell
# 检查Node.js版本
node --version
npm --version

# 下载对应版本的Node.js安装包
# 访问 https://nodejs.org/dist/ 下载对应版本
```

### 步骤5：创建部署包
```powershell
# 创建部署目录
mkdir ai-chatbox-deployment

# 复制项目文件（排除node_modules）
robocopy . ai-chatbox-deployment /E /XD node_modules .git /R:3 /W:1

# 复制npm缓存（可选）
robocopy npm-cache-backup ai-chatbox-deployment\npm-cache /E /R:3 /W:1
```

## 📦 打包传输

### 创建压缩包
```powershell
# 使用7-Zip或WinRAR压缩
Compress-Archive -Path ai-chatbox-deployment -DestinationPath ai-chatbox-deployment.zip

# 或者使用tar（如果可用）
tar -czf ai-chatbox-deployment.tar.gz ai-chatbox-deployment/
```

### 传输方式
- **U盘/移动硬盘**：直接复制压缩包
- **网络共享**：通过局域网共享文件夹
- **FTP/SFTP**：如果内网有文件服务器
- **光盘刻录**：对于高安全要求环境

## 🖥️ 目标电脑部署步骤

### 步骤1：安装Node.js环境
```powershell
# 1. 安装Node.js（使用带来的安装包）
# 运行 node-vXX.X.X-x64.msi

# 2. 验证安装
node --version
npm --version
```

### 步骤2：解压项目文件
```powershell
# 解压部署包
Expand-Archive -Path ai-chatbox-deployment.zip -DestinationPath C:\Projects\

# 进入项目目录
cd C:\Projects\ai-chatbox-deployment
```

### 步骤3：配置npm缓存（可选）
```powershell
# 如果带了npm缓存，恢复缓存
if (Test-Path "npm-cache") {
    robocopy npm-cache "$env:APPDATA\npm-cache" /E /R:3 /W:1
    Write-Host "npm缓存已恢复" -ForegroundColor Green
}
```

### 步骤4：离线安装依赖
```powershell
# 运行离线安装脚本
.\install-offline-packages.ps1

# 验证安装结果
npm list --depth=0
```

### 步骤5：构建和运行项目
```powershell
# 开发模式运行
npm run dev

# 或者构建生产版本
npm run build
npm run preview
```

## 🔍 故障排除

### 常见问题及解决方案

#### 1. Node.js版本不匹配
```powershell
# 检查package.json中的engines字段
cat package.json | findstr engines

# 安装正确版本的Node.js
```

#### 2. 依赖包安装失败
```powershell
# 清理并重新安装
npm cache clean --force
Remove-Item node_modules -Recurse -Force
.\install-offline-packages.ps1
```

#### 3. 权限问题
```powershell
# 以管理员身份运行PowerShell
# 或者配置npm全局目录
npm config set prefix "C:\npm-global"
```

#### 4. 缓存损坏
```powershell
# 重建npm缓存
npm cache clean --force
npm cache verify
```

## 📋 验证清单

部署完成后，请验证以下项目：

- [ ] Node.js和npm正常工作
- [ ] 所有依赖包成功安装
- [ ] 项目能够正常启动
- [ ] 所有功能模块正常运行
- [ ] 构建过程无错误
- [ ] 生产环境部署成功

## 🚀 优化建议

### 1. 创建自动化部署脚本
```powershell
# deploy.ps1 - 自动化部署脚本
param(
    [string]$ProjectPath = ".",
    [switch]$SkipCache
)

Write-Host "开始自动化部署..." -ForegroundColor Green

# 检查Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js未安装，请先安装Node.js"
    exit 1
}

# 进入项目目录
Set-Location $ProjectPath

# 恢复缓存
if (-not $SkipCache -and (Test-Path "npm-cache")) {
    Write-Host "恢复npm缓存..." -ForegroundColor Yellow
    robocopy npm-cache "$env:APPDATA\npm-cache" /E /R:3 /W:1 /NJH /NJS
}

# 安装依赖
Write-Host "安装项目依赖..." -ForegroundColor Yellow
.\install-offline-packages.ps1

# 验证安装
if ($LASTEXITCODE -eq 0) {
    Write-Host "部署成功！" -ForegroundColor Green
    Write-Host "运行 'npm run dev' 启动开发服务器" -ForegroundColor Cyan
} else {
    Write-Error "部署失败，请检查错误日志"
}
```

### 2. 环境变量配置
```powershell
# 设置项目相关环境变量
$env:NODE_ENV = "production"
$env:NPM_CONFIG_REGISTRY = ""  # 禁用在线registry
```

### 3. 性能优化
- 使用SSD存储提高I/O性能
- 配置足够的内存用于构建过程
- 使用本地文件服务器加速大文件传输

## 📞 技术支持

如果在部署过程中遇到问题，请：

1. 检查错误日志文件
2. 验证Node.js和npm版本
3. 确认所有依赖包完整性
4. 查看网络和防火墙设置
5. 联系技术支持团队

---

**注意**：此指南适用于Windows环境，Linux/macOS环境请相应调整命令和路径。