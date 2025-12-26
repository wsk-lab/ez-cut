import React from 'react';
import { Layout, Button, Space, Typography } from 'antd';
import { Scissors, Github, Download, Settings } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header: React.FC = () => {
  const { currentVideo, resetVideo } = useVideoStore();

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Scissors size={28} className="logo-icon" />
          <Title level={2} className="app-title">EZ CUT</Title>
          <span className="app-subtitle">智能视频剪辑</span>
        </div>
        
        <div className="header-right">
          <Space>
            {currentVideo && (
              <Button 
                icon={<Download size={16} />}
                onClick={resetVideo}
              >
                新建项目
              </Button>
            )}
            <Button 
              icon={<Github size={16} />}
              type="text"
              onClick={() => window.open('https://github.com/yourusername/ez-cut')}
            >
              GitHub
            </Button>
            <Button 
              icon={<Settings size={16} />}
              type="text"
            >
              设置
            </Button>
          </Space>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;
