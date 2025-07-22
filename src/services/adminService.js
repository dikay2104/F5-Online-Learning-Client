import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/admin';

export const getAdminSummary = (token) =>
  axios.get(`${API}/summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
