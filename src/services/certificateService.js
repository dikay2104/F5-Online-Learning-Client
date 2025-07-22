import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/certificates';

export const issueCertificate = (courseId) =>
  axios.post(`${API}/issue`, { courseId }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const getMyCertificates = () =>
  axios.get(`${API}/my`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const getCertificateById = (certificateId) =>
  axios.get(`${API}/${certificateId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

export const editCertificateName = (certificateId, newName) =>
  axios.post(`${API}/${certificateId}/edit-name`, { newName }, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  }); 