// src/services/userService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/users';

export const getCurrentUser = (token) =>
  axios.get(`${API}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

// admin 
export const getAllUsers = () =>
  axios.get(`${API}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const banUser = (id) =>
  axios.put(`${API}/${id}/ban`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const unbanUser = (id) =>
  axios.put(`${API}/${id}/unban`, {}, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const updateCurrentUser = (data) =>
  axios.put(`${API}/profile`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });