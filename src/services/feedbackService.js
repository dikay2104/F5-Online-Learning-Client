import axios from "axios";
const API_URL = process.env.REACT_APP_API_BASE_URL + "/feedbacks";

export const getAllFeedbacks = () =>
  axios.get(API_URL, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const deleteFeedback = (id) =>
  axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const replyFeedback = (id, reply) =>
  axios.post(`${API_URL}/${id}/reply`, { content: reply }, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const getFeedbacksByCourse = (courseId) =>
  axios.get(`${API_URL}?course=${courseId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export const createFeedback = (data) =>
  axios.post(API_URL, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });
