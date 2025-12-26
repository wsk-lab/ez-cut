import React from 'react';
import { Row, Col, Tabs } from 'antd';
import VideoPlayer from './VideoPlayer';
import QuickCutPanel from './QuickCutPanel';
import Timeline from './Timeline';
import ExportPanel from './ExportPanel';
import './VideoWorkspace.css';

const { TabPane } = Tabs;

const VideoWorkspace: React.FC = () => {
  return (
    <div className="video-workspace">
      <Row gutter={[16, 16]} className="workspace-container">
        <Col xs={24} lg={16}>
          <div className="video-container">
            <VideoPlayer />
            <Timeline />
          </div>
        </Col>
        
        <Col xs={24} lg={8}>
          <div className="control-panel">
            <Tabs defaultActiveKey="cut" size="middle">
              <TabPane tab="快速剪辑" key="cut">
                <QuickCutPanel />
              </TabPane>
              <TabPane tab="导出设置" key="export">
                <ExportPanel />
              </TabPane>
            </Tabs>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default VideoWorkspace;
