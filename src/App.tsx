import React, { useEffect, useState } from 'react';
import { Layout, ConfigProvider, theme, Button, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { Info, Scissors, Github, Settings } from 'lucide-react';

// 导入组件
import Header from './components/Header';
import VideoWorkspace from './components/VideoWorkspace';
import UploadSection from './components/UploadSection';
import BrandFooter from './components/BrandFooter';
import AboutDialog from './components/AboutDialog';
import Watermark from './components/Watermark';

// 导入状态管理
import { useVideoStore } from './store/videoStore';

// 导入样式
import './App.css';

const { Content } = Layout;

// 应用主组件
function App() {
  const {
    currentVideo,
    videoUrl,
    loadDemoVideo,
    loadVideo,
    resetVideo,
    isProcessing,
    progress,
    processingMessage
  } = useVideoStore();

  const [aboutVisible, setAboutVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  // 开发模式下加载演示视频
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 EZ CUT 开发模式启动 - WSK-Lab 出品');

      // 延迟加载演示视频，让用户先看到界面
      const timer = setTimeout(() => {
        loadDemoVideo().catch(() => {
          console.log('演示视频加载失败，继续使用上传模式');
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [loadDemoVideo]);

  // 处理从主进程发送的视频文件选择事件
  useEffect(() => {
    const handleVideoFileSelected = async (event: any) => {
      const filePath = event.detail;
      if (filePath) {
        try {
          const file = await window.electronUtils.filePathToFile(filePath);
          loadVideo(file);
        } catch (error) {
          console.error('加载视频文件失败:', error);
          message.error('无法加载所选视频文件');
        }
      }
    };

    window.addEventListener('video-file-selected' as any, handleVideoFileSelected);
    return () => window.removeEventListener('video-file-selected' as any, handleVideoFileSelected);
  }, [loadVideo]);

  // 处理全局错误
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('应用错误:', error);
      message.error(`应用遇到错误: ${error.message}`);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  useEffect(() => {
    if (isProcessing) {
      message.info({
        content: `${processingMessage || '正在处理'}... ${progress}%`,
        key: 'processing',
        duration: 0,
      });
    } else if (progress === 100) {
      message.success({
        content: '处理完成！',
        key: 'processing',
        duration: 2,
      });
    } else {
      message.destroy('processing');
    }
  }, [isProcessing, progress, processingMessage]);

  // 渲染主界面
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
          colorBgLayout: '#f5f5f5',
        },
        components: {
          Layout: {
            bodyBg: 'transparent',
            headerBg: 'rgba(255, 255, 255, 0.95)',
            headerPadding: '0 24px',
          },
          Button: {
            borderRadius: 6,
          },
          Card: {
            borderRadius: 12,
          },
        },
      }}
    >
      {/* 品牌水印保护 */}
      <Watermark>
        <Layout className="ez-cut-app">
          {/* 应用头部 */}
          <Header />

          {/* 主内容区域 */}
          <Content className="app-content">
            {!currentVideo ? (
              // 上传界面
              <UploadSection />
            ) : (
              // 视频工作区
              <VideoWorkspace />
            )}
          </Content>

          {/* 品牌页脚 */}
          <BrandFooter />
        </Layout>
      </Watermark>

      {/* 关于对话框 */}
      <AboutDialog
        open={aboutVisible}
        onClose={() => setAboutVisible(false)}
      />

      {/* 设置对话框（待实现） */}
      {/* <SettingsDialog 
        open={settingsVisible} 
        onClose={() => setSettingsVisible(false)} 
      /> */}

      {/* 浮动操作按钮组 */}
      <div className="floating-buttons">
        {/* 关于按钮 */}
        <Button
          type="primary"
          icon={<Info size={16} />}
          onClick={() => setAboutVisible(true)}
          className="floating-button about-button"
          size="large"
          title="关于 EZ CUT"
        >
          关于
        </Button>

        {/* GitHub 链接 */}
        <Button
          icon={<Github size={16} />}
          onClick={() => window.open('https://github.com/wsk-lab/ez-cut', '_blank')}
          className="floating-button github-button"
          size="large"
          title="查看源代码"
        >
          GitHub
        </Button>

        {/* 设置按钮 */}
        <Button
          icon={<Settings size={16} />}
          onClick={() => {
            message.info('设置功能开发中...');
            // setSettingsVisible(true);
          }}
          className="floating-button settings-button"
          size="large"
          title="应用设置"
        >
          设置
        </Button>

        {/* 新建项目按钮（有视频时显示） */}
        {currentVideo && (
          <Button
            icon={<Scissors size={16} />}
            onClick={() => {
              resetVideo();
              message.success('已重置，可以开始新的剪辑项目');
            }}
            className="floating-button new-project-button"
            size="large"
            type="primary"
            danger
            title="新建项目"
          >
            新建
          </Button>
        )}
      </div>

      {/* 全局加载遮罩 */}
      {isProcessing && (
        <div className="global-loading">
          <div className="loading-content">
            <div className="loading-spinner">
              <Scissors size={32} className="spinning" />
            </div>
            <h3>{processingMessage || '视频处理中'}</h3>
            <p>请稍候... {progress}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </ConfigProvider>
  );
}

export default App;
