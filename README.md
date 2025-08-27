# MSPaint画图（MSPaint Desktop）

MSPaint 桌面客户端 - 经典 MS Paint 的现代重制版，已针对 Deepin 系列系统做了优化。

## 简介

这是一个基于 [JSPaint](https://github.com/1j01/jspaint) 项目的 Electron 桌面应用，将经典的 MS Paint 功能带到了现代桌面环境。**专门针对Deepin系列系统进行优化**，确保最佳的桌面集成体验。

## 🐉 Deepin 优化

- ✅ 七彩图标：多尺寸图标，启动器显示正确
- ✅ 图标路径修复：构建后自动修复 Deepin 图标路径（见 `scripts/fix-icons.js`）
- ✅ 应用名称：窗口与包名显示为 “MSPaint画图”
- ✅ 桌面集成：`.desktop` 与图标缓存可正常刷新

## 功能特点

- 🎨 完整的 MS Paint 功能
- 🖼️ 支持多种图片格式 (PNG, JPEG, GIF, BMP, WebP)
- 🖱️ 直观的绘图工具
- 💾 文件保存和加载（未修改时“保存”自动置灰）
- 🌐 语言切换
- 🎯 现代化的桌面界面

## 快速开始

### 构建安装包（.deb）

```bash
# 安装依赖
npm install

# 构建 deb 包（使用 electron-builder）
npm run dist:deb
```

### 安装

```bash
# 安装包（根据构建结果调整版本号）
sudo dpkg -i dist/mspaint-desktop_1.0.0_amd64.deb

# 如果缺少依赖，运行
sudo apt-get install -f

# 刷新桌面/图标缓存（如有需要）
sudo update-desktop-database || true
sudo gtk-update-icon-cache -f /usr/share/icons/hicolor || true
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

## 支持的 Deepin 系列系统

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

## 运行

- 启动器中搜索 “MSPaint画图”
- 或命令行运行：`mspaint-desktop`

## 许可证

MIT License 