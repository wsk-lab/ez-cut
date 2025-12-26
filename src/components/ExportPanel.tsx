import React, { useState } from 'react';
import { Card, Button, Select, Slider, Space, Typography, Switch, Row, Col, Progress, message } from 'antd';
import { Download, Settings, Zap, Highlighter, CheckCircle } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';
import './ExportPanel.css';

const { Title, Text } = Typography;
const { Option } = Select;

// 导出预设配置
const EXPORT_PRESETS = {
  'high': { quality: 90, bitrate: '8000k', label: '高质量' },
  'medium': { quality: 80, bitrate: '4000k', label: '平衡' },
  'low': { quality: 70, bitrate: '2000k', label: '快速' }
};

const PLATFORM_PRESETS = {
  'default': { format: 'mp4', quality: 'medium', resolution: 'original' },
  'tiktok': { format: 'mp4', quality: 'high', resolution: '1080x1920' },
  'youtube': { format: 'mp4', quality: 'high', resolution: '1920x1080' },
  'wechat': { format: 'mp4', quality: 'medium', resolution: '1280x720' },
  'bilibili': { format: 'mp4', quality: 'high', resolution: '1920x1080' }
};

const ExportPanel: React.FC = () => {
  const { 
    currentVideo, 
    startTime, 
    endTime, 
    fastCut,
    isProcessing,
    progress 
  } = useVideoStore();
  
  const [exportSettings, setExportSettings] = useState({
    format: 'mp4' as 'mp4' | 'mov' | 'webm',
    quality: 'medium' as keyof typeof EXPORT_PRESETS,
    platform: 'default' as keyof typeof PLATFORM_PRESETS,
    includeAudio: true,
    customResolution: false,
    resolution: 'original'
  });

  // 处理导出
  const handleExport = async () => {
    if (!currentVideo) {
      message.error('请先选择视频文件');
      return;
    }

    if (endTime - startTime <= 0) {
      message.error('请设置有效的剪辑范围');
      return;
    }

    try {
      const resultBlob = await fastCut();
      
      // 创建下载链接
      const url = URL.createObjectURL(resultBlob);
      const fileName = generateFileName();
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('视频导出成功！');
    } catch (error: any) {
      message.error(`导出失败: ${error.message}`);
    }
  };

  // 生成文件名
  const generateFileName = (): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const duration = formatTime(endTime - startTime);
    return `EZ-CUT-${duration}-${timestamp}.${exportSettings.format}`;
  };

  // 应用平台预设
  const applyPlatformPreset = (platform: keyof typeof PLATFORM_PRESETS) => {
    const preset = PLATFORM_PRESETS[platform];
    setExportSettings(prev => ({
      ...prev,
      platform,
      format: preset.format,
      quality: preset.quality,
      resolution: preset.resolution
    }));
  };

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m${secs}s`;
  };

  // 计算文件大小估算
  const calculateFileSize = (): string => {
    const duration = endTime - startTime;
    const bitrate = EXPORT_PRESETS[exportSettings.quality].bitrate;
    const kbps = parseInt(bitrate) * (exportSettings.includeAudio ? 1.2 : 1);
    const sizeMB = (kbps * duration) / (8 * 1024);
    
    if (sizeMB < 1024) {
      return `${Math.round(sizeMB)} MB`;
    } else {
      return `${(sizeMB / 1024).toFixed(1)} GB`;
    }
  };

  if (!currentVideo) {
    return (
      <Card title="导出设置" className="export-panel">
        <div className="export-placeholder">
          <Download size={48} className="placeholder-icon" />
          <Text type="secondary">请先选择视频文件开始剪辑</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <Space>
          <Download size={18} />
          导出设置
        </Space>
      } 
      className="export-panel"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 处理状态显示 */}
        {isProcessing && (
          <div className="export-progress">
            <Text strong>处理进度</Text>
            <Progress 
              percent={Math.round(progress)} 
              status="active"
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <Text type="secondary">请稍候，视频正在处理中...</Text>
          </div>
        )}

        {/* 平台预设 */}
        <div className="platform-presets">
          <Text strong>平台预设</Text>
          <Space.Compact style={{ width: '100%', marginTop: 8 }}>
            {Object.entries(PLATFORM_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                size="small"
                type={exportSettings.platform === key ? 'primary' : 'default'}
                onClick={() => applyPlatformPreset(key as any)}
              >
                {key === 'default' ? '通用' : 
                 key === 'tiktok' ? '抖音' :
                 key === 'youtube' ? 'YouTube' :
                 key === 'wechat' ? '微信' :
                 key === 'bilibili' ? 'B站' : key}
              </Button>
            ))}
          </Space.Compact>
        </div>

        {/* 导出设置 */}
        <Row gutter={[12, 12]}>
          <Col span={12}>
            <Text strong>格式</Text>
            <Select
              value={exportSettings.format}
              onChange={(value) => setExportSettings(prev => ({ ...prev, format: value }))}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="mp4">MP4 (推荐)</Option>
              <Option value="mov">MOV</Option>
              <Option value="webm">WebM</Option>
            </Select>
          </Col>
          
          <Col span={12}>
            <Text strong>质量</Text>
            <Select
              value={exportSettings.quality}
              onChange={(value) => setExportSettings(prev => ({ ...prev, quality: value }))}
              style={{ width: '100%', marginTop: 4 }}
            >
              <Option value="high">
                <Space size="small">
                  <Highlighter size={12} />
                  高质量
                </Space>
              </Option>
              <Option value="medium">
                <Space size="small">
                  <Settings size={12} />
                  平衡
                </Space>
              </Option>
              <Option value="low">
                <Space size="small">
                  <Zap size={12} />
                  快速
                </Space>
              </Option>
            </Select>
          </Col>
        </Row>

        {/* 高级设置 */}
        <div className="advanced-settings">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Switch
              checked={exportSettings.includeAudio}
              onChange={(checked) => setExportSettings(prev => ({ ...prev, includeAudio: checked }))}
              checkedChildren="包含音频"
              unCheckedChildren="静音"
            />
            
            <Switch
              checked={exportSettings.customResolution}
              onChange={(checked) => setExportSettings(prev => ({ ...prev, customResolution: checked }))}
              checkedChildren="自定义分辨率"
              unCheckedChildren="原始分辨率"
            />
          </Space>
        </div>

        {/* 文件信息 */}
        <div className="file-info">
          <Space direction="vertical" style={{ width: '100%' }}>
            <div className="info-item">
              <Text type="secondary">时长:</Text>
              <Text>{formatTime(endTime - startTime)}</Text>
            </div>
            <div className="info-item">
              <Text type="secondary">估算大小:</Text>
              <Text>{calculateFileSize()}</Text>
            </div>
            <div className="info-item">
              <Text type="secondary">质量:</Text>
              <Text>{EXPORT_PRESETS[exportSettings.quality].label}</Text>
            </div>
          </Space>
        </div>

        {/* 导出按钮 */}
        <Button
          type="primary"
          icon={<Download size={16} />}
          onClick={handleExport}
          loading={isProcessing}
          block
          size="large"
          className="export-button"
        >
          {isProcessing ? `处理中 ${Math.round(progress)}%` : '导出视频'}
        </Button>

        {/* 导出提示 */}
        {!isProcessing && (
          <div className="export-tips">
            <Space size="small">
              <CheckCircle size={12} className="tip-icon" />
              <Text type="secondary" className="tip-text">
                格式: {exportSettings.format.toUpperCase()} | 
                质量: {EXPORT_PRESETS[exportSettings.quality].label} | 
                大小: {calculateFileSize()}
              </Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default ExportPanel;
