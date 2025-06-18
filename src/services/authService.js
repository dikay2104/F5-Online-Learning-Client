// src/services/authService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/auth';
console.log("✅ ENV:", process.env.REACT_APP_API_BASE_URL);

export const login = (data) => axios.post(`${API}/login`, data);
export const register = (data) => axios.post(`${API}/register`, data);
