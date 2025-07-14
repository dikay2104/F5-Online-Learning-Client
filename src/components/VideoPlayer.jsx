import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Progress, Button, message, Tooltip, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { saveProgress, getLessonProgress, formatTime } from '../services/progressService';
import YouTube from 'react-youtube';

function getYoutubeVideoId(url) {
  const match = url && url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? match[1] : null;
}

const VideoPlayer = ({ 
  lesson, 
  courseId, 
  onProgressUpdate, 
  autoSaveInterval = 5000, // Lưu progress mỗi 5 giây
  completionThreshold = 0.8 // 80% để coi là hoàn thành
}) => {
  const playerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(0);
  const [initialProgress, setInitialProgress] = useState(null);
  const [playerReady, setPlayerReady] = useState(false);
  const hasShownResumeMsg = useRef(false);

  const videoId = getYoutubeVideoId(lesson?.videoUrl);

  // Lấy progress ban đầu khi component mount
  useEffect(() => {
    hasShownResumeMsg.current = false; // reset khi đổi bài học
    if (lesson?._id) {
      loadInitialProgress();
    }
  }, [lesson?._id]);

  const loadInitialProgress = async () => {
    try {
      const response = await getLessonProgress(lesson._id);
      const progressData = response.data.data;
      setInitialProgress(progressData);
      setCurrentTime(progressData.watchedSeconds || 0);
      setProgressPercent(progressData.progressPercent || 0);
      setIsCompleted(progressData.isCompleted || false);
      if (progressData.videoDuration) setDuration(progressData.videoDuration);
      // Nếu có progress, chỉ hiển thị message 1 lần duy nhất
      if (progressData.watchedSeconds > 0 && !hasShownResumeMsg.current) {
        message.info(`Bạn đã xem đến ${formatTime(progressData.watchedSeconds)}`);
        hasShownResumeMsg.current = true;
      }
    } catch (error) {
      console.log('Chưa có tiến độ cho bài học này');
    }
  };

  // Khi player sẵn sàng, set duration và seek đến vị trí đã lưu
  const handlePlayerReady = (event) => {
    playerRef.current = event.target;
    setPlayerReady(true);
    const videoDuration = event.target.getDuration();
    setDuration(videoDuration);
    // Seek đến vị trí đã lưu
    if (initialProgress && initialProgress.watchedSeconds > 0) {
      event.target.seekTo(initialProgress.watchedSeconds, true);
    }
  };

  // Khi video phát/tạm dừng, cập nhật trạng thái
  const handleStateChange = (event) => {
    const yt = window.YT;
    if (!yt) return;
    if (event.data === yt.PlayerState.PLAYING) {
      setIsPlaying(true);
    } else if (event.data === yt.PlayerState.PAUSED || event.data === yt.PlayerState.ENDED) {
      setIsPlaying(false);
    }
  };

  // Theo dõi thời gian thực tế khi video đang phát
  useEffect(() => {
    if (!playerReady || !playerRef.current) return;
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isPlaying, playerReady]);

  // Tính toán progress percent
  useEffect(() => {
    if (duration > 0) {
      const percent = Math.min((currentTime / duration) * 100, 100);
      setProgressPercent(Math.round(percent));
      const completed = (currentTime / duration) >= completionThreshold;
      setIsCompleted(completed);
      if (onProgressUpdate) {
        onProgressUpdate({
          currentTime,
          duration,
          progressPercent: Math.round(percent),
          isCompleted: completed
        });
      }
    }
  }, [currentTime, duration, completionThreshold, onProgressUpdate]);

  // Auto save progress thực tế
  useEffect(() => {
    if (!lesson?._id || !courseId) return;
    const shouldSave = Math.abs(currentTime - lastSavedTime) >= 5;
    if (shouldSave && currentTime > 0) {
      const saveTimeout = setTimeout(() => {
        saveProgressToServer();
      }, autoSaveInterval);
      return () => clearTimeout(saveTimeout);
    }
  }, [currentTime, lastSavedTime, lesson?._id, courseId, autoSaveInterval]);

  const saveProgressToServer = useCallback(async () => {
    if (!lesson?._id || !courseId || saving) return;
    try {
      setSaving(true);
      await saveProgress(lesson._id, {
        watchedSeconds: Math.floor(currentTime),
        videoDuration: duration,
        courseId: courseId
      });
      setLastSavedTime(currentTime);
      if (Math.abs(currentTime - lastSavedTime) >= 10) {
        message.success('Đã lưu tiến độ học tập');
      }
    } catch (error) {
      console.error('Lỗi khi lưu tiến độ:', error);
      message.error('Không thể lưu tiến độ học tập');
    } finally {
      setSaving(false);
    }
  }, [lesson?._id, courseId, currentTime, duration, saving, lastSavedTime]);

  // Điều khiển phát/tạm dừng
  const handlePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // Seek đến vị trí mới khi click progress bar
  const handleSeek = (percent) => {
    if (!playerRef.current) return;
    const newTime = (percent / 100) * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  // Làm lại từ đầu
  const handleReset = () => {
    if (!playerRef.current) return;
    playerRef.current.seekTo(0, true);
    setCurrentTime(0);
    setProgressPercent(0);
    setIsCompleted(false);
    setIsPlaying(false);
    setLastSavedTime(0);
  };

  if (!lesson?.videoUrl || !videoId) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>Không có video hợp lệ cho bài học này</p>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{lesson.title}</span>
          {isCompleted && (
            <Tooltip title="Bài học đã hoàn thành">
              <span style={{ color: '#52c41a', fontSize: '16px' }}>✓</span>
            </Tooltip>
          )}
        </div>
      }
      extra={
        <Space>
          <Button 
            type={isPlaying ? "default" : "primary"}
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlayPause}
            disabled={!duration}
          >
            {isPlaying ? 'Tạm dừng' : 'Phát'}
          </Button>
          <Button 
            icon={<ReloadOutlined />}
            onClick={handleReset}
            disabled={currentTime === 0}
          >
            Làm lại
          </Button>
        </Space>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        <YouTube
          videoId={videoId}
          opts={{ width: '100%', height: '400' }}
          onReady={handlePlayerReady}
          onStateChange={handleStateChange}
        />
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Tiến độ: {formatTime(currentTime)} / {formatTime(duration)}</span>
          <span>{progressPercent}%</span>
        </div>
        <Progress 
          percent={progressPercent} 
          status={isCompleted ? "success" : "active"}
          strokeColor={isCompleted ? "#52c41a" : "#1890ff"}
          onClick={handleSeek}
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Progress Info */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '12px',
        backgroundColor: '#f5f5f5',
        borderRadius: '6px'
      }}>
        <div>
          <strong>Trạng thái:</strong> {isCompleted ? 'Đã hoàn thành' : 'Đang học'}
        </div>
        <div>
          <strong>Lưu tự động:</strong> {saving ? 'Đang lưu...' : 'Đã lưu'}
        </div>
      </div>

      {/* Description */}
      {lesson.description && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
          <h4>Mô tả bài học:</h4>
          <p>{lesson.description}</p>
        </div>
      )}
    </Card>
  );
};

export default VideoPlayer; 