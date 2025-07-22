// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/homePage/Login';
import Register from './pages/homePage/Register';
import MyCoursePage from './pages/MyCoursePage';
import CourseDetailPage from './pages/teacher/CourseDetail';
import CourseFormPage from './pages/teacher/courseFormPage/CourseFormPage';
import { AuthProvider, useAuth } from './context/authContext';
import Loading from './components/Loading';
import AboutUs from './pages/homePage/AboutUs';
import RoadmapFE from './pages/guest/RoadmapFE';
import RoadmapBE from './pages/guest/RoadmapBE';
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageCourses from './pages/admin/ManageCourses';
import StudentHome from './pages/student/Home';
import StudentCourseDetail from './pages/student/CourseDetail';
import PaymentCallback from './pages/PaymentCallback';
import LessonLearn from './pages/student/LessonLearn';
import Profile from './pages/Profile';
import GuestHome from './pages/guest/Home';
import ProgressPage from './pages/ProgressPage';
import UploadForm from './pages/uploadForm';
import StatisticPage from './pages/teacher/StatisticPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ChatBox from './components/ChatBox';
import React from 'react';
import CertificatePage from './pages/CertificatePage';


function PrivateRoute({ element }) {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;
  return element;
}

export default function App() {
  const [showChat, setShowChat] = React.useState(false);

  return (
    <GoogleOAuthProvider clientId="1081206935169-5b954akmr843ijk42rn7libq54jflbir.apps.googleusercontent.com">
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
                <Route path="/my-courses/statistic" element={<PrivateRoute element={<StatisticPage />} />} />
                
                {/* <Route path="/" element={<Home />} /> */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/uploadVideo" element={<UploadForm />} />

                {/* route cho admin */}
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/feedbacks" element={<ManageFeedback />} />
                <Route path="/admin/courses" element={<ManageCourses />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />

                {/*route cho student*/}
                <Route path="/student/home" element={<StudentHome />} />
                <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
                <Route path="/payment/callback" element={<PaymentCallback />} />
                <Route path="/student/lessons/:lessonId" element={<LessonLearn />} />
                <Route path="/certificate/:certificateId" element={<CertificatePage />} />
             

                {/* Route cho user profile */}
                <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
                
                {/* Route cho progress */}
                <Route path="/progress" element={<PrivateRoute element={<ProgressPage />} />} />

                {/* Route cho guest */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/roadmap-fe" element={<RoadmapFE />} />
                <Route path="/roadmap-be" element={<RoadmapBE />} />
                <Route path="/guest/home" element={<GuestHome />} />
              </Routes>
            </Layout>
          </Layout>
        </BrowserRouter>
      </AuthProvider>

      {/* ChatBox nổi góc phải dưới */}
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
        {showChat ? (
          <ChatBox onClose={() => setShowChat(false)} />
        ) : (
          <button
            onClick={() => setShowChat(true)}
            style={{ borderRadius: '50%', width: 56, height: 56, background: '#0d6efd', color: '#fff', border: 'none', fontSize: 28, boxShadow: '0 2px 8px #aaa', cursor: 'pointer' }}
            title="Chat với AI"
          >
            💬
          </button>
        )}
      </div>
    </GoogleOAuthProvider>
  );
}