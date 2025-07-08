// src/services/authService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/auth';
console.log("✅ ENV:", process.env.REACT_APP_API_BASE_URL);

export const login = (data) => axios.post(`${API}/login`, data);
export const register = (data) => axios.post(`${API}/register`, data);

export const sendVerificationCode = (email) =>
  axios.post(`${API}/send-code`, { email });

export const verifyEmailCode = (email, code) =>
  axios.post(`${API}/verify-code`, { email, code });

export const loginWithGoogle = () => {
  window.location.href = `${API}/google`; // chuyển hướng tới server OAuth
};