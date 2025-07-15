import axios from 'axios';

export function getCommentsByLesson(lessonId) {
  return axios.get(`${process.env.REACT_APP_API_BASE_URL}/comments`, {
    params: { lesson: lessonId }
  });
}

export function createComment(data) {
  // data: { lesson, content }
  return axios.post(`${process.env.REACT_APP_API_BASE_URL}/comments`, data, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });
}

export function updateComment(id, content) {
  return axios.put(
    `${process.env.REACT_APP_API_BASE_URL}/comments/${id}`,
    { content },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
}

export function deleteComment(id) {
  return axios.delete(
    `${process.env.REACT_APP_API_BASE_URL}/comments/${id}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
}

export function likeComment(id, type) {
  // type: 'like' hoặc 'dislike'
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/comments/${id}/like`,
    { type },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
}

export function replyComment(id, content) {
  return axios.post(
    `${process.env.REACT_APP_API_BASE_URL}/comments/${id}/reply`,
    { content },
    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
  );
} 