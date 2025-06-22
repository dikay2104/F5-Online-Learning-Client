import { useEffect, useState } from 'react';
import { Row, Col, Spin, message, Pagination, Empty, Typography, Modal, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/CourseCard';
import { getTeacherCourses, deleteCourse, submitCourse } from '../../services/courseService';

const { Title } = Typography;

export default function TeacherCoursePage() {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 8;
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchCourses = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await getTeacherCourses(token, { page: pageNumber, limit });
      setCourses(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      message.error('Lỗi khi tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmDelete = (course) => {
    Modal.confirm({
      title: `Xác nhận xoá`,
      content: `Bạn có chắc muốn xoá khoá học "${course.title}"?`,
      okText: 'Xoá',
      okType: 'danger',
      cancelText: 'Huỷ',
      onOk: () => handleDelete(course._id),
    });
  };

  const handleDelete = async (id) => {
    try {
      await deleteCourse(token, id);
      message.success('Đã xoá khóa học');
      fetchCourses(page);
    } catch (err) {
      message.error('Xoá thất bại');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await submitCourse(token, id);
      message.success('Đã gửi khoá học để xét duyệt');
      fetchCourses(page);
    } catch (err) {
      message.error('Gửi duyệt thất bại');
    }
  };

  useEffect(() => {
    fetchCourses(page);
  }, [page]);

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Khoá học của tôi</Title>
        <Button type="primary" onClick={() => navigate('/courses/create')}>
          Tạo khoá học
        </Button>
      </div>

      {loading ? (
        <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />
      ) : courses.length === 0 ? (
        <Empty description="Chưa có khóa học nào" style={{ marginTop: 64 }} />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {courses.map((course) => (
              <Col xs={24} sm={12} md={8} lg={6} key={course._id}>
                <CourseCard
                  course={course}
                  role="teacher"
                  onClick={() => navigate(`/courses/${course._id}`)}
                  onEdit={() => navigate(`/courses/${course._id}/edit`)}
                  onDelete={() => showConfirmDelete(course)}
                  onSubmit={() => handleSubmit(course._id)}
                />
              </Col>
            ))}
          </Row>
          <Pagination
            current={page}
            total={totalPages * limit}
            pageSize={limit}
            onChange={(p) => setPage(p)}
            style={{ textAlign: 'center', marginTop: 32 }}
          />
        </>
      )}
    </div>
  );
}
