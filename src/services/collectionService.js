import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/collections';

// Tạo collection mới (cần token)
export const createCollection = (token, collectionData) =>
  axios.post(`${API}`, collectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Lấy tất cả collections theo courseId (public)
export const getCollectionsByCourse = (courseId) =>
  axios.get(`${API}/course/${courseId}`);

// Lấy chi tiết 1 collection theo ID (public hoặc teacher)
export const getCollectionById = (collectionId) =>
  axios.get(`${API}/${collectionId}`);

// Cập nhật collection theo ID (cần token)
export const updateCollection = (token, collectionId, collectionData) =>
  axios.put(`${API}/${collectionId}`, collectionData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Xoá collection theo ID (cần token)
export const deleteCollection = (token, collectionId) =>
  axios.delete(`${API}/${collectionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Cập nhật thứ tự bài học trong collection (cần token)
export const reorderCollection = (token, collectionId, lessonIdList) =>
  axios.put(`${API}/${collectionId}/reorder-lessons`, { lessons: lessonIdList }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
