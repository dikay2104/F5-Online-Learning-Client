import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL + '/lessons';

export const getLessonsByCourse = (courseId) =>
    axios.get(`${API}/course/${courseId}`);

export const getLessonById = (lessonId) =>
    axios.get(`${API}/${lessonId}`);

export const getTeacherLessons = (token, { page = 1, limit = 10, search = '' }) =>
    axios.get(`${API}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        params: { page, limit, search },
    });

export const createLesson = (token, lessonData) =>
    axios.post(`${API}`, lessonData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const updateLesson = (token, lessonId, lessonData) =>
    axios.put(`${API}/${lessonId}`, lessonData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

export const deleteLesson = (token, lessonId) =>
    axios.delete(`${API}/${lessonId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
