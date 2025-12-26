#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');

class BuildScript {
  constructor() {
    this.isDev = process.env.NODE_ENV === 'development';
    this.platform = process.platform;
    this.arch = process.arch;
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const colors = {
      info: chalk.blue,
      success: chalk.green,
      warning: chalk.yellow,
      error: chalk.red,
      debug: chalk.gray
    };
    const timestamp = new Date().toLocaleTimeString();
    console.log(colors[type](`[${timestamp}] ${message}`));
  }

  runCommand(command, options = {}) {
    try {
      this.log(`执行: ${chalk.gray(command)}`, 'debug');
      execSync(command, { stdio: 'inherit', ...options });
      return true;
    } catch (error) {
      this.log(`命令执行失败: ${error.message}`, 'error');
      return false;
    }
  }

  checkPrerequisites() {
    this.log('检查构建环境...');
    
    // 检查 Node.js 版本
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 16) {
      this.log(`需要 Node.js 16.0.0 或更高版本，当前版本: ${nodeVersion}`, 'error');
      return false;
    }
    
    this.log(`✅ Node.js 版本: ${nodeVersion}`, 'success');
    
    // 检查 npm 版本
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      this.log(`✅ npm 版本: ${npmVersion}`, 'success');
    } catch (error) {
      this.log('❌ 无法获取 npm 版本', 'error');
      return false;
    }
    
    return true;
  }

  async build() {
    this.log('🚀 开始构建 EZ CUT 应用...');
    
    if (!this.checkPrerequisites()) {
      process.exit(1);
    }

    // 1. 清理构建目录
    this.log('步骤 1/6: 清理构建目录');
    if (!this.clean()) {
      process.exit(1);
    }

    // 2. 安装依赖
    this.log('步骤 2/6: 安装依赖');
    if (!this.installDependencies()) {
      process.exit(1);
    }

    // 3. 类型检查
    this.log('步骤 3/6: 类型检查');
    if (!this.typeCheck()) {
      process.exit(1);
    }

    // 4. 代码检查
    this.log('步骤 4/6: 代码检查');
    if (!this.lint()) {
      process.exit(1);
    }

    // 5. 构建应用
    this.log('步骤 5/6: 构建应用');
    if (!this.buildApp()) {
      process.exit(1);
    }

    // 6. 打包应用
    this.log('步骤 6/6: 打包应用');
    if (!this.packageApp()) {
      process.exit(1);
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(1);
    this.log(`🎉 应用构建完成！耗时: ${duration}秒`, 'success');
    this.showBuildInfo();
  }

  clean() {
    return this.runCommand('npm run clean');
  }

  installDependencies() {
    this.log('安装依赖...');
    
    // 尝试使用 npm ci（更快更可靠）
    if (this.runCommand('npm ci', { stdio: 'pipe' })) {
      return true;
    }
    
    this.log('npm ci 失败，尝试 npm install...', 'warning');
    return this.runCommand('npm install', { stdio: 'pipe' });
  }

  typeCheck() {
    return this.runCommand('npm run type-check');
  }

  lint() {
    return this.runCommand('npm run lint');
  }

  buildApp() {
    this.log('构建渲染进程...');
    if (!this.runCommand('npm run build:renderer')) {
      return false;
    }
    
    this.log('构建主进程...');
    if (!this.runCommand('npm run build:main')) {
      return false;
    }
    
    this.log('构建预加载脚本...');
    return this.runCommand('npm run build:preload');
  }

  packageApp() {
    const commands = {
      'win32': 'npm run build:win',
      'darwin': 'npm run build:mac',
      'linux': 'npm run build:linux'
    };

    const command = commands[this.platform] || 'npm run build:all';
    return this.runCommand(command);
  }

  showBuildInfo() {
    const { readdirSync, statSync } = require('fs');
    const buildDir = join(process.cwd(), 'release');
    
    if (existsSync(buildDir)) {
      this.log('构建输出文件:', 'info');
      
      const files = readdirSync(buildDir);
      files.forEach(file => {
        const filePath = join(buildDir, file);
        const stats = statSync(filePath);
        const size = (stats.size / 1024 / 1024).toFixed(1);
        console.log(`  📦 ${file} (${size} MB)`);
      });
    }

    this.log('\n🎯 下一步操作建议:', 'info');
    console.log('  1. 测试生成的应用文件');
    console.log('  2. 进行代码签名（生产环境）');
    console.log('  3. 发布到 GitHub Releases');
    console.log('  4. 更新文档和版本号');
    
    this.log('\n🔧 开发命令:', 'info');
    console.log('  npm run dev          # 开发模式');
    console.log('  npm run test         # 运行测试');
    console.log('  npm run lint         # 代码检查');
    console.log('  npm run build        # 构建应用');
  }
}

// 运行构建
if (require.main === module) {
  const builder = new BuildScript();
  builder.build().catch(error => {
    console.error('构建过程出错:', error);
    process.exit(1);
  });
}

module.exports = BuildScript;
