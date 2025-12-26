import React from 'react';
import { Modal, Typography, Space, Divider, Tag, Card, Row, Col } from 'antd';
import {
  ExternalLink,
  Code,
  Users,
  Heart,
  Star,
  Github,
  Mail,
  Globe,
  Zap,
  Scissors
} from 'lucide-react';
import './AboutDialog.css';

const { Title, Text, Paragraph } = Typography;

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

const AboutDialog: React.FC<AboutDialogProps> = ({ open, onClose }) => {
  const appVersion = '1.0.0';
  const electronVersion = (typeof process !== 'undefined' && process.versions?.electron) || '未知';
  const chromeVersion = (typeof process !== 'undefined' && process.versions?.chrome) || '未知';
  const nodeVersion = (typeof process !== 'undefined' && process.versions?.node) || '未知';

  const features = [
    { icon: Zap, title: '无损快速切割', desc: '基于FFmpeg流复制技术' },
    { icon: Scissors, title: '智能剪辑', desc: 'AI辅助选择最佳剪辑点' },
    { icon: Code, title: '开源技术', desc: 'Electron + React + TypeScript' },
    { icon: Users, title: '中文优化', desc: '专为中文用户设计' }
  ];

  const technologies = [
    'Electron', 'React 18', 'TypeScript', 'Ant Design',
    'FFmpeg.wasm', 'Zustand', 'Vite'
  ];

  const teamMembers = [
    { name: 'WSK-Lab Team', role: '核心开发', contact: 'contact@wsk-lab.com' },
    { name: '开源社区', role: '贡献者', contact: 'GitHub' }
  ];

  return (
    <Modal
      title={
        <Space>
          <Scissors size={20} />
          <span>关于 EZ CUT</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      className="about-dialog"
      styles={{
        body: { padding: 0 }
      }}
    >
      <div className="about-content">
        {/* 品牌头图 */}
        <div className="brand-header">
          <div className="logo-section">
            <div className="app-logo">
              <Scissors size={48} />
            </div>
            <div className="app-info">
              <Title level={2} className="app-title">EZ CUT</Title>
              <Text className="app-subtitle">智能视频剪辑软件</Text>
            </div>
          </div>
          <div className="version-tags">
            <Tag color="blue">v{appVersion}</Tag>
            <Tag color="green">稳定版</Tag>
            <Tag color="orange">MIT 许可证</Tag>
          </div>
        </div>

        <Divider />

        {/* 特性介绍 */}
        <div className="features-section">
          <Title level={4}>✨ 特性介绍</Title>
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            {features.map((feature, index) => (
              <Col span={12} key={index}>
                <Card size="small" className="feature-card">
                  <Space>
                    <feature.icon size={20} className="feature-icon" />
                    <div>
                      <Text strong>{feature.title}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {feature.desc}
                      </Text>
                    </div>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* 技术栈 */}
        <div className="tech-section">
          <Title level={4}>🛠️ 技术架构</Title>
          <div className="tech-tags">
            {technologies.map(tech => (
              <Tag key={tech} icon={<Code size={12} />} className="tech-tag">
                {tech}
              </Tag>
            ))}
          </div>
        </div>

        {/* 版本信息 */}
        <div className="version-section">
          <Title level={4}>📊 版本信息</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="version-item">
              <Text strong>EZ CUT:</Text>
              <Text>v{appVersion}</Text>
            </div>
            <div className="version-item">
              <Text strong>Electron:</Text>
              <Text>{electronVersion}</Text>
            </div>
            <div className="version-item">
              <Text strong>Chrome:</Text>
              <Text>{chromeVersion}</Text>
            </div>
            <div className="version-item">
              <Text strong>Node.js:</Text>
              <Text>{nodeVersion}</Text>
            </div>
          </Space>
        </div>

        {/* 团队信息 */}
        <div className="team-section">
          <Title level={4}>👥 开发团队</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {teamMembers.map((member, index) => (
              <Card key={index} size="small" className="team-card">
                <Space>
                  <Users size={16} />
                  <div>
                    <Text strong>{member.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {member.role} · {member.contact}
                    </Text>
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </div>

        {/* 版权信息 */}
        <div className="copyright-section">
          <Title level={4}>© 版权信息</Title>
          <Paragraph type="secondary">
            <Text>Copyright © 2024 WSK-Lab. 保留所有权利。</Text>
            <br />
            <Text>EZ CUT 是 WSK-Lab 的注册商标。</Text>
            <br />
            <Text>本软件基于 MIT 开源协议发布。</Text>
          </Paragraph>
        </div>

        {/* 联系信息 */}
        <div className="contact-section">
          <Title level={4}>📞 联系我们</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="contact-item">
              <Globe size={14} />
              <Text>官方网站: </Text>
              <a
                href="https://wsk-lab.com"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                https://wsk-lab.com
              </a>
            </div>
            <div className="contact-item">
              <Github size={14} />
              <Text>开源地址: </Text>
              <a
                href="https://github.com/wsk-lab/ez-cut"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-link"
              >
                github.com/wsk-lab/ez-cut
              </a>
            </div>
            <div className="contact-item">
              <Mail size={14} />
              <Text>技术支持: </Text>
              <a
                href="mailto:contact@wsk-lab.com"
                className="contact-link"
              >
                contact@wsk-lab.com
              </a>
            </div>
          </Space>
        </div>

        {/* 致谢 */}
        <div className="acknowledgement">
          <Card size="small" className="acknowledgement-card">
            <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
              <Heart size={16} className="heart-icon" />
              <Text type="secondary" style={{ fontSize: 12 }}>
                感谢所有贡献者和用户的支持！
                <br />
                Made with ❤️ by WSK-Lab
              </Text>
            </Space>
          </Card>
        </div>
      </div>
    </Modal>
  );
};

export default AboutDialog;
