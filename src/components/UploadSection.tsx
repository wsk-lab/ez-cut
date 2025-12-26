import React, { useCallback } from 'react';
import { Upload, Video, Zap } from 'lucide-react';
import { Button, Card, Typography } from 'antd';
import { useVideoStore } from '../store/videoStore';
import './UploadSection.css';

const { Title, Text } = Typography;

const UploadSection: React.FC = () => {
  const { loadVideo } = useVideoStore();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      loadVideo(file);
    }
  }, [loadVideo]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      loadVideo(file);
    }
  }, [loadVideo]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const handleNativeSelect = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.selectVideoFile();
      if (!result.canceled && result.filePaths.length > 0) {
        try {
          const file = await window.electronUtils.filePathToFile(result.filePaths[0]);
          loadVideo(file);
        } catch (error) {
          console.error('加载文件失败:', error);
        }
      }
    }
  };

  return (
    <div className="upload-section">
      <Card className="upload-card">
        <div className="upload-content">
          <div className="upload-icon">
            <Video size={64} />
          </div>

          <Title level={2}>EZ CUT - 智能视频剪辑</Title>
          <Text type="secondary">简单易用的视频剪辑工具，快速切割，无损质量</Text>

          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => {
              if (window.electronAPI) {
                handleNativeSelect();
              }
            }}
          >
            <Upload size={48} className="drop-icon" />
            <Title level={4}>拖放视频文件到这里</Title>
            <Text>或点击选择文件</Text>

            <div className="upload-actions">
              {!window.electronAPI ? (
                <label className="file-input-label">
                  <input
                    type="file"
                    accept="video/*"
                    className="file-input"
                    onChange={handleFileSelect}
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<Upload size={16} />}
                    style={{ pointerEvents: 'none' }}
                  >
                    选择视频文件
                  </Button>
                </label>
              ) : (
                <Button
                  type="primary"
                  size="large"
                  icon={<Upload size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNativeSelect();
                  }}
                >
                  选择视频文件
                </Button>
              )}
            </div>
          </div>

          <div className="supported-formats">
            <Text strong>支持格式: </Text>
            <Text>MP4, MOV, AVI, MKV, WebM, FLV, WMV</Text>
          </div>

          <div className="features">
            <div className="feature-item">
              <Zap size={20} />
              <span>无损快速切割</span>
            </div>
            <div className="feature-item">
              <Zap size={20} />
              <span>多平台支持</span>
            </div>
            <div className="feature-item">
              <Zap size={20} />
              <span>简单易用</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UploadSection;
