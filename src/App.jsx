// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/homePage/Login';
import Register from './pages/Register';
import Home from './pages/homePage/Home';
import MyCoursePage from './pages/MyCoursePage';
import CourseDetailPage from './pages/teacher/CourseDetail';
import CourseFormPage from './pages/teacher/courseFormPage/CourseFormPage';
import { AuthProvider, useAuth } from './context/authContext';
import Loading from './components/Loading';
import AboutUs from './pages/homePage/AboutUs';
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
              {/* Guest routes */}
              <Route path="/about" element={<AboutUs />} />
              <Route path="/roadmap-fe" element={<RoadmapFE />} />
              <Route path="/roadmap-be" element={<RoadmapBE />} />
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </Layout>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}