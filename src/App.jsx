// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import MyCoursePage from './pages/MyCoursePage';
import CourseDetailPage from './pages/teacher/CourseDetail';
import CourseFormPage from './pages/teacher/CourseFormPage';
import { AuthProvider, useAuth } from './context/authContext';
import Loading from './components/Loading';
import StudentHome from "./pages/student/Home";
import StudentCourseDetail from "./pages/student/CourseDetail";
import PaymentCallback from './pages/PaymentCallback';
import LessonLearn from './pages/student/LessonLearn';
function PrivateRoute({ element }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return element;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Layout style={{ minHeight: '100vh' }}>
          <Sidebar />
          <Layout style={{ padding: '0 24px 24px' }}>
            <Routes>
              {/* Route cho giáo viên */}
              <Route path="/my-courses" element={<PrivateRoute element={<MyCoursePage />} />} />
              <Route path="/courses/:courseId" element={<PrivateRoute element={<CourseDetailPage />} />} />
              <Route path="/courses/create" element={<PrivateRoute element={<CourseFormPage />} />} />
              <Route path="/courses/:courseId/edit" element={<PrivateRoute element={<CourseFormPage />} />} />
              
              {/* <Route path="/" element={<Home />} /> */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/*route cho student*/}
              <Route path="/" element={<StudentHome />} />
              <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/student/lessons/:lessonId" element={<LessonLearn />} />
            </Routes>
          </Layout>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

