import TeacherCoursePage from './teacher/TeacherCoursePage';
import { useAuth } from '../context/authContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getMyEnrollments } from '../services/enrollmentService';
import Loading from '../components/Loading';
import { Card, Button, Progress, List, Typography, Avatar, Input } from 'antd';
import { getLessonsByCourse } from '../services/lessonService';
import { getProgressByCourse } from '../services/progressService';
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
  const [lessonCounts, setLessonCounts] = useState({}); // { courseId: số bài học thực tế }
  const [searchValue, setSearchValue] = useState("");
  // Thêm state lưu progress cho từng course

  useEffect(() => {
    if (user?.role === 'student') {
      getMyEnrollments()
        .then(res => {
          setEnrollments(res.data.data || []);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Fetch bài học đầu tiên cho từng khóa học song song
  useEffect(() => {
    async function fetchFirstLessons() {
      const promises = enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        if (!course || !course._id) return [null, undefined];
        try {
          const res = await getLessonsByCourse(course._id);
          if (res.data.data && res.data.data.length > 0) {
            return [course._id, res.data.data[0]._id];
          }
        } catch {}
        return [course._id, undefined];
      });
      const results = await Promise.all(promises);
      const map = {};
      results.forEach(([courseId, lessonId]) => {
        if (courseId && lessonId) map[courseId] = lessonId;
      });
      setFirstLessonMap(map);
    }
    if (enrollments.length > 0) fetchFirstLessons();
  }, [enrollments]);

  // Fetch số lượng bài học thực tế cho từng khóa học song song
  useEffect(() => {
    async function fetchLessonCounts() {
      const promises = enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        if (!course || !course._id) return [null, 0];
        try {
          const res = await getLessonsByCourse(course._id);
          return [course._id, res.data.data.length];
        } catch {
          return [course._id, 0];
        }
      });
      const results = await Promise.all(promises);
      const map = {};
      results.forEach(([courseId, count]) => {
        if (courseId) map[courseId] = count;
      });
      setLessonCounts(map);
    }
    if (enrollments.length > 0) fetchLessonCounts();
  }, [enrollments]);

  // Khi load danh sách khóa học, chỉ lấy progress cho từng course
  useEffect(() => {
    enrollments.forEach(enrollment => {
      const course = enrollment.course;
      if (!course || !course._id) return;
      getProgressByCourse(course._id)
        .then(res => {
          const progressesArr = res.data.data || [];
          // Số bài học đã hoàn thành (giả sử watchedSeconds >= 80% videoDuration)
          const completed = progressesArr.filter(p => p.videoDuration && p.watchedSeconds / p.videoDuration >= 0.8).length;
          // Tổng số bài học thực tế
          const total = lessonCounts[course._id] || 1;
          const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
          setProgresses(prev => ({ ...prev, [course._id]: percent }));
        })
        .catch(() => setProgresses(prev => ({ ...prev, [course._id]: 0 })));
    });
  }, [enrollments, lessonCounts]);

  if (user?.role === 'teacher') return <TeacherCoursePage />;
  if (user?.role !== 'student') return <Navigate to="/" />;
  if (loading) return <Loading />;

  // Nếu không có khóa học nào
  if (!enrollments || enrollments.length === 0 || enrollments.every(e => !e.course || !e.course._id)) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: '#888', fontWeight: 500 }}>
        Bạn chưa tham gia khóa học nào.<br/>
        Hãy đăng ký hoặc tham gia một khóa học để bắt đầu học tập!
      </div>
    );
  }

  // Lọc theo search
  const filteredEnrollments = enrollments.filter(enrollment => {
    const course = enrollment.course;
    if (!course) return false;
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return true;
    return (
      course.title?.toLowerCase().includes(keyword) ||
      course.description?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div style={{ padding: 24 }}>
      {/* Search bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <div style={{ maxWidth: 400, width: '100%' }}>
          <Input.Search
            placeholder="Tìm kiếm khoá học..."
            allowClear
            enterButton
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            onSearch={v => setSearchValue(v)}
          />
        </div>
      </div>
      <h2>Khóa học của tôi</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        {filteredEnrollments
          .filter(enrollment => enrollment.course && enrollment.course._id)
          .map(enrollment => {
            const course = enrollment.course;
            const firstLessonId = firstLessonMap[course._id];
            const percent = progresses[course._id] || 0;
            return (
              <div key={course._id}>
                <Card
                  hoverable
                  style={{ width: 320, cursor: 'pointer' }}
                  onClick={() => {
                    if (firstLessonMap[course._id]) {
                      localStorage.setItem('currentCourseId', course._id); // Lưu courseId cho LessonLearn
                      navigate(`/student/lessons/${firstLessonMap[course._id]}`);
                    }
                  }}
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
          })}
      </div>
    </div>
  );
}
