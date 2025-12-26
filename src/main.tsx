import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, App as AntdApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('应用错误:', error, errorInfo);
    
    // 发送错误报告（可选）
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成错误报告服务
      console.log('发送错误报告:', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 20,
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>😵 应用遇到错误</h1>
            <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
              抱歉，EZ CUT 遇到了意外错误。请刷新页面重试。
            </p>
            <div style={{ marginBottom: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <code style={{ fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {this.state.error?.message || '未知错误'}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              刷新页面
            </button>
            <div style={{ marginTop: '2rem', fontSize: '0.875rem', opacity: 0.6 }}>
              <p>如果问题持续存在，请联系技术支持</p>
              <p>技术支持邮箱: contact@wsk-lab.com</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 性能监控（开发模式）
if (process.env.NODE_ENV === 'development') {
  console.log('🚀 EZ CUT 开发模式启动');
  console.log('📦 版本:', __APP_VERSION__);
  console.log('🕒 构建时间:', __BUILD_TIME__);
  console.log('🌐 环境:', process.env.NODE_ENV);
}

// 渲染应用
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('找不到 #root 元素');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            colorBgLayout: '#f5f5f5',
            colorText: '#333',
            colorTextSecondary: '#666',
            colorTextTertiary: '#999',
            fontSize: 14,
            sizeStep: 4,
            sizeUnit: 4
          },
          components: {
            Layout: {
              bodyBg: 'transparent',
              headerBg: '#fff',
              headerHeight: 64,
              headerPadding: '0 24px',
              headerColor: '#333'
            },
            Button: {
              borderRadius: 6,
              borderRadiusLG: 8,
              borderRadiusSM: 4
            },
            Card: {
              borderRadiusLG: 12,
              borderRadius: 8,
              borderRadiusSM: 6
            },
            Input: {
              borderRadius: 6
            },
            Select: {
              borderRadius: 6
            },
            Modal: {
              borderRadius: 12
            }
          },
          cssVar: true,
          hashed: false
        }}
        wave={{ disabled: false }}
      >
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// 热重载支持（开发模式）
if (process.env.NODE_ENV === 'development' && import.meta.hot) {
  import.meta.hot.accept();
}

// PWA 支持（可选）
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration);
      },
      (registrationError) => {
        console.log('SW registration failed: ', registrationError);
      }
    );
  });
}
