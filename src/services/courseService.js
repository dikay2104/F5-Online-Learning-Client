import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/courses';

// Lấy danh sách tất cả các khóa học (public)
export const getAllCourses = (search = '') =>
  axios.get(`${API}`, {
    params: { search },
  });

// Lấy chi tiết 1 khóa học theo ID (public)
export const getCourseById = (courseId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  return axios.get(`${API}/${courseId}`, config);
};

// Lấy khóa học có phân trang dành cho giáo viên (cần token)
export const getTeacherCourses = (token, { page = 1, limit = 10, status = '', search = '' }) =>
  axios.get(`${API}/pagination`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { page, limit, status, search },
  });

// Tạo mới 1 khóa học (cần token)
export const createCourse = (token, courseData) =>
  axios.post(`${API}`, courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Cập nhật khóa học theo ID (cần token)
export const updateCourse = (token, courseId, courseData) =>
  axios.put(`${API}/${courseId}`, courseData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Xoá khóa học theo ID (cần token)
export const deleteCourse = (token, courseId) =>
  axios.delete(`${API}/${courseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const submitCourse = (token, courseId) =>
  axios.put(`${API}/${courseId}/submit`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const approveCourse = (token, courseId) =>
  axios.put(`${API}/${courseId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const rejectCourse = (token, courseId) =>
  axios.put(`${API}/${courseId}/reject`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });

// Tải lên thumbnail bằng Cloudinary thông qua backend
export const uploadThumbnail = (token, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  return axios.post(`${process.env.REACT_APP_API_BASE_URL}/upload/thumbnail`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
};


