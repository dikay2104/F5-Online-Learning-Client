import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../services/courseService";
import { enrollCourse, createPayment, getMyEnrollments } from "../../services/enrollmentService";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/Loading";
import { Button, message, List, Tag, Card, Avatar, Typography, Row, Col, Divider, Progress, Modal, Tooltip, Rate } from "antd";
import { UserOutlined, PlayCircleOutlined, VideoCameraOutlined, StarFilled } from "@ant-design/icons";
import { getFeedbacksByCourse, createFeedback } from "../../services/feedbackService";
import { Form, Input } from "antd";

const { Title, Text } = Typography;

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0); // % progress
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    getCourseById(courseId, token)
      .then(res => {
        setCourse(res.data.data || res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    // Kiểm tra enrollment và progress
    if (user) {
      getMyEnrollments().then(res => {
        const enrolled = res.data.data.some(e => e.course && e.course._id === courseId && e.status === 'active');
        setIsEnrolled(enrolled);
        // Giả lập progress: đã học 2/5 bài
        if (enrolled && res.data.data.length > 0) {
          const thisCourse = res.data.data.find(e => e.course && e.course._id === courseId);
          // Nếu có API progress thực tế thì lấy ở đây
          if (course && course.lessons && course.lessons.length > 0) {
            setProgress(Math.round((2 / course.lessons.length) * 100));
          } else {
            setProgress(40); // giả lập
          }
        }
      });
    }
    setFeedbackLoading(true);
    getFeedbacksByCourse(courseId)
      .then(res => {
        setFeedbacks(res.data.feedbacks || []);
      })
      .catch(() => setFeedbacks([]))
      .finally(() => setFeedbackLoading(false));
  }, [courseId, user, course?.lessons?.length]);

  const handleJoin = async () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/student/courses/${courseId}`);
      navigate("/login");
      return;
    }
    if (course.price === 0) {
      try {
        await enrollCourse(courseId);
        message.success("Đã tham gia khóa học!");
        setIsEnrolled(true);
      } catch (err) {
        message.error("Tham gia thất bại!");
      }
    } else {
      try {
        const res = await createPayment(courseId);
        window.location.href = res.data.paymentUrl;
      } catch (err) {
        message.error("Không thể thanh toán!");
      }
    }
  };

  // Xử lý mở modal xem video bài học
  const handleLessonClick = (lesson) => {
    if (isEnrolled) {
      setSelectedLesson(lesson);
      setVideoModalOpen(true);
    } else {
      message.info("Bạn cần tham gia khóa học để xem bài học!");
    }
  };

  const handleSubmitFeedback = async (values) => {
    setSubmitting(true);
    try {
      await createFeedback({
        course: courseId,
        comment: values.comment,
        rating: values.rating
      });
      message.success("Gửi feedback thành công!");
      form.resetFields();
      // Reload feedbacks
      setFeedbackLoading(true);
      getFeedbacksByCourse(courseId)
        .then(res => setFeedbacks(res.data.feedbacks || []))
        .finally(() => setFeedbackLoading(false));
    } catch (err) {
      message.error(err.response?.data?.message || "Gửi feedback thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!course) return <p>Không tìm thấy khóa học</p>;

  return (
    <Row justify="center" style={{ marginTop: 40 }}>
      <Col xs={24} md={20} lg={16}>
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            marginBottom: 32,
            padding: 24,
          }}
          bodyStyle={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: 260, height: 160, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
          <div style={{ flex: 1, minWidth: 260 }}>
            <Title level={2} style={{ marginBottom: 8 }}>{course.title}</Title>
            <Text type="secondary">{course.description}</Text>
            <div style={{ margin: '16px 0' }}>
              <Tag color="blue">{course.level?.toUpperCase()}</Tag>
              <Tag color="purple">{course.category}</Tag>
            </div>
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar icon={<UserOutlined />} size={48} style={{ background: '#e6f7ff' }} />
              <div>
                <Text strong>{course.teacher?.fullName || 'Giáo viên'}</Text><br />
                <Text type="secondary" style={{ fontSize: 13 }}>{course.teacher?.email || ''}</Text>
              </div>
            </div>
            <div>
              <Text strong>Thời lượng:</Text> {Math.floor(course.duration / 60)} phút &nbsp;|&nbsp;
              <Text strong>Số bài học:</Text> {course.lessons?.length || 0} &nbsp;|&nbsp;
              <Text strong>Giá:</Text> {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}đ`}
            </div>
            <div style={{ margin: '16px 0' }}>
              <Tooltip title="Tiến độ học của bạn">
                <Progress percent={progress} size="small" style={{ width: 220 }} />
              </Tooltip>
            </div>
            <div style={{ marginTop: 20 }}>
              {!isEnrolled ? (
                <Button type="primary" size="large" shape="round" onClick={handleJoin}>
                  {course.price === 0 ? "Tham gia học" : "Thanh toán"}
                </Button>
              ) : (
                <Tag color="success" style={{ fontSize: 16, padding: '4px 16px' }}>Đã tham gia</Tag>
              )}
            </div>
          </div>
        </Card>

        {/* Nội dung khóa học */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: 24,
          }}
        >
          <Title level={4}>Nội dung khóa học</Title>
          <Divider />
          <List
            itemLayout="horizontal"
            dataSource={course.lessons || []}
            locale={{ emptyText: "Chưa có bài học nào" }}
            renderItem={lesson => (
              <List.Item
                style={{
                  borderRadius: 8,
                  marginBottom: 8,
                  background: '#fafbfc',
                  cursor: isEnrolled ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  alignItems: 'center',
                  boxShadow: selectedLesson && selectedLesson._id === lesson._id ? '0 0 0 2px #1890ff' : undefined,
                  border: selectedLesson && selectedLesson._id === lesson._id ? '1px solid #1890ff' : '1px solid #f0f0f0',
                }}
                onClick={() => handleLessonClick(lesson)}
                onMouseEnter={() => isEnrolled && setSelectedLesson(lesson)}
                onMouseLeave={() => isEnrolled && setSelectedLesson(null)}
              >
                <List.Item.Meta
                  avatar={<PlayCircleOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={<Text strong>{lesson.title}</Text>}
                  description={<Text type="secondary">{lesson.videoDuration ? Math.floor(lesson.videoDuration / 60) : 0} phút</Text>}
                />
              </List.Item>
            )}
          />
        </Card>

        {/* Đánh giá khóa học */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: 24,
            marginBottom: 32,
          }}
        >
          <Title level={4} style={{ marginBottom: 0 }}>Đánh giá khóa học</Title>
          {feedbackLoading ? <Loading /> : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Rate allowHalf disabled value={
                  feedbacks.length > 0
                    ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length
                    : 0
                } />
                <Text strong style={{ fontSize: 18 }}>
                  {feedbacks.length > 0
                    ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
                    : 0}
                </Text>
                <Text type="secondary">({feedbacks.length} đánh giá)</Text>
              </div>
              <List
                dataSource={feedbacks}
                locale={{ emptyText: "Chưa có đánh giá nào" }}
                renderItem={fb => (
                  <List.Item style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={<span>
                        <b>{fb.student?.fullName || fb.student?.email || "Học viên"}</b>
                        <Rate disabled value={fb.rating} style={{ fontSize: 14, marginLeft: 8 }} />
                      </span>}
                      description={fb.comment}
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Card>

        {/* Modal xem video bài học */}
        <Modal
          open={videoModalOpen}
          onCancel={() => setVideoModalOpen(false)}
          footer={null}
          width={800}
          title={selectedLesson ? selectedLesson.title : ""}
        >
          {selectedLesson && (
            <div style={{ textAlign: 'center' }}>
              <iframe
                width="720"
                height="405"
                src={selectedLesson.videoUrl?.replace("watch?v=", "embed/")}
                title={selectedLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: 12 }}
              ></iframe>
              <div style={{ marginTop: 16 }}>
                <Text>{selectedLesson.description}</Text>
              </div>
            </div>
          )}
        </Modal>
      </Col>
    </Row>
  );
}