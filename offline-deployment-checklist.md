# 内网部署验证清单

本文档提供了确保AI聊天盒子项目在内网环境中成功运行的完整验证清单。

## 📋 部署前验证清单

### 1. 环境要求验证
- [ ] **Node.js版本**: 18.x 或 20.x（推荐 18.17.0+）
- [ ] **npm版本**: 8.x 或更高版本
- [ ] **PowerShell版本**: 5.1 或更高版本
- [ ] **操作系统**: Windows 10/11 或 Windows Server 2016+
- [ ] **磁盘空间**: 至少 500MB 可用空间
- [ ] **内存**: 至少 4GB RAM

### 2. 文件完整性验证

#### 核心项目文件
- [ ] `package.json` - 项目配置文件
- [ ] `vite.config.js` - 构建配置
- [ ] `src/` 目录 - 源代码目录
- [ ] `public/` 目录 - 静态资源
- [ ] `index.html` - 入口HTML文件

#### 部署脚本文件
- [ ] `install-offline-packages.ps1` - 离线安装脚本
- [ ] `deploy.ps1` - 自动化部署脚本
- [ ] `prepare-deployment.ps1` - 部署包准备脚本
- [ ] `configure-powershell-chinese.ps1` - 中文编码配置脚本

#### 离线依赖包
- [ ] `offline-packages/tgz/` 目录存在
- [ ] 包含 19 个 .tgz 文件（与package.json依赖数量匹配）
- [ ] `offline-packages/package-list.txt` 包列表文件
- [ ] `offline-packages/README.md` 说明文档

### 3. 依赖包完整性验证

#### 生产依赖 (13个)
- [ ] `alova-3.3.4.tgz`
- [ ] `alova-scene-vue-1.6.2.tgz`
- [ ] `axios-1.7.7.tgz`
- [ ] `element-plus-2.8.8.tgz`
- [ ] `element-plus-icons-vue-2.3.1.tgz`
- [ ] `highlight.js-11.10.0.tgz`
- [ ] `markdown-it-14.1.0.tgz`
- [ ] `markdown-it-highlightjs-4.0.1.tgz`
- [ ] `pinia-2.1.7.tgz`
- [ ] `pinia-plugin-persistedstate-4.1.3.tgz`
- [ ] `sass-1.81.0.tgz`
- [ ] `vue-3.4.29.tgz`
- [ ] `vue-router-4.4.5.tgz`

#### 开发依赖 (6个)
- [ ] `vitejs-plugin-vue-5.0.5.tgz`
- [ ] `autoprefixer-10.4.21.tgz`
- [ ] `postcss-import-16.1.1.tgz`
- [ ] `postcss-nested-7.0.2.tgz`
- [ ] `postcss-preset-env-10.3.1.tgz`
- [ ] `vite-5.3.1.tgz`

## 🔧 部署步骤验证

### 步骤1: 环境准备
```powershell
# 验证Node.js安装
node --version
npm --version

# 验证PowerShell版本
$PSVersionTable.PSVersion

# 配置中文编码支持
.\configure-powershell-chinese.ps1 -Permanent
```

### 步骤2: 项目部署
```powershell
# 使用自动化部署脚本
.\deploy.ps1

# 或手动执行离线安装
.\install-offline-packages.ps1
```

### 步骤3: 安装验证
```powershell
# 检查node_modules目录
ls node_modules

# 验证关键依赖
ls node_modules\vue
ls node_modules\vite
ls node_modules\element-plus
```

### 步骤4: 构建测试
```powershell
# 开发模式启动
npm run dev

# 生产构建
npm run build
```

## ⚠️ 常见问题和解决方案

### 1. PowerShell执行策略问题
**问题**: 无法执行脚本，提示执行策略限制
**解决方案**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# 或临时绕过
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

### 2. 中文编码问题
**问题**: 中文字符显示乱码
**解决方案**:
```powershell
.\configure-powershell-chinese.ps1 -Permanent
# 重启PowerShell后生效
```

### 3. 依赖安装失败
**问题**: 某些包安装失败
**解决方案**:
- 检查错误日志文件 `install-errors-*.log`
- 清理缓存: `npm cache clean --force`
- 手动安装失败的包: `npm install package-name.tgz --no-save`

### 4. Node.js版本不兼容
**问题**: Node.js版本过低或过高
**解决方案**:
- 安装推荐版本 Node.js 18.17.0+
- 使用nvm管理多个Node.js版本

### 5. 磁盘空间不足
**问题**: 安装过程中磁盘空间不足
**解决方案**:
- 清理临时文件
- 确保至少500MB可用空间
- 检查node_modules大小

## 🧪 功能验证测试

### 1. 基础功能测试
```powershell
# 启动开发服务器
npm run dev
# 访问 http://localhost:5173
```

### 2. 构建功能测试
```powershell
# 生产构建
npm run build
# 检查dist目录
ls dist
```

### 3. 预览功能测试
```powershell
# 预览构建结果
npm run preview
# 访问 http://localhost:4173
```

## 📊 性能指标验证

### 安装成功指标
- [ ] **安装成功率**: 100% (19/19 包)
- [ ] **node_modules大小**: 约 200-400MB
- [ ] **安装时间**: < 5分钟
- [ ] **构建时间**: < 2分钟

### 运行时指标
- [ ] **开发服务器启动**: < 10秒
- [ ] **热重载响应**: < 1秒
- [ ] **生产构建**: < 2分钟
- [ ] **内存使用**: < 1GB

## ✅ 部署成功确认

当以下所有条件都满足时，可以确认部署成功：

1. **环境验证**: ✅ 所有环境要求都满足
2. **文件完整性**: ✅ 所有必需文件都存在
3. **依赖安装**: ✅ 所有19个依赖包都安装成功
4. **功能测试**: ✅ 开发、构建、预览都正常工作
5. **性能指标**: ✅ 所有性能指标都在预期范围内

## 📞 技术支持

如果在部署过程中遇到问题：

1. **查看错误日志**: 检查 `install-errors-*.log` 文件
2. **运行诊断脚本**: `deploy.ps1 -Verbose` 获取详细信息
3. **检查系统要求**: 确保满足所有环境要求
4. **清理重试**: 删除 `node_modules` 和 `package-lock.json` 后重新安装

---

**最后更新**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**版本**: 1.0.0
**适用环境**: Windows 内网环境