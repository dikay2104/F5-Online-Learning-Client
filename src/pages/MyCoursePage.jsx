import TeacherCoursePage from './teacher/TeacherCoursePage';
import { useAuth } from '../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyEnrollments } from '../services/enrollmentService';
import Loading from '../components/Loading';
import { Card, Button, Progress, List, Typography, Avatar } from 'antd';
import { getLessonsByCourse } from '../services/lessonService';
import { getProgressByCourse } from '../services/lessonService';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function MyCoursesPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [firstLessonMap, setFirstLessonMap] = useState({});
  // Thêm state lưu progress cho từng course
  const [progresses, setProgresses] = useState({}); // { courseId: % }


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

  // Khi load danh sách khóa học, chỉ lấy progress cho từng course
  useEffect(() => {
    enrollments.forEach(enrollment => {
      const course = enrollment.course;
      getProgressByCourse(course._id)
        .then(res => {
          const progressesArr = res.data.data || [];
          // Số bài học đã hoàn thành (giả sử watchedSeconds >= 80% videoDuration)
          const completed = progressesArr.filter(p => p.videoDuration && p.watchedSeconds / p.videoDuration >= 0.8).length;
          // Tổng số bài học
          const total = course.lessons?.length || course.duration || 1;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          setProgresses(prev => ({ ...prev, [course._id]: percent }));
        })
        .catch(() => setProgresses(prev => ({ ...prev, [course._id]: 0 })));
    });
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
          enrollments
            .filter(enrollment => enrollment.course && enrollment.course._id)
            .map(enrollment => {
              const course = enrollment.course;
              const firstLessonId = firstLessonMap[course._id];
              const percent = progresses[course._id] || 0;
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
                    <div>Thời lượng: {typeof course.duration === 'number' && !isNaN(course.duration) && course.duration > 0
                      ? (course.duration >= 3600
                        ? `${Math.floor(course.duration / 3600)} giờ ${Math.floor((course.duration % 3600) / 60)} phút`
                        : `${Math.floor(course.duration / 60)} phút`)
                      : '0 phút'}
                    </div>
                    <div>Số học viên: {course.studentsCount}</div>
                    <Progress percent={percent} size="small" style={{ margin: '8px 0' }} />
                  </Card>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
