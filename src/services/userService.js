// src/services/userService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/users';

export const getCurrentUser = (token) =>
  axios.get(`${API}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
