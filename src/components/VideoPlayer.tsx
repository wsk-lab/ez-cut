import React, { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Button, Slider } from 'antd';
import { useVideoStore } from '../store/videoStore';
import './VideoPlayer.css';

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const {
    currentVideo,
    videoUrl,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    setCurrentTime,
    setDuration,
    play,
    pause,
    setPlaybackRate
  } = useVideoStore();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      // 只有在非拖拽状态下才同步时间到 store
      setCurrentTime(video.currentTime);
    };

    const handleLoaded = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', handleLoaded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', handleLoaded);
    };
  }, [setCurrentTime, setDuration]);

  // 控制播放/暂停同步
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(err => console.error('播放失败:', err));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // 控制播放倍速同步
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  if (!currentVideo || !videoUrl) {
    return (
      <div className="video-player empty">
        <div className="empty-state">
          <p>请先上传视频文件</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player">
      <video
        ref={videoRef}
        src={videoUrl}
        className="video-element"
        onClick={isPlaying ? pause : play}
      />

      <div className="video-controls">
        <Button
          icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
          onClick={isPlaying ? pause : play}
        />

        <Slider
          value={currentTime}
          max={duration}
          step={0.1}
          onChange={(value) => {
            setCurrentTime(value);
            if (videoRef.current) videoRef.current.currentTime = value;
          }}
          style={{ flex: 1, margin: '0 16px' }}
        />

        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        <Button.Group>
          <Button icon={<RotateCcw size={16} />} onClick={() => setPlaybackRate(0.5)}>
            0.5x
          </Button>
          <Button onClick={() => setPlaybackRate(1)}>1x</Button>
          <Button icon={<RotateCw size={16} />} onClick={() => setPlaybackRate(2)}>
            2x
          </Button>
        </Button.Group>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default VideoPlayer;
