import { useEffect, useState } from 'react';
import { Typography, Divider, Spin, Empty } from 'antd';
import { getAllCourses } from '../../services/courseService';
import CourseCard from '../../components/CourseCard';

const { Title } = Typography;

export default function GuestHome() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const freeCourses = courses.filter(c => c.price === 0);
  const vipCourses = courses.filter(c => c.price > 0);

  // Custom responsive grid
  const renderCourseGrid = (courseList) => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '32px',
      justifyContent: 'flex-start',
    }}>
      {courseList.map(course => (
        <div
          key={course._id}
          style={{
            flex: '1 1 260px',
            minWidth: 260,
            maxWidth: 340,
            boxSizing: 'border-box',
            display: 'flex',
          }}
        >
          <CourseCard course={course} role="guest" />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={2} style={{ color: '#1677ff', textAlign: 'center', marginBottom: 32 }}>
        Khám phá các khóa học dành cho khách
      </Title>

      {/* Khóa học miễn phí */}
      <div style={{ marginBottom: 48 }}>
        <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, fontSize: 18 }}>
          Khóa học miễn phí
        </Divider>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : freeCourses.length === 0 ? (
          <Empty description="Chưa có khóa học miễn phí" style={{ margin: '32px 0' }} />
        ) : (
          renderCourseGrid(freeCourses)
        )}
      </div>

      {/* Khóa học VIP/Pro */}
      <div style={{ marginBottom: 48 }}>
        <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, fontSize: 18 }}>
          Khóa học VIP/Pro
        </Divider>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : vipCourses.length === 0 ? (
          <Empty description="Chưa có khóa học VIP/Pro" style={{ margin: '32px 0' }} />
        ) : (
          renderCourseGrid(vipCourses)
        )}
      </div>
    </div>
  );
} 