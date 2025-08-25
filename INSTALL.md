# MSPaint Desktop Deepin专用安装指南

## 快速安装

### 安装Deepin专用DEB包

```bash
# 安装包
sudo dpkg -i dist/mspaint-desktop_1.0.0_deepin_amd64.deb

# 如果缺少依赖，运行
sudo apt-get install -f
```

### 2. 刷新桌面缓存

```bash
# 刷新桌面数据库
sudo update-desktop-database

# 刷新图标缓存
sudo gtk-update-icon-cache
```

### 3. 重启桌面环境

```bash
# 方法1: 注销并重新登录
# 方法2: 重启桌面环境 (取决于您的桌面环境)
# 方法3: 重启系统
```

### 启动应用

- 在Deepin启动器中查找 "MSPaint"
- 或在终端中运行: `mspaint-desktop`

## Deepin专用特性

### 🎨 七彩图标
- 14个正确尺寸的七彩图标 (16x16 到 512x512)
- 自动修复Deepin系统的图标路径问题
- 完美显示在Deepin启动器中

### 📱 应用名称
- 显示名称: "MSPaint" (简洁明了)
- 中文支持: "MSPaint"
- 完美集成到Deepin桌面环境

### 🔧 Deepin系统集成
- 专门针对Deepin系统优化
- 自动注册文件关联
- 支持拖拽打开文件
- 完美集成到Deepin启动器

## 支持的文件格式

- PNG (Portable Network Graphics)
- JPEG (Joint Photographic Experts Group)
- GIF (Graphics Interchange Format)
- BMP (Bitmap)
- WebP (Web Picture)

## 故障排除

### 图标不显示
```bash
# 刷新图标缓存
sudo gtk-update-icon-cache

# 检查图标文件是否存在
ls -la /usr/share/icons/hicolor/*/apps/mspaint-desktop.png

# 检查桌面入口文件
cat /usr/share/applications/mspaint-desktop.desktop
```

### 应用无法启动
```bash
# 检查依赖
dpkg -l | grep -E "(libgtk|libnotify|libnss|libxss|libxtst)"

# 查看错误信息
mspaint-desktop --verbose

# 检查权限
ls -la /opt/MSPaint\ Desktop/
```

### 桌面入口不显示
```bash
# 刷新桌面数据库
sudo update-desktop-database

# 检查桌面入口文件权限
ls -la /usr/share/applications/mspaint-desktop.desktop

# 手动创建桌面入口
cp /usr/share/applications/mspaint-desktop.desktop ~/Desktop/
chmod +x ~/Desktop/mspaint-desktop.desktop
```

## 卸载

```bash
# 卸载应用
sudo dpkg -r mspaint-desktop

# 清理配置文件
sudo dpkg -P mspaint-desktop

# 刷新桌面缓存
sudo update-desktop-database
sudo gtk-update-icon-cache
```

## 系统要求

- Deepin V20+ / UOS V20+
- 2GB RAM
- 500MB 磁盘空间
- 支持 OpenGL 的显卡

## 支持的Deepin系列系统

- Deepin V20
- Deepin V23
- UOS V20
- UOS V21
- 其他基于Deepin的发行版

## 许可证

MIT License - 详见 LICENSE 文件 