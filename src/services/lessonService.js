import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/lessons';

export const getLessonsByCourse = (courseId) =>
    axios.get(`${API}/course/${courseId}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });

export const getLessonById = (lessonId) =>
    axios.get(`${API}/${lessonId}`);

export const getTeacherLessons = (token, { page = 1, limit = 10, search = '' }) =>
    axios.get(`${API}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: { page, limit, search },
    });

export const createLesson = (token, lessonData) =>
    axios.post(`${API}`, lessonData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const updateLesson = (token, lessonId, lessonData) =>
    axios.put(`${API}/${lessonId}`, lessonData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const deleteLesson = (token, lessonId) =>
    axios.delete(`${API}/${lessonId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const reorderLessons = (token, reorderList) =>
  axios.put(`${API}/reorder`, reorderList, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const saveLessonProgress = (lessonId, data) =>
  axios.post(`${API}/${lessonId}/progress`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

export const getProgressByCourse = (courseId) =>
  axios.get(`${API}/course/${courseId}/progress`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

// Tải lên video bài học bằng Cloudinary thông qua backend
export const uploadVideo = (token, file) => {
  const formData = new FormData();
  formData.append('video', file);

  return axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload/video`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};