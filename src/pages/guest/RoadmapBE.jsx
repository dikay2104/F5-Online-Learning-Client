import { useEffect, useState } from 'react';
import { Typography, Divider, Row, Col, Spin, Empty } from 'antd';
import { getAllCourses } from '../../services/courseService';
import CourseCard from '../../components/CourseCard';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

export default function RoadmapBE() {
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
  const nodeCourses = courses.filter(c => c.title?.toLowerCase().includes('node'));
  const fullstackCourses = courses.filter(c => c.title?.toLowerCase().includes('fullstack') || c.title?.toLowerCase().includes('backend cơ bản') || c.title?.toLowerCase().includes('express'));
  const advancedCourses = courses.filter(c => c.title?.toLowerCase().includes('bảo mật') || c.title?.toLowerCase().includes('tối ưu') || c.level === 'advanced');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <Title level={1} style={{ color: '#1677ff', marginBottom: 12 }}>Lộ trình học Backend</Title>
      <Paragraph style={{ fontSize: 18, marginBottom: 24 }}>
        Lộ trình học Backend giúp bạn nắm vững kiến thức về NodeJS, ExpressJS, cơ sở dữ liệu, bảo mật và xây dựng API thực tế. Bạn sẽ được hướng dẫn từ căn bản đến chuyên sâu, thực hành qua các dự án backend để trở thành lập trình viên backend chuyên nghiệp.
      </Paragraph>

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600 }}>
        <span style={{ fontSize: 20 }}>1. Bắt đầu với NodeJS cơ bản</span>
      </Divider>
      <Paragraph>NodeJS là nền tảng quan trọng để phát triển backend hiện đại. Bạn sẽ học cách xây dựng server, xử lý request, response và làm việc với file hệ thống.</Paragraph>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        nodeCourses.length === 0 ? <Empty description="Chưa có khóa học NodeJS cơ bản" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {nodeCourses.map(course => (
            <Col xs={24} sm={12} md={8} key={course._id}>
              <CourseCard course={course} role="guest" onClick={() => navigate(`/courses/${course._id}`)} />
            </Col>
          ))}
        </Row>
      }

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, marginTop: 40 }}>
        <span style={{ fontSize: 20 }}>2. Backend Fullstack &amp; ExpressJS</span>
      </Divider>
      <Paragraph>Tiếp theo, bạn sẽ học cách xây dựng RESTful API với ExpressJS, kết nối cơ sở dữ liệu và triển khai ứng dụng backend hoàn chỉnh.</Paragraph>
      {loading ? <Spin size="large" style={{ display: 'block', margin: '40px auto' }} /> :
        fullstackCourses.length === 0 ? <Empty description="Chưa có khóa học backend fullstack/ExpressJS" style={{ margin: '32px 0' }} /> :
        <Row gutter={[24, 24]}>
          {fullstackCourses.map(course => (
            <Col xs={24} sm={12} md={8} key={course._id}>
              <CourseCard course={course} role="guest" onClick={() => navigate(`/courses/${course._id}`)} />
            </Col>
          ))}
        </Row>
      }

      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, marginTop: 40 }}>
        <span style={{ fontSize: 20 }}>3. Các khóa nâng cao (Bảo mật, tối ưu, ...)</span>
      </Divider>
      <Paragraph>Sau khi nắm vững nền tảng, bạn sẽ học các chủ đề nâng cao như bảo mật, tối ưu hiệu năng, triển khai và quản lý hệ thống backend lớn.</Paragraph>
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