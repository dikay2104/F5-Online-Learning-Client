import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../services/courseService";
import { enrollCourse, createPayment, getMyEnrollments } from "../../services/enrollmentService";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/Loading";
import { Button, message, List, Tag, Card, Avatar, Typography, Row, Col, Divider, Progress, Modal, Tooltip, Rate, Collapse, Space } from "antd";
import { UserOutlined, PlayCircleOutlined, VideoCameraOutlined, StarFilled, ClockCircleOutlined } from "@ant-design/icons";
import { getFeedbacksByCourse, createFeedback } from "../../services/feedbackService";
import { getCollectionsByCourse } from "../../services/collectionService";
import { getLessonsByCourse } from "../../services/lessonService";
import { Form, Input } from "antd";
import { CreditCardOutlined, QrcodeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
  const [collections, setCollections] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [payModalOpen, setPayModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate(`/courses/${courseId}`);
    }
  }, [user, courseId, navigate]);

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

    // Lấy collections và lessons
    getCollectionsByCourse(courseId)
      .then(res => {
        setCollections(res.data.data || []);
      })
      .catch(() => setCollections([]));

    getLessonsByCourse(courseId)
      .then(res => {
        setLessons(res.data.data || []);
      })
      .catch(() => setLessons([]));

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
      setPayModalOpen(true);
    }
  };

  const handleVNPay = async () => {
    try {
      const res = await createPayment(courseId);
      window.location.href = res.data.paymentUrl;
    } catch (err) {
      message.error("Không thể thanh toán!");
    }
  };

  const handleMoMo = () => {
    message.info("Chức năng này chỉ để tham khảo/báo cáo, không thực hiện thanh toán MoMo thực tế.");
    setPayModalOpen(false);
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

  // Nhóm lessons theo collection
  const ungroupedLessons = lessons.filter(l => !l.collection);
  const groupedLessons = collections.map(collection => ({
    ...collection,
    lessons: lessons.filter(l => l.collection === collection._id).sort((a, b) => a.order - b.order),
  }));

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
              {/* Chỉ hiện thanh tiến độ nếu đã tham gia khóa học */}
              {isEnrolled && (
                <Tooltip title="Tiến độ học của bạn">
                  <Progress percent={progress} size="small" style={{ width: 220 }} />
                </Tooltip>
              )}
            </div>
            <div style={{ marginTop: 20 }}>
              
              {/* Ẩn nút tham gia/thanh toán nếu là admin */}
              {user?.role !== 'admin' && (!isEnrolled ? (
                <>
                  <Button type="primary" size="large" shape="round" onClick={handleJoin}>
                    {course.price === 0 ? "Tham gia học" : "Thanh toán"}
                  </Button>
                  <Modal
                    open={payModalOpen}
                    onCancel={() => setPayModalOpen(false)}
                    footer={null}
                    title={<div style={{ textAlign: "center", fontWeight: 600, fontSize: 20 }}>Chọn phương thức thanh toán</div>}
                    centered
                    bodyStyle={{
                      padding: 32,
                      borderRadius: 16,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                      background: "#f9f9f9"
                    }}
                  >
                    <Button
                      type="primary"
                      block
                      size="large"
                      style={{
                        marginBottom: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        fontWeight: 500,
                        fontSize: 16,
                        borderRadius: 8,
                        boxShadow: "0 2px 8px rgba(24,144,255,0.08)"
                      }}
                      icon={<QrcodeOutlined style={{ fontSize: 22 }} />}
                      onClick={handleVNPay}
                    >
                      Thanh toán qua VNPay
                    </Button>
                    <Button
                      block
                      size="large"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 12,
                        fontWeight: 500,
                        fontSize: 16,
                        borderRadius: 8,
                        background: "#fff0f6",
                        color: "#d81b60",
                        border: "1px solid #ffd6e7"
                      }}
                      icon={
                        <img
                          src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                          alt="MoMo"
                          style={{ width: 22, height: 22, borderRadius: 4 }}
                        />
                      }
                      onClick={handleMoMo}
                    >
                      Thanh toán qua MoMo
                    </Button>
                    <div style={{ marginTop: 18, color: "#888", textAlign: "center", fontSize: 14 }}>
                      <div>
                        <QrcodeOutlined style={{ color: "#1890ff" }} /> VNPay: Thanh toán an toàn, bảo mật.
                      </div>
                      <div>
                        <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{ width: 18, verticalAlign: "middle" }} /> MoMo: Chỉ để tham khảo/báo cáo.
                      </div>
                    </div>
                  </Modal>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Tag color="success" style={{ fontSize: 16, padding: '4px 16px', marginBottom: 0 }}>Đã tham gia</Tag>
                  <Button type="primary" size="large" shape="round" onClick={() => navigate(`/my-courses`)}>
                    Vào học
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Nội dung khóa học */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            padding: 24,
            marginBottom: 32,
          }}
        >
          <Title level={4}>Nội dung khóa học</Title>
          <Divider />
          
          <Collapse accordion>
            {/* Collections */}
            {groupedLessons.map((collection) => (
              <Panel
                key={collection._id}
                header={
                  <Space size="small">
                    <Text strong>{collection.title}</Text>
                    {collection.duration != null && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {collection.duration} phút
                      </Text>
                    )}
                  </Space>
                }
              >
                <List
                  dataSource={collection.lessons}
                  bordered
                  locale={{ emptyText: "Chưa có bài học nào trong collection này" }}
                  renderItem={(lesson) => (
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
                        description={
                          <Space size="small" wrap>
                            <Text type="secondary">{lesson.videoDuration ? Math.floor(lesson.videoDuration / 60) : 0} phút</Text>
                            {lesson.isPreviewable && (
                              <Text type="success" style={{ fontSize: 12 }}>[Học thử]</Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            ))}

            {/* Ungrouped Lessons */}
            {ungroupedLessons.length > 0 && (
              <Panel key="ungrouped" header="Bài học chưa có Collection">
                <List
                  dataSource={ungroupedLessons}
                  bordered
                  locale={{ emptyText: "Chưa có bài học nào" }}
                  renderItem={(lesson) => (
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
                        description={
                          <Space size="small" wrap>
                            <Text type="secondary">{lesson.videoDuration ? Math.floor(lesson.videoDuration / 60) : 0} phút</Text>
                            {lesson.isPreviewable && (
                              <Text type="success" style={{ fontSize: 12 }}>[Học thử]</Text>
                            )}
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Panel>
            )}
          </Collapse>
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
          {selectedLesson && user?.role !== 'admin' && (
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