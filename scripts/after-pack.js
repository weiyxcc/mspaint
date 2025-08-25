const fs = require('fs');
const path = require('path');

exports.default = async function(context) {
  console.log('🔧 后处理: 修复图标路径...');
  
  const appOutDir = context.appOutDir;
  const iconPath = path.join(appOutDir, 'resources', 'app.asar');
  
  // 检查应用是否已打包
  if (fs.existsSync(iconPath)) {
    console.log('✅ 应用已打包到 asar 文件');
  }
  
  console.log('📦 后处理完成');
}; 