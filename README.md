# MSPaint Desktop - Deepin专用版

MSPaint 桌面客户端 - 经典 MS Paint 的现代重制版，专门为Deepin系列系统优化

## 简介

这是一个基于 [JSPaint](https://github.com/1j01/jspaint) 项目的 Electron 桌面应用，将经典的 MS Paint 功能带到了现代桌面环境。**专门针对Deepin系列系统进行优化**，确保最佳的桌面集成体验。

## 🐉 Deepin专用特性

- ✅ **七彩图标**: 14个正确尺寸的七彩图标，完美显示在Deepin启动器
- ✅ **图标路径修复**: 自动修复Deepin系统的图标显示问题
- ✅ **应用名称优化**: 显示为"MSPaint"（简洁明了）
- ✅ **桌面集成**: 完美集成到Deepin启动器
- ✅ **系统兼容**: 支持Deepin V20+、UOS V20+等Deepin系列系统

## 功能特点

- 🎨 完整的 MS Paint 功能
- 🖼️ 支持多种图片格式 (PNG, JPEG, GIF, BMP, WebP)
- 🖱️ 直观的绘图工具
- 💾 文件保存和加载
- 🎯 现代化的桌面界面

## 快速开始

### 构建Deepin专用包

```bash
# 运行Deepin专用构建脚本
./build-deepin-only.sh
```

### 安装Deepin专用包

```bash
# 安装包
sudo dpkg -i dist/mspaint-desktop_1.0.0_deepin_amd64.deb

# 如果缺少依赖，运行
sudo apt-get install -f
```

### 开发模式

```bash
# 安装依赖
npm install

# 运行应用
npm start

# 开发模式
npm run dev
```

## 支持的Deepin系列系统

- Deepin V20
- Deepin V23
- UOS V20
- UOS V21
- 其他基于Deepin的发行版

## 系统要求

- Deepin V20+ / UOS V20+
- Node.js 16+ (开发环境)
- 2GB RAM
- 500MB 磁盘空间

## 许可证

MIT License 