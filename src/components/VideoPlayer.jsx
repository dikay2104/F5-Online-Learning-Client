import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Card, Progress, Button, message, Tooltip, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { saveProgress, getLessonProgress, formatTime } from '../services/progressService';
import YouTube from 'react-youtube';

function getYoutubeVideoId(url) {
  const match = url && url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? match[1] : null;
}

function getDriveFileId(url) {
  const match = url && url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function getDrivePreviewUrl(url) {
  const fileId = getDriveFileId(url);
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : null;
}

function isCloudinaryVideo(url) {
  return url && url.includes('res.cloudinary.com') && url.match(/\.(mp4|mov|webm)$/i);
}

function isMp4Video(url) {
  return url && url.match(/\.(mp4|mov|webm)$/i);
}

const VideoPlayer = ({ 
  lesson, 
  courseId, 
  onProgressUpdate, 
  autoSaveInterval = 5000, // Lưu progress mỗi 5 giây
  completionThreshold = 0.8 // 80% để coi là hoàn thành
}) => {
  const playerRef = useRef(null);
  const videoRef = useRef(null); // Thêm ref cho HTML5 video
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
  const [hasShownCompleteMsg, setHasShownCompleteMsg] = useState(false);
  const [ytPlayer, setYtPlayer] = useState(null); // Lưu instance YouTube player

  // State cho Google Drive
  const driveIframeRef = useRef(null);
  const [driveInterval, setDriveInterval] = useState(null);

  // Thêm biến ref lưu last seek time cho YouTube
  const lastSeekTimeRef = useRef(null);

  // Thêm state cho volume
  const [volume, setVolume] = useState(100);

  const videoId = getYoutubeVideoId(lesson?.videoUrl);
  const isYouTube = !!videoId;
  const isDrive = !!getDriveFileId(lesson?.videoUrl);
  const drivePreviewUrl = getDrivePreviewUrl(lesson?.videoUrl);
  const isCloudinary = isCloudinaryVideo(lesson?.videoUrl);
  const isMp4 = isMp4Video(lesson?.videoUrl);
  const isSupported = isYouTube || isDrive || isCloudinary || isMp4;

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

  // Khi player sẵn sàng, set duration và seek đến vị trí đã lưu (YouTube)
  const handlePlayerReady = (event) => {
    playerRef.current = event.target;
    setYtPlayer(event.target);
    setPlayerReady(true);
    setDuration(event.target.getDuration());
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
    // Phát hiện seek (tua) trên YouTube
    if (event.data === yt.PlayerState.PLAYING && playerRef.current) {
      const current = playerRef.current.getCurrentTime();
      if (lastSeekTimeRef.current !== null && Math.abs(current - lastSeekTimeRef.current) > 2) {
        // Nếu tua (seek) > 2s, lưu tiến độ ngay
        setCurrentTime(current);
        saveProgressToServer();
      }
      lastSeekTimeRef.current = current;
    }
  };

  // Theo dõi thời gian thực tế khi video đang phát (YouTube)
  useEffect(() => {
    if (!isYouTube || !playerReady || !playerRef.current) return;
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        console.log('[YouTube] currentTime:', time, 'isPlaying:', isPlaying);
      }, 1000);
    }
    return () => interval && clearInterval(interval);
  }, [isYouTube, isPlaying, playerReady]);

  // Seek lại vị trí đã lưu cho YouTube khi cả player và progress đã sẵn sàng
  useEffect(() => {
    if (
      isYouTube &&
      ytPlayer &&
      typeof ytPlayer.seekTo === 'function' &&
      initialProgress &&
      initialProgress.watchedSeconds > 0
    ) {
      try {
        ytPlayer.seekTo(initialProgress.watchedSeconds, true);
      } catch (e) {
        // Nếu player chưa sẵn sàng, bỏ qua lỗi
        console.warn('YouTube seekTo error:', e);
      }
    }
  }, [isYouTube, ytPlayer, initialProgress]);

  // Reset lastSeekTimeRef khi đổi bài học
  useEffect(() => {
    lastSeekTimeRef.current = null;
  }, [lesson?._id]);

  // Google Drive: Theo dõi thời gian thực tế bằng HTML5 API
  useEffect(() => {
    if (!isDrive || !driveIframeRef.current) return;
    // Lấy thẻ <iframe> và truy cập contentWindow
    const iframe = driveIframeRef.current;
    let videoEl = null;
    let interval = null;
    const tryFindVideo = () => {
      try {
        videoEl = iframe.contentWindow.document.querySelector('video');
        if (videoEl) {
          setDuration(videoEl.duration);
          if (initialProgress && initialProgress.watchedSeconds > 0) {
            videoEl.currentTime = initialProgress.watchedSeconds;
          }
          interval = setInterval(() => {
            setCurrentTime(videoEl.currentTime);
            setIsPlaying(!videoEl.paused);
          }, 1000);
          setDriveInterval(interval);
        } else {
          setTimeout(tryFindVideo, 1000);
        }
      } catch (e) {
        setTimeout(tryFindVideo, 1000);
      }
    };
    tryFindVideo();
    return () => {
      if (interval) clearInterval(interval);
      if (driveInterval) clearInterval(driveInterval);
    };
  }, [isDrive, drivePreviewUrl, initialProgress]);

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
      // Hiện thông báo hoàn thành ngay khi đạt 80% (chỉ hiện 1 lần)
      if (completed && !hasShownCompleteMsg) {
        message.success('Bạn đã hoàn thành bài học! Tiến độ đã được lưu.');
        setHasShownCompleteMsg(true);
      }
      if (!completed && hasShownCompleteMsg) {
        setHasShownCompleteMsg(false); // reset nếu tua lại
      }
    }
  }, [currentTime, duration, completionThreshold, onProgressUpdate, hasShownCompleteMsg]);

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

  // Lưu tiến độ khi rời trang/tab hoặc unmount
  useEffect(() => {
    const saveOnUnload = () => {
      saveProgressToServer();
    };
    window.addEventListener('beforeunload', saveOnUnload);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') saveOnUnload();
    });
    return () => {
      window.removeEventListener('beforeunload', saveOnUnload);
      saveOnUnload(); // Lưu lần cuối khi unmount
    };
  }, [currentTime, duration]);

  // Điều chỉnh âm lượng cho YouTube và HTML5 video
  useEffect(() => {
    if (isYouTube && ytPlayer && typeof ytPlayer.setVolume === 'function') {
      try {
        ytPlayer.setVolume(volume);
      } catch (e) {
        // Nếu player chưa sẵn sàng hoặc đã bị huỷ, bỏ qua lỗi
        console.warn('YouTube setVolume error:', e);
      }
    } else if ((isCloudinary || isMp4) && videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume, isYouTube, ytPlayer, isCloudinary, isMp4]);

  // Khi video HTML5 (Cloudinary/mp4) đã load metadata, seek về vị trí đã lưu
  useEffect(() => {
    if ((isCloudinary || isMp4) && videoRef.current && initialProgress && initialProgress.watchedSeconds > 0) {
      videoRef.current.currentTime = initialProgress.watchedSeconds;
    }
  }, [isCloudinary, isMp4, initialProgress]);

  const saveProgressToServer = useCallback(async (customTime) => {
    if (!lesson?._id || !courseId || saving) return;
    try {
      setSaving(true);
      const timeToSave = customTime !== undefined ? customTime : currentTime;
      console.log('[saveProgress] Gửi progress:', {
        lessonId: lesson._id,
        watchedSeconds: Math.floor(timeToSave),
        videoDuration: duration,
        courseId: courseId
      });
      await saveProgress(lesson._id, {
        watchedSeconds: Math.floor(timeToSave),
        videoDuration: duration,
        courseId: courseId
      });
      setLastSavedTime(timeToSave);
      // Bỏ thông báo lưu tiến độ, chỉ hiện khi hoàn thành
    } catch (error) {
      console.error('Lỗi khi lưu tiến độ:', error);
      message.error('Không thể lưu tiến độ học tập');
    } finally {
      setSaving(false);
    }
  }, [lesson?._id, courseId, currentTime, duration, saving, lastSavedTime, isCompleted]);

  // Điều khiển phát/tạm dừng
  const handlePlayPause = () => {
    if (isYouTube && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } else if ((isCloudinary || isMp4) && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  // Seek đến vị trí mới khi click progress bar
  const handleSeek = (percent) => {
    const newTime = (percent / 100) * duration;
    if (isYouTube && playerRef.current) {
      playerRef.current.seekTo(newTime, true);
    } else if ((isCloudinary || isMp4) && videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
    setCurrentTime(newTime);
  };

  // Làm lại từ đầu
  const handleReset = () => {
    if (isYouTube && playerRef.current) {
      playerRef.current.seekTo(0, true);
    } else if ((isCloudinary || isMp4) && videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setProgressPercent(0);
    setIsCompleted(false);
    setIsPlaying(false);
    setLastSavedTime(0);
  };

  if (!lesson?.videoUrl || !isSupported) {
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
          {/* Chỉ hiện nút điều khiển cho YouTube */}
          {isYouTube && <>
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
          </>}
        </Space>
      }
    >
      <div style={{ marginBottom: '16px' }}>
        {isYouTube && (
          <YouTube
            videoId={videoId}
            opts={{
              width: '100%',
              height: '400',
              playerVars: {
                controls: 1, // Hiện controls gốc, cho phép tua trên YouTube
                disablekb: 0, // Cho phép dùng phím tắt
                modestbranding: 1,
                rel: 0,
              }
            }}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
          />
        )}
        {isDrive && (
          <iframe
            ref={driveIframeRef}
            src={drivePreviewUrl}
            width="100%"
            height="400"
            allow="autoplay"
            frameBorder="0"
            allowFullScreen
            title="Google Drive Video"
          />
        )}
        {(isCloudinary || isMp4) && (
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            width="100%"
            height="400"
            controls
            style={{ borderRadius: 8, background: "#000" }}
            onTimeUpdate={e => setCurrentTime(e.target.currentTime)}
            onLoadedMetadata={e => setDuration(e.target.duration)}
            onEnded={() => {
              const realDuration = videoRef.current?.duration || duration;
              console.log('[onEnded] realDuration:', realDuration);
              setCurrentTime(realDuration);
              setIsCompleted(true);
              saveProgressToServer(realDuration);
            }}
          />
        )}
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Tiến độ: {formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
        <Progress 
          percent={progressPercent} 
          status={isCompleted ? "success" : "active"}
          strokeColor={isCompleted ? "#52c41a" : "#1890ff"}
          style={{ cursor: isYouTube ? 'default' : 'pointer' }}
          // Chỉ cho phép tua khi KHÔNG phải YouTube
          {...(!isYouTube && {
            onClick: e => {
              const rect = e.target.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percent = (clickX / rect.width) * 100;
              handleSeek(percent);
            }
          })}
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