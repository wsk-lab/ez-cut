import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist-react',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(css|less|scss)$/.test(name ?? '')) {
            return 'assets/css/[name]-[hash][extname]';
          }
          if (/\.(png|jpe?g|gif|svg|webm|ico|bmp)$/.test(name ?? '')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    minify: 'esbuild',
    target: 'esnext',
    modulePreload: {
      polyfill: false
    }
  },
  server: {
    port: 3344,
    host: true,
    strictPort: true,
    open: false,
    cors: true
  },
  preview: {
    port: 4173,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve('src'),
      '@components': resolve('src/components'),
      '@utils': resolve('src/utils'),
      '@store': resolve('src/store'),
      '@assets': resolve('src/assets'),
      '@types': resolve('src/types')
    }
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    preprocessorOptions: {
      less: {
        modifyVars: {
          'primary-color': '#1890ff',
          'link-color': '#1890ff',
          'border-radius-base': '6px'
        },
        javascriptEnabled: true
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'antd'],
    exclude: ['electron']
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __IS_ELECTRON__: false
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
});
