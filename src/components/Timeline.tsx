import React, { useRef, useEffect, useState } from 'react';
import { Slider, Button, Space } from 'antd';
import { Play, Pause, RotateCcw, RotateCw, Scissors } from 'lucide-react';
import { useVideoStore } from '../store/videoStore';
import './Timeline.css';

const Timeline: React.FC = () => {
  const {
    currentTime,
    duration,
    startTime,
    endTime,
    isPlaying,
    setCurrentTime,
    setClipRange,
    play,
    pause
  } = useVideoStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<any>(null);

  // 处理时间轴点击
  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    setCurrentTime(Math.max(0, Math.min(duration, newTime)));
  };

  // 设置剪辑标记
  const setCutMarker = (type: 'start' | 'end') => {
    if (type === 'start') {
      setClipRange(currentTime, Math.max(currentTime + 1, endTime));
    } else {
      setClipRange(startTime, Math.min(duration, currentTime));
    }
  };

  // 快速跳转
  const quickJump = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 计算剪辑区域宽度
  const getClipRegionStyle = () => {
    if (duration <= 0) return { left: '0%', width: '0%' };
    
    const left = (startTime / duration) * 100;
    const width = ((endTime - startTime) / duration) * 100;
    
    return {
      left: `${left}%`,
      width: `${width}%`
    };
  };

  if (duration <= 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-placeholder">
          <p>加载视频中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* 播放控制栏 */}
      <div className="playback-controls">
        <Space>
          <Button
            type="text"
            icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
            onClick={isPlaying ? pause : play}
            className="play-button"
          />
          
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          
          <Button.Group>
            <Button 
              type="text" 
              icon={<RotateCcw size={14} />}
              onClick={() => quickJump(-5)}
              title="后退5秒"
            >
              -5s
            </Button>
            <Button 
              type="text" 
              icon={<RotateCw size={14} />}
              onClick={() => quickJump(5)}
              title="前进5秒"
            >
              +5s
            </Button>
          </Button.Group>
        </Space>
        
        <Space>
          <Button
            size="small"
            icon={<Scissors size={12} />}
            onClick={() => setCutMarker('start')}
            type={Math.abs(currentTime - startTime) < 1 ? 'primary' : 'default'}
          >
            设开始
          </Button>
          <Button
            size="small"
            icon={<Scissors size={12} />}
            onClick={() => setCutMarker('end')}
            type={Math.abs(currentTime - endTime) < 1 ? 'primary' : 'default'}
          >
            设结束
          </Button>
        </Space>
      </div>

      {/* 主时间轴 */}
      <div className="timeline-main">
        <div 
          className="timeline-track"
          onClick={handleTimelineClick}
        >
          {/* 背景轨道 */}
          <div className="timeline-background" />
          
          {/* 剪辑区域高亮 */}
          <div 
            className="clip-region" 
            style={getClipRegionStyle()}
          />
          
          {/* 当前时间指针 */}
          <div 
            className="playhead" 
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="playhead-line" />
            <div className="playhead-dot" />
          </div>
          
          {/* 开始标记 */}
          <div 
            className="marker start-marker" 
            style={{ left: `${(startTime / duration) * 100}%` }}
            title={`开始: ${formatTime(startTime)}`}
          />
          
          {/* 结束标记 */}
          <div 
            className="marker end-marker" 
            style={{ left: `${(endTime / duration) * 100}%` }}
            title={`结束: ${formatTime(endTime)}`}
          />
        </div>
        
        {/* Slider 控件（精确控制） */}
        <Slider
          ref={sliderRef}
          value={currentTime}
          max={duration}
          step={0.1}
          onChange={(value) => {
            setIsDragging(true);
            setCurrentTime(value);
          }}
          onChangeComplete={() => setIsDragging(false)}
          tooltip={{ 
            formatter: (value) => formatTime(value || 0),
            open: isDragging ? true : undefined 
          }}
          className="timeline-slider"
        />
      </div>

      {/* 时间刻度 */}
      <div className="time-ticks">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <div key={ratio} className="time-tick">
            <div className="tick-line" />
            <span className="tick-label">{formatTime(duration * ratio)}</span>
          </div>
        ))}
      </div>

      {/* 剪辑信息 */}
      <div className="clip-info">
        <Space>
          <span>剪辑范围: {formatTime(startTime)} - {formatTime(endTime)}</span>
          <span className="duration-badge">
            时长: {formatTime(endTime - startTime)}
          </span>
        </Space>
      </div>
    </div>
  );
};

export default Timeline;
