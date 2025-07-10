// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import HomeGuest from './pages/guest/HomeGuest';
import StudentHome from './pages/student/Home';
import MyCoursePage from './pages/MyCoursePage';
import CourseDetailPage from './pages/teacher/CourseDetail';
import CourseFormPage from './pages/teacher/CourseFormPage';
import { AuthProvider, useAuth } from './context/authContext';
import Loading from './components/Loading';
import AboutUs from './pages/AboutUs';
import RoadmapFE from './pages/guest/RoadmapFE';
import RoadmapBE from './pages/guest/RoadmapBE';

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
              {/* Student routes */}
              <Route path="/student/home" element={<PrivateRoute element={<StudentHome />} />} />
              {/* Guest routes */}
              
              <Route path="/roadmap-fe" element={<RoadmapFE />} />
              <Route path="/roadmap-be" element={<RoadmapBE />} />
              <Route path="/" element={<HomeGuest />} />

              <Route path="/about" element={<AboutUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Layout>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}