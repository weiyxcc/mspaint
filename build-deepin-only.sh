#!/bin/bash

# Deepin专用构建脚本
echo "🐉 Deepin专用构建脚本启动..."

# 清理之前的构建
rm -rf dist/
rm -rf node_modules/

# 安装依赖
npm install

# 构建DEB包
npm run dist:deb

# 创建临时目录
TEMP_DIR=$(mktemp -d)

# 提取DEB包
dpkg-deb -R dist/mspaint-desktop_1.0.0_amd64.deb "$TEMP_DIR"

# 修复图标路径
ICON_SOURCE="$TEMP_DIR/usr/share/icons/hicolor/0x0/apps/mspaint-desktop.png"
if [ -f "$ICON_SOURCE" ]; then
    ICON_SIZES=("16x16" "22x22" "24x24" "32x32" "36x36" "48x48" "64x64" "72x72" "96x96" "128x128" "192x192" "256x256" "512x512" "scalable")
    for size in "${ICON_SIZES[@]}"; do
        TARGET_DIR="$TEMP_DIR/usr/share/icons/hicolor/$size/apps"
        mkdir -p "$TARGET_DIR"
        cp "$ICON_SOURCE" "$TARGET_DIR/mspaint-desktop.png"
    done
    rm -rf "$TEMP_DIR/usr/share/icons/hicolor/0x0"
fi

# 修改应用名称，去掉"桌面版"
DESKTOP_FILE="$TEMP_DIR/usr/share/applications/mspaint-desktop.desktop"
if [ -f "$DESKTOP_FILE" ]; then
    # 备份原文件
    cp "$DESKTOP_FILE" "$DESKTOP_FILE.backup"
    
    # 创建修改后的桌面入口文件
    cat > "$DESKTOP_FILE" << 'EOF'
[Desktop Entry]
Name=MSPaint
Name[zh_CN]=MSPaint
Comment=MSPaint 桌面客户端 - 经典 MS Paint 的现代重制版
Comment[zh_CN]=经典 MS Paint 的现代重制版
Exec="/opt/MSPaint Desktop/mspaint-desktop" %U
Terminal=false
Type=Application
Icon=mspaint-desktop
StartupWMClass=MSPaint Desktop
Categories=Graphics;
EOF
    
    echo "✅ 应用名称已修改为 'MSPaint'"
fi

# 重新打包
dpkg-deb -b "$TEMP_DIR" "dist/mspaint-desktop_1.0.0_deepin_amd64.deb"

# 清理
rm -rf "$TEMP_DIR"
rm -f dist/mspaint-desktop_1.0.0_amd64.deb

echo "✅ Deepin专用包构建完成: dist/mspaint-desktop_1.0.0_deepin_amd64.deb"
