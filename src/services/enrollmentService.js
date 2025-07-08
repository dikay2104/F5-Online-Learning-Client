import axios from "axios";
const API = process.env.REACT_APP_API_BASE_URL + '/enrollments';

export const enrollCourse = (courseId) =>
  axios.post(`${API}`, { courseId }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const createPayment = (courseId) =>
  axios.post(`${API}/payment`, { courseId }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const getMyEnrollments = () =>
  axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });