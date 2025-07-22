import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/statistics';

export const getTeacherStatistics = () =>
  axios.get(`${API}/teacher`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
