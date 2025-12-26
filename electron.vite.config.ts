import { defineConfig } from 'electron-vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // 主进程配置 (electron/main.ts)
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main.ts')
        },
        external: ['@electron/remote']
      }
    }
  },

  // 预加载脚本配置
  preload: {
    build: {
      rollupOptions: {
        input: {
          preload: resolve(__dirname, 'electron/preload.ts')
        },
        external: ['@electron/remote']
      }
    }
  },

  // 渲染进程配置 (React应用)
  renderer: {
    // 根目录
    root: process.cwd(),

    // 构建配置
    build: {
      outDir: 'dist-react',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        },
        external: ['@electron/remote'],
        output: {
          // 资源文件命名
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(css|less|scss)$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico|bmp)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },

    // 路径解析
    resolve: {
      alias: {
        '@': resolve('src'),
        '@components': resolve('src/components'),
        '@utils': resolve('src/utils'),
        '@store': resolve('src/store'),
        '@assets': resolve('src/assets')
      }
    },

    // 插件配置
    plugins: [
      react({
        // JSX 运行时
        jsxRuntime: 'automatic',
        // 快速刷新
        fastRefresh: true,
        // Babel 配置
        babel: {
          plugins: [
            // 可选：添加一些 Babel 插件
          ]
        }
      })
    ],

    // 开发服务器配置
    server: {
      port: 3344,
      host: true, // 允许外部访问
      strictPort: true, // 端口被占用时退出
      open: false, // 不自动打开浏览器

      // 代理配置（如果需要）
      proxy: {
        // '/api': {
        //   target: 'http://localhost:3000',
        //   changeOrigin: true
        // }
      },

      // CORS 配置
      cors: true,

      // HMR (热模块替换) 配置
      hmr: {
        overlay: true // 显示错误覆盖层
      },

      // 添加 COOP/COEP 响应头
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp',
      }
    },

    // 预览服务器配置
    preview: {
      port: 4173,
      host: true
    },

    // CSS 配置
    css: {
      // 启用 CSS 模块
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },

      // 预处理器配置
      preprocessorOptions: {
        less: {
          modifyVars: {
            // 可在此覆盖 Ant Design 变量
            'primary-color': '#1890ff',
            'link-color': '#1890ff',
            'border-radius-base': '6px'
          },
          javascriptEnabled: true
        }
      }
    },

    // 优化配置
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'antd',
        'lodash',
        'zustand'
      ],
      exclude: [
        'electron',
        '@ffmpeg/ffmpeg'
      ]
    },

    // 定义全局常量
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_ELECTRON__: true
    }
  }
});
