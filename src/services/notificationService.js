import axios from 'axios';

const API = `${process.env.REACT_APP_API_BASE_URL}/notifications`;

// Lấy tất cả thông báo của người dùng hiện tại
export const getNotifications = (token) =>
  axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Đánh dấu 1 thông báo là đã đọc (method: PATCH, endpoint: /:id/read)
export const markAsRead = (token, notificationId) =>
  axios.patch(`${API}/${notificationId}/read`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Đánh dấu tất cả thông báo là đã đọc (method: PATCH, endpoint: /read/all)
export const markAllAsRead = (token) =>
  axios.patch(`${API}/read/all`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Xoá một thông báo (method: DELETE, endpoint: /:id)
export const deleteNotification = (token, notificationId) =>
  axios.delete(`${API}/${notificationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
