import { useEffect, useState } from 'react';
import { Typography, Divider, Row, Col, Spin, Empty } from 'antd';
import { getAllCourses } from '../../services/courseService';
import CourseCard from '../../components/CourseCard';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function RoadmapFE() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  // Lọc các khóa học theo từng giai đoạn
  const htmlCourses = courses.filter(c => c.title?.toLowerCase().includes('html'));
  const basicCourses = courses.filter(c => c.title?.toLowerCase().includes('cơ bản') || c.title?.toLowerCase().includes('basic') || c.title?.toLowerCase().includes('fullstack'));
  const advancedCourses = courses.filter(c => c.title?.toLowerCase().includes('react') || c.level === 'advanced');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={1} style={{ color: '#1677ff', marginBottom: 12 }}>Lộ trình học Frontend</Title>
      <Paragraph style={{ fontSize: 18, marginBottom: 24 }}>
        Lộ trình học Frontend giúp bạn xây dựng nền tảng vững chắc về HTML, CSS, JavaScript và các framework hiện đại như ReactJS. Bạn sẽ được hướng dẫn từ cơ bản đến nâng cao, thực hành qua các dự án thực tế để trở thành lập trình viên giao diện chuyên nghiệp.
      </Paragraph>

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600 }}>
        <span style={{ fontSize: 20 }}>1. Bắt đầu với HTML &amp; CSS</span>
      </Divider>
      <Paragraph>Học HTML &amp; CSS là bước đầu tiên để xây dựng giao diện web. Bạn sẽ hiểu cấu trúc trang web, cách trình bày nội dung và tạo giao diện đẹp mắt.</Paragraph>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        htmlCourses.length === 0 ? <Empty description="Chưa có khóa học HTML & CSS" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {htmlCourses.map(course => (
            <Col xs={24} sm={12} md={8} key={course._id}>
              <CourseCard course={course} role="guest" onClick={() => navigate(`/courses/${course._id}`)} />
            </Col>
          ))}
        </Row>
      }

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, marginTop: 40 }}>
        <span style={{ fontSize: 20 }}>2. Basic Frontend Fullstack</span>
      </Divider>
      <Paragraph>Tiếp theo, bạn sẽ học JavaScript, các khái niệm lập trình web hiện đại và cách kết hợp với backend để xây dựng ứng dụng hoàn chỉnh.</Paragraph>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        basicCourses.length === 0 ? <Empty description="Chưa có khóa học cơ bản/fullstack" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {basicCourses.map(course => (
            <Col xs={24} sm={12} md={8} key={course._id}>
              <CourseCard course={course} role="guest" onClick={() => navigate(`/courses/${course._id}`)} />
            </Col>
          ))}
        </Row>
      }

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, marginTop: 40 }}>
        <span style={{ fontSize: 20 }}>3. Các khóa nâng cao (ReactJS, ...)</span>
      </Divider>
      <Paragraph>Sau khi nắm vững nền tảng, bạn sẽ học các framework hiện đại như ReactJS để xây dựng ứng dụng web động, tối ưu trải nghiệm người dùng.</Paragraph>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        advancedCourses.length === 0 ? <Empty description="Chưa có khóa học nâng cao" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {advancedCourses.map(course => (
            <Col xs={24} sm={12} md={8} key={course._id}>
              <CourseCard course={course} role="guest" onClick={() => navigate(`/courses/${course._id}`)} />
            </Col>
          ))}
        </Row>
      }
    </div>
  );
} 