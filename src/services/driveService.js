import axios from 'axios';
const API = process.env.REACT_APP_API_BASE_URL + '/drive';

export const uploadVideo = (formData) =>
  axios.post(`${API}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
