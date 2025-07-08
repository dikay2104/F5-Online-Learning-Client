import TeacherCoursePage from './teacher/TeacherCoursePage';
import { useAuth } from '../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyEnrollments } from '../services/enrollmentService';
import CourseCardStudent from '../components/CourseCardStudent';
import Loading from '../components/Loading';
import { Card, Button } from 'antd';
import { getLessonsByCourse } from '../services/lessonService';

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [firstLessonMap, setFirstLessonMap] = useState({});

  useEffect(() => {
    if (user?.role === 'student') {
      getMyEnrollments()
        .then(res => {
          setEnrollments(res.data.data || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    async function fetchFirstLessons() {
      const map = {};
      for (const enrollment of enrollments) {
        const course = enrollment.course;
        try {
          const res = await getLessonsByCourse(course._id);
          if (res.data.data && res.data.data.length > 0) {
            map[course._id] = res.data.data[0]._id;
          }
        } catch {}
      }
      setFirstLessonMap(map);
    }
    if (enrollments.length > 0) fetchFirstLessons();
  }, [enrollments]);

  if (user?.role === 'teacher') return <TeacherCoursePage />;
  if (user?.role !== 'student') return <Navigate to="/" />;
  if (loading) return <Loading />;

  return (
    <div style={{ padding: 24 }}>
      <h2>Khóa học của tôi</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {enrollments.length === 0 ? (
          <p>Bạn chưa tham gia khóa học nào.</p>
        ) : (
          enrollments.map(enrollment => {
            const course = enrollment.course;
            const firstLessonId = firstLessonMap[course._id];
            return (
              <div key={course._id}>
                <Card
                  hoverable
                  style={{ width: 320 }}
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => {
                        if (firstLessonId) {
                          localStorage.setItem('currentCourseId', course._id);
                          navigate(`/student/lessons/${firstLessonId}`);
                        }
                      }}
                      disabled={!firstLessonId}
                    >
                      Bắt đầu học
                    </Button>
                  ]}
                  cover={
                    <img
                      alt="course-thumbnail"
                      src={course.thumbnail}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  }
                >
                  <h3>{course.title}</h3>
                  <div>Thời lượng: {course.duration >= 3600
                    ? `${Math.floor(course.duration / 3600)} giờ ${Math.floor((course.duration % 3600) / 60)} phút`
                    : `${Math.floor(course.duration / 60)} phút`}
                  </div>
                  <div>Số học viên: {course.studentsCount}</div>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
