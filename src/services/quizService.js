import axios from 'axios';

const API = `${process.env.REACT_APP_API_BASE_URL}/quizzes`;

// Lấy tất cả quiz (có thể dùng cho admin hoặc giáo viên)
export const getAllQuizzes = (token) =>
  axios.get(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// Lấy thông tin chi tiết một quiz (ẩn đáp án đúng)
export const getQuizById = (quizId) =>
  axios.get(`${API}/${quizId}`);

// Nộp bài làm quiz để chấm điểm
export const submitQuiz = (quizId, answers) =>
  axios.post(`${API}/${quizId}/submit`, answers, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

// Tạo quiz mới và thêm vào collection (nếu có collectionId)
export const createQuiz = (token, quizData) =>
  axios.post(API, quizData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
