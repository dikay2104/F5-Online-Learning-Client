import { useEffect, useState } from 'react';
import { Row, Col, Typography, Divider, Spin, Empty } from 'antd';
import { getAllCourses } from '../../services/courseService';
import CourseCard from '../../components/CourseCard';
import { useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const freeCourses = courses.filter(c => c.price === 0);
  const advancedCourses = courses.filter(c => c.price > 0);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={2} style={{ color: '#1677ff', textAlign: 'center', marginBottom: 32 }}>
        Khám phá các khóa học nổi bật
      </Title>

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600 }}>Miễn phí</Divider>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        freeCourses.length === 0 ? <Empty description="Chưa có khóa học miễn phí" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {freeCourses.map(course => (
            <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
              <CourseCard course={course} role="guest" />
            </Col>
          ))}
        </Row>
      }

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, marginTop: 48 }}>Nâng cao</Divider>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        advancedCourses.length === 0 ? <Empty description="Chưa có khóa học nâng cao" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {advancedCourses.map(course => (
            <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
              <CourseCard course={course} role="guest" />
            </Col>
          ))}
        </Row>
      }
    </div>
  );
}