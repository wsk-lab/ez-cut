const fs = require('fs');
const path = require('path');

// 创建 build 目录
const buildDir = path.join(__dirname, '../build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// 创建简单的占位图标（实际项目中应该使用专业设计的图标）
const createPlaceholderIcon = (size, format) => {
  // 这里创建简单的 SVG 图标作为占位符
  const svg = `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1890ff"/>
      <stop offset="100%" stop-color="#52c41a"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size/4}" fill="url(#gradient)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/3}" 
        fill="white" text-anchor="middle" dy=".3em" font-weight="bold">EZ</text>
</svg>`;

  const iconPath = path.join(buildDir, `icon.${format}`);
  fs.writeFileSync(iconPath, svg);
  console.log(`✅ 创建图标: ${iconPath}`);
};

// 创建各种格式的图标
createPlaceholderIcon(256, 'png');
createPlaceholderIcon(512, 'png');
createPlaceholderIcon(1024, 'png');

// 创建图标配置文件
const iconConfig = {
  "version": "1.0.0",
  "author": "WSK-Lab",
  "description": "EZ CUT 应用图标"
};

fs.writeFileSync(
  path.join(buildDir, 'icons.json'), 
  JSON.stringify(iconConfig, null, 2)
);

console.log('✅ 图标资源创建完成！');
