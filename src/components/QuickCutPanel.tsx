import React from 'react';
import { Card, Button, Slider, Space, Typography, Switch, Row, Col, InputNumber, message } from 'antd';
import { Scissors, Zap, Clock, Play, Pause } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';
import './QuickCutPanel.css';

const { Title, Text } = Typography;

const QuickCutPanel: React.FC = () => {
  const {
    startTime,
    endTime,
    duration,
    currentTime,
    isPlaying,
    setClipRange,
    setCurrentTime,
    play,
    pause,
    fastCut,
    isProcessing,
    processingMode,
    setProcessingMode
  } = useVideoStore();

  // 快速剪辑处理
  const handleQuickCut = async () => {
    try {
      const resultBlob = await fastCut();

      // 创建下载链接
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EZ-CUT-${formatTime(startTime)}-${formatTime(endTime)}.mp4`;
      a.click();
      URL.revokeObjectURL(url);

      // 显示成功消息
      message.success(`视频剪辑完成！时长: ${formatTime(endTime - startTime)}`);
    } catch (error: any) {
      message.error(`剪辑失败: ${error.message}`);
    }
  };

  // 设置剪辑点为当前时间
  const setCutToCurrentTime = (type: 'start' | 'end') => {
    if (type === 'start') {
      setClipRange(currentTime, Math.max(currentTime + 1, endTime));
    } else {
      setClipRange(startTime, Math.min(duration, currentTime));
    }
  };

  // 快速设置时长
  const setQuickDuration = (seconds: number) => {
    const newEndTime = Math.min(duration, currentTime + seconds);
    setClipRange(currentTime, newEndTime);
  };

  return (
    <Card
      title={
        <Space>
          <Scissors size={18} />
          快速剪辑
        </Space>
      }
      className="quick-cut-panel"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        {/* 处理模式选择 */}
        <div className="mode-selection">
          <Text strong>处理模式</Text>
          <Button.Group style={{ width: '100%', marginTop: 8 }}>
            <Button
              type={processingMode === 'lossless' ? 'primary' : 'default'}
              onClick={() => setProcessingMode('lossless')}
              size="small"
              style={{ flex: 1 }}
            >
              <Zap size={12} /> 极速模式
            </Button>
            <Button
              type={processingMode === 'smart' ? 'primary' : 'default'}
              onClick={() => setProcessingMode('smart')}
              size="small"
              style={{ flex: 1 }}
            >
              <Scissors size={12} /> 智能模式
            </Button>
          </Button.Group>
        </div>

        {/* 时间范围设置 */}
        <div className="time-range-section">
          <div className="section-header">
            <Text strong>剪辑范围</Text>
            <Text type="secondary">{formatTime(endTime - startTime)}</Text>
          </div>

          <Slider
            range
            value={[startTime, endTime]}
            max={duration}
            step={0.1}
            onChange={(values) => setClipRange(values[0], values[1])}
            tooltip={{ formatter: (value) => formatTime(value || 0) }}
          />

          <Row gutter={8} style={{ marginTop: 8 }}>
            <Col span={12}>
              <InputNumber
                size="small"
                value={startTime.toFixed(1)}
                onChange={(value) => setClipRange(Number(value) || 0, endTime)}
                min={0}
                max={endTime - 0.1}
                step={0.1}
                style={{ width: '100%' }}
                addonBefore="开始"
              />
            </Col>
            <Col span={12}>
              <InputNumber
                size="small"
                value={endTime.toFixed(1)}
                onChange={(value) => setClipRange(startTime, Number(value) || duration)}
                min={startTime + 0.1}
                max={duration}
                step={0.1}
                style={{ width: '100%' }}
                addonBefore="结束"
              />
            </Col>
          </Row>
        </div>

        {/* 快速操作 */}
        <div className="quick-actions">
          <Text strong>快速操作</Text>
          <Space.Compact style={{ width: '100%', marginTop: 8 }}>
            <Button
              size="small"
              onClick={() => setCutToCurrentTime('start')}
              icon={<Play size={12} />}
            >
              设开始
            </Button>
            <Button
              size="small"
              onClick={() => setCutToCurrentTime('end')}
              icon={<Pause size={12} />}
            >
              设结束
            </Button>
            <Button
              size="small"
              onClick={() => setQuickDuration(10)}
            >
              10秒
            </Button>
            <Button
              size="small"
              onClick={() => setQuickDuration(30)}
            >
              30秒
            </Button>
          </Space.Compact>
        </div>

        {/* 剪辑按钮 */}
        <Button
          type="primary"
          icon={<Scissors size={16} />}
          onClick={handleQuickCut}
          loading={isProcessing}
          block
          size="large"
          className="cut-button"
        >
          {isProcessing ? `处理中...` : '开始剪辑'}
        </Button>

        {/* 处理信息 */}
        {processingMode === 'lossless' && (
          <div className="processing-info">
            <Space size="small">
              <Zap size={12} className="info-icon" />
              <Text type="secondary" className="info-text">
                极速模式：无损切割，秒级完成
              </Text>
            </Space>
          </div>
        )}

        {processingMode === 'smart' && (
          <div className="processing-info">
            <Space size="small">
              <Scissors size={12} className="info-icon" />
              <Text type="secondary" className="info-text">
                智能模式：优化编码，质量更好
              </Text>
            </Space>
          </div>
        )}
      </Space>
    </Card>
  );
};

// 时间格式化函数
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default QuickCutPanel;
