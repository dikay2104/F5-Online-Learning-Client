import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Collapse,
  Typography,
  Spin,
  Card,
  Space,
  Button,
  message,
  Descriptions,
  Tag,
  Divider,
  Badge,
  Image
} from 'antd';
import { getLessonsByCourse } from '../../services/lessonService';
import { getCourseById } from '../../services/courseService';
import thumbnailFallback from '../../assets/thumbnail.jpg'; // Đảm bảo đường dẫn đúng

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await getCourseById(courseId, token);
        setCourse(courseRes.data.data);

        const lessonRes = await getLessonsByCourse(courseId);
        setLessons(lessonRes.data.data);
      } catch (err) {
        message.error('Không thể tải khoá học');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, token]);

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;
  }

  if (!course) {
    return <div style={{ padding: 24 }}><Card><Title level={3}>Không tìm thấy khóa học</Title></Card></div>;
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* Hiển thị hình ảnh thumbnail */}
          <Image
            width={320}
            src={course.thumbnail || thumbnailFallback}
            fallback={thumbnailFallback}
            alt="Course thumbnail"
            style={{ borderRadius: 8 }}
          />

          <Title level={2}>{course.title}</Title>
          <Text type="secondary">{course.description}</Text>

          <Descriptions
            bordered
            column={1}
            size="middle"
            style={{ marginTop: 24 }}
            labelStyle={{ fontWeight: 'bold', width: 180 }}
          >
            <Descriptions.Item label="Giá">{course.price > 0 ? `${course.price}₫` : 'Miễn phí'}</Descriptions.Item>
            <Descriptions.Item label="Trình độ">
              <Tag color="blue">{course.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên mục">
              <Tag color="purple">{course.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {/* {(course.duration / 60).toFixed(1)} phút */}
              {course.duration >= 3600
              ? `${Math.floor(course.duration / 3600)} giờ ${Math.floor((course.duration % 3600) / 60)} phút`
              : `${Math.floor(course.duration / 60)} phút`}
            </Descriptions.Item>
            <Descriptions.Item label="Số học viên">{course.studentsCount}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={course.status === 'published' ? 'success' : 'warning'}
                text={course.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Giảng viên">{course.teacher?.fullName}</Descriptions.Item>
          </Descriptions>

          <Button type="primary" onClick={() => navigate(`/courses/${courseId}/edit`)}>Chỉnh sửa khoá học</Button>
        </Space>
      </Card>

      <Divider />

      <Card title="Danh sách bài học" style={{ marginTop: 24 }}>
        <Button
          type="dashed"
          style={{ marginBottom: 12 }}
          onClick={() => navigate(`/courses/${courseId}/lessons/create`)}
        >
          Thêm bài học
        </Button>

        <Collapse accordion>
          {lessons.map((lesson) => (
            <Panel header={lesson.title} key={lesson._id}>
              <p><b>Mô tả:</b> {lesson.description}</p>
              <p><b>Thời lượng:</b> {(lesson.videoDuration / 60).toFixed(1)} phút</p>
              <p><b>Xem trước:</b> {lesson.isPreviewable ? 'Có' : 'Không'}</p>
              <p>
                <b>Tài nguyên:</b>{' '}
                {lesson.resources.map((link, index) => (
                  <div key={index}>
                    <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                  </div>
                ))}
              </p>
              <Button type="link" onClick={() => navigate(`/lessons/${lesson._id}/edit`)}>Chỉnh sửa bài học</Button>
            </Panel>
          ))}
        </Collapse>
      </Card>
    </div>
  );
}
