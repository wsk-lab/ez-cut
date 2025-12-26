import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { Heart, Github, Mail, Globe } from 'lucide-react';

const { Footer } = Layout;
const { Text, Link } = Typography;

const BrandFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Footer style={{ 
      background: 'rgba(255, 255, 255, 0.9)', 
      padding: '16px 24px',
      textAlign: 'center'
    }}>
      <Divider />
      
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        <Text strong style={{ color: '#1890ff' }}>
          EZ CUT · Made with <Heart size={12} style={{ color: '#ff4d4f' }} /> by WSK-Lab
        </Text>
        
        <Text type="secondary" style={{ fontSize: '12px' }}>
          © {currentYear} WSK-Lab. 保留所有权利. EZ CUT 是 WSK-Lab 的注册商标.
        </Text>
        
        <Space size="middle">
          <Link 
            href="https://wsk-lab.com" 
            target="_blank"
            style={{ fontSize: '12px', color: '#666' }}
          >
            <Globe size={12} style={{ marginRight: 4 }} />
            官方网站
          </Link>
          
          <Link 
            href="https://github.com/wsk-lab/ez-cut" 
            target="_blank"
            style={{ fontSize: '12px', color: '#666' }}
          >
            <Github size={12} style={{ marginRight: 4 }} />
            GitHub
          </Link>
          
          <Link 
            href="mailto:contact@wsk-lab.com"
            style={{ fontSize: '12px', color: '#666' }}
          >
            <Mail size={12} style={{ marginRight: 4 }} />
            联系我们
          </Link>
        </Space>
        
        <Text type="secondary" style={{ fontSize: '11px' }}>
          Version 1.0.0 · MIT License
        </Text>
      </Space>
    </Footer>
  );
};

export default BrandFooter;
