# MSPaint Desktop Deepin专用构建指南

## 概述

本项目专门为Deepin系列系统构建MSPaint Desktop应用，包含完整的源码保护功能和Deepin系统优化。

## 快速构建

### 构建Deepin专用DEB包

```bash
# 运行Deepin专用构建脚本
./build-deepin-only.sh
```

构建完成后，Deepin专用DEB包将位于 `dist/mspaint-desktop_1.0.0_deepin_amd64.deb`

### 安装Deepin专用包

```bash
# 安装包
sudo dpkg -i dist/mspaint-desktop_1.0.0_deepin_amd64.deb

# 如果缺少依赖，运行
sudo apt-get install -f
```

## 构建详情

### 包信息
- **包名**: mspaint-desktop
- **版本**: 1.0.0
- **架构**: amd64
- **大小**: ~82MB
- **安装大小**: ~275MB
- **系统**: 专门针对Deepin系列系统优化

### Deepin专用优化
- ✅ **图标路径修复**: 自动修复Deepin系统的图标显示问题
- ✅ **应用名称优化**: 显示为"MSPaint"（简洁明了）
- ✅ **桌面集成**: 完美集成到Deepin启动器
- ✅ **七彩图标**: 14个正确尺寸的七彩图标

### 依赖项
- libgtk-3-0
- libnotify4
- libnss3
- libxss1
- libxtst6
- xdg-utils
- libatspi2.0-0
- libuuid1
- libsecret-1-0

### 推荐依赖
- libappindicator3-1

## 源码保护

构建过程包含以下源码保护措施：

1. **ASAR 归档**: 所有源码打包到 asar 归档文件中
2. **最大压缩**: 使用最高压缩级别减小文件大小
3. **源码混淆**: 源码无法直接查看或提取
4. **资源保护**: 应用图标和资源文件已混淆

## 故障排除

### 网络问题
如果遇到下载超时，脚本会自动使用国内镜像：
- Electron: https://npmmirror.com/mirrors/electron/
- Electron Builder: https://npmmirror.com/mirrors/electron-builder-binaries/

### 依赖问题
确保系统已安装：
- Node.js (推荐 v18+)
- npm
- dpkg-dev (用于DEB包操作)

### 权限问题
确保脚本有执行权限：
```bash
chmod +x build-deepin-only.sh
```

## 手动构建

如果需要手动构建，可以运行：

```bash
# 设置环境变量
export ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
export ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

# 安装依赖
npm install

# 构建
npm run dist:deb
```

## 支持的Deepin系列系统

- Deepin V20
- Deepin V23
- UOS V20
- UOS V21
- 其他基于Deepin的发行版

## 许可证

MIT License - 详见 LICENSE 文件 