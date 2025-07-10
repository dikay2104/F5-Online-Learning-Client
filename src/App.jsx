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
import ManageUsers from "./pages/admin/ManageUsers";
import ManageFeedback from './pages/admin/ManageFeedback';
import ManageCourses from './pages/admin/ManageCourses';
import StudentHome from './pages/student/Home';
import StudentCourseDetail from './pages/student/CourseDetail';
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

              {/* route cho admin */}
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/feedbacks" element={<ManageFeedback />} />
              <Route path="/admin/courses" element={<ManageCourses />} />

              {/*route cho student*/}
              <Route path="/" element={<StudentHome />} />
              <Route path="/student/courses/:courseId" element={<StudentCourseDetail />} />
              <Route path="/payment/callback" element={<PaymentCallback />} />
              <Route path="/student/lessons/:lessonId" element={<LessonLearn />} />

              {/* Route cho guest */}
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