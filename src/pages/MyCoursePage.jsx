import TeacherCoursePage from './teacher/TeacherCoursePage';
// import StudentCoursePage from './student/StudentCoursePage';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';

export default function MyCoursesPage() {
  const { user } = useAuth();

  if (user?.role === 'teacher') return <TeacherCoursePage />;
//   if (user?.role === 'student') return <StudentCoursePage />;
  return <Navigate to="/" />;
}
