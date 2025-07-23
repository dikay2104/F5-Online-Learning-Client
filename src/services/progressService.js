import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/progress' || 'http://localhost:3001/api/progress';

// Lưu tiến độ xem video
export const saveProgress = (lessonId, data) => {
  const token = localStorage.getItem('token');
  return axios.post(`${API}/lesson/${lessonId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy tiến độ các bài học trong khóa học
export const getProgressByCourse = (courseId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API}/course/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy tiến độ tổng quan của user
export const getUserProgress = () => {
  const token = localStorage.getItem('token');
  return axios.get(`${API}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy tiến độ chi tiết của một bài học
export const getLessonProgress = (lessonId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API}/lesson/${lessonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Xóa tiến độ của một bài học (reset progress)
export const deleteLessonProgress = (lessonId) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${API}/lesson/${lessonId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Lấy thống kê tiến độ cho teacher
export const getCourseProgressStats = (courseId) => {
  const token = localStorage.getItem('token');
  return axios.get(`${API}/course/${courseId}/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Utility function để tính % hoàn thành
export const calculateProgressPercent = (watchedSeconds, videoDuration) => {
  if (!videoDuration || videoDuration === 0) return 0;
  return Math.min((watchedSeconds / videoDuration) * 100, 100);
};

// Utility function để kiểm tra bài học đã hoàn thành chưa
export const isLessonCompleted = (watchedSeconds, videoDuration, threshold = 0.8) => {
  if (!videoDuration || videoDuration === 0) return false;
  return (watchedSeconds / videoDuration) >= threshold;
};

// Utility function để format thời gian
export const formatTime = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}; 