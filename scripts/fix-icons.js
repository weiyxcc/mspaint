const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

exports.default = async function(context) {
  console.log('🔧 后处理: 修复图标路径...');
  
  const { appOutDir, packager } = context;
  const appPath = path.join(appOutDir, packager.appInfo.productFilename);
  
  console.log('📦 应用路径:', appPath);
  
  // 检查是否是Linux构建
  if (process.platform === 'linux' || context.packager.platform.nodeName === 'linux') {
    console.log('🐧 检测到Linux构建，修复图标路径...');
    
    // 创建正确的图标目录结构
    const iconDirs = [
      '16x16/apps',
      '22x22/apps', 
      '24x24/apps',
      '32x32/apps',
      '36x36/apps',
      '48x48/apps',
      '64x64/apps',
      '72x72/apps',
      '96x96/apps',
      '128x128/apps',
      '192x192/apps',
      '256x256/apps',
      '512x512/apps',
      'scalable/apps'
    ];
    
    // 检查是否有错误的0x0目录
    const wrongIconPath = path.join(appOutDir, 'usr/share/icons/hicolor/0x0/apps/mspaint-desktop.png');
    if (fs.existsSync(wrongIconPath)) {
      console.log('🔍 找到错误的图标路径:', wrongIconPath);
      
      // 创建正确的图标目录
      iconDirs.forEach(dir => {
        const targetDir = path.join(appOutDir, 'usr/share/icons/hicolor', dir);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
          console.log('📁 创建目录:', targetDir);
        }
        
        // 复制图标到正确位置
        const targetIcon = path.join(targetDir, 'mspaint-desktop.png');
        fs.copyFileSync(wrongIconPath, targetIcon);
        console.log('🖼️ 复制图标到:', targetIcon);
      });
      
      // 删除错误的0x0目录
      const wrongDir = path.join(appOutDir, 'usr/share/icons/hicolor/0x0');
      if (fs.existsSync(wrongDir)) {
        fs.rmSync(wrongDir, { recursive: true, force: true });
        console.log('🗑️ 删除错误目录:', wrongDir);
      }
    }
  }
  
  console.log('✅ 图标路径修复完成');
}; 