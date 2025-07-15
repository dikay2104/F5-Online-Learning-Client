import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, Button, Card, Spin, Collapse, Space, Typography } from 'antd';
import { getLessonsByCourse } from '../../services/lessonService';
import { getCourseById } from '../../services/courseService';
import { getCollectionsByCourse } from '../../services/collectionService';
import { useAuth } from '../../context/authContext';
import { Rate, Form, Input, message, Typography as AntdTypography, Avatar, Spin as AntdSpin } from 'antd';
import { getFeedbacksByCourse, createFeedback } from '../../services/feedbackService';
import { UserOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import VideoPlayer from '../../components/VideoPlayer';

const { Title, Text } = AntdTypography;
const { Panel } = Collapse;

function getVideoEmbedUrl(url) {
  // YouTube
  const youtubeMatch = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  // Google Drive
  const driveMatch = url?.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\//);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }

  return null;
}


export default function LessonLearn() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [collections, setCollections] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const courseId = localStorage.getItem('currentCourseId');
      if (!courseId) {
        console.log('Không tìm thấy currentCourseId trong localStorage');
        setLoading(false);
        return;
      }
      const token = localStorage.getItem('token');
      try {
        const courseRes = await getCourseById(courseId, token);
        setCourse(courseRes.data.data);
        const lessonsRes = await getLessonsByCourse(courseId);
        setLessons(lessonsRes.data.data);
        const found = lessonsRes.data.data.find(l => l._id === lessonId);
        setLesson(found);

        // Lấy collections
        const collectionsRes = await getCollectionsByCourse(courseId);
        setCollections(collectionsRes.data.data || []);
      } catch (err) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          localStorage.removeItem('token');
          setUser(null);
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [lessonId, setUser, navigate]);

  useEffect(() => {
    // Lấy feedbacks cho khóa học
    const courseId = localStorage.getItem('currentCourseId');
    if (courseId) {
      setFeedbackLoading(true);
      getFeedbacksByCourse(courseId)
        .then(res => setFeedbacks(res.data.feedbacks || []))
        .catch(() => setFeedbacks([]))
        .finally(() => setFeedbackLoading(false));
    }
  }, [lessonId]);

  const handleSubmitFeedback = async (values) => {
    setSubmitting(true);
    const courseId = localStorage.getItem('currentCourseId');
    try {
      await createFeedback({
        course: courseId,
        comment: values.comment,
        rating: values.rating
      });
      // Ẩn form ngay lập tức bằng cách cập nhật feedbacks local (giả lập feedback mới)
      setFeedbacks(prev => [
        ...prev,
        {
          _id: 'local-' + Date.now(),
          student: { _id: userId, fullName: user?.fullName },
          comment: values.comment,
          rating: values.rating
        }
      ]);
      message.success('Gửi feedback thành công!');
      form.resetFields();
      setFeedbackLoading(true);
      // Reload feedbacks từ server để đồng bộ dữ liệu, nhưng KHÔNG hiển thị message lỗi nếu chỉ lỗi ở bước này
      try {
        const res = await getFeedbacksByCourse(courseId);
        setFeedbacks(res.data.feedbacks || []);
      } catch (err) {
        // Không hiển thị message.error ở đây!
      } finally {
        setFeedbackLoading(false);
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Gửi feedback thất bại!');
    }
    setSubmitting(false);
  };

  // Kiểm tra user đã gửi feedback chưa
  const userId = user?.id || user?._id;
  const hasFeedback = !!(userId && feedbacks.some(fb => String(fb.student?._id) === String(userId)));

  // Nhóm lessons theo collection
  const ungroupedLessons = lessons.filter(l => !l.collection);
  const groupedLessons = collections.map(collection => ({
    ...collection,
    lessons: lessons.filter(l => l.collection === collection._id).sort((a, b) => a.order - b.order),
  }));

  if (loading) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;
  if (!lesson) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'red', fontWeight: 600 }}>
        Không tìm thấy bài học với lessonId: {lessonId}.<br/>
        Vui lòng kiểm tra lại đường dẫn hoặc liên hệ quản trị viên.<br/>
        <span style={{ color: '#888', fontWeight: 400 }}>Kiểm tra console để biết thêm chi tiết.</span>
      </div>
    );
  }

  const currentIdx = lessons.findIndex(l => l._id === lessonId);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Video + nội dung */}
      <div style={{ flex: 2, padding: 32, background: '#fff' }}>
        <Card style={{ marginBottom: 24 }}>
          {lesson.videoUrl ? (
            <VideoPlayer lesson={lesson} courseId={course?._id} />
          ) : (
            <div>Không có video cho bài học này.</div>
          )}
          <h2 style={{ marginTop: 16 }}>{lesson.title}</h2>
          <div style={{ color: '#888', marginBottom: 8 }}>{lesson.description}</div>
          <div>
            <Button disabled={!prevLesson} onClick={() => prevLesson && navigate(`/student/lessons/${prevLesson._id}`)}>
              &lt; Bài trước
            </Button>
            <Button disabled={!nextLesson} style={{ marginLeft: 8 }} onClick={() => nextLesson && navigate(`/student/lessons/${nextLesson._id}`)}>
              Bài tiếp theo &gt;
            </Button>
          </div>
        </Card>
        {/* Feedback section dưới video */}
        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
          <Title level={5}>Đánh giá khóa học</Title>
          {!authLoading && user && !feedbackLoading && !hasFeedback && (
            <Form form={form} layout="vertical" onFinish={handleSubmitFeedback} style={{ marginBottom: 16 }}>
              <Form.Item
                name="rating"
                label="Đánh giá"
                validateTrigger="onSubmit"
                rules={[
                  {
                    validator: (_, value) =>
                      value && value > 0
                        ? Promise.resolve()
                        : Promise.reject("Vui lòng chọn số sao"),
                  },
                ]}
              >
                <Rate />
              </Form.Item>
              <Form.Item
                name="comment"
                label="Nhận xét"
                validateTrigger="onSubmit"
                rules={[
                  {
                    validator: (_, value) =>
                      value && value.trim()
                        ? Promise.resolve()
                        : Promise.reject("Vui lòng nhập nhận xét"),
                  },
                ]}
              >
                <Input.TextArea rows={3} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>Gửi đánh giá</Button>
            </Form>
          )}
          {feedbackLoading ? <AntdSpin /> : (
            <div>
              {feedbacks.length === 0 && <div>Chưa có đánh giá nào.</div>}
              {/* Đưa feedback của user lên đầu */}
              {(() => {
                const userId = user?.id || user?._id;
                const myFeedbacks = feedbacks.filter(fb => String(fb.student?._id) === String(userId));
                const otherFeedbacks = feedbacks.filter(fb => String(fb.student?._id) !== String(userId));
                const sortedFeedbacks = [...myFeedbacks, ...otherFeedbacks];
                return sortedFeedbacks.map(fb => (
                  <Card
                    key={fb._id}
                    style={{
                      marginBottom: 12,
                      borderRadius: 8,
                      background: String(fb.student?._id) === String(userId) ? '#e6f7ff' : undefined,
                      border: String(fb.student?._id) === String(userId) ? '1.5px solid #1890ff' : undefined
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar icon={<UserOutlined />} />
                      <b>
                        {fb.student?.fullName || 'Học viên'}
                        {String(fb.student?._id) === String(userId) && <span style={{ color: '#1890ff', marginLeft: 8 }}>(Bạn)</span>}
                      </b>
                      <Rate value={fb.rating} disabled style={{ fontSize: 16, marginLeft: 8 }} />
                    </div>
                    <div style={{ marginTop: 8 }}>{fb.comment}</div>
                    {/* Hiển thị nội dung trả lời của admin nếu có */}
                    {fb.reply && fb.reply.content && (
                      <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f', color: '#389e0d' }}>
                        <b>Phản hồi từ quản trị viên:</b> {fb.reply.content}
                      </div>
                    )}
                  </Card>
                ));
              })()}
            </div>
          )}
        </Card>
      </div>
      {/* Sidebar danh sách bài học với collection */}
      <div style={{ flex: 1, background: '#fafafa', padding: 24, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: 16 }}>Nội dung khóa học</h3>
        
        <Collapse 
          accordion 
          defaultActiveKey={(() => {
            // Tự động mở collection chứa lesson hiện tại
            const currentCollection = groupedLessons.find(collection => 
              collection.lessons.some(l => l._id === lessonId)
            );
            return currentCollection ? [currentCollection._id] : [];
          })()}
          style={{ background: 'transparent' }}
        >
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
              style={{ marginBottom: 8, borderRadius: 8 }}
            >
              <List
                dataSource={collection.lessons}
                size="small"
                renderItem={(item) => (
                  <List.Item
                    style={{ 
                      background: item._id === lessonId ? '#e6f7ff' : undefined, 
                      cursor: 'pointer',
                      borderRadius: 6,
                      marginBottom: 4,
                      padding: '8px 12px',
                      border: item._id === lessonId ? '1px solid #1890ff' : '1px solid transparent'
                    }}
                    onClick={() => navigate(`/student/lessons/${item._id}`)}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlayCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: item._id === lessonId ? 'bold' : 'normal' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {item.videoDuration ? Math.floor(item.videoDuration / 60) : 0} phút
                            {item.isPreviewable && (
                              <span style={{ color: '#52c41a', marginLeft: 8 }}>[Học thử]</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          ))}

          {/* Ungrouped Lessons */}
          {ungroupedLessons.length > 0 && (
            <Panel 
              key="ungrouped" 
              header="Bài học chưa có Collection"
              style={{ marginBottom: 8, borderRadius: 8 }}
            >
              <List
                dataSource={ungroupedLessons}
                size="small"
                renderItem={(item) => (
                  <List.Item
                    style={{ 
                      background: item._id === lessonId ? '#e6f7ff' : undefined, 
                      cursor: 'pointer',
                      borderRadius: 6,
                      marginBottom: 4,
                      padding: '8px 12px',
                      border: item._id === lessonId ? '1px solid #1890ff' : '1px solid transparent'
                    }}
                    onClick={() => navigate(`/student/lessons/${item._id}`)}
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PlayCircleOutlined style={{ color: '#1890ff', fontSize: 16 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: item._id === lessonId ? 'bold' : 'normal' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#888' }}>
                            {item.videoDuration ? Math.floor(item.videoDuration / 60) : 0} phút
                            {item.isPreviewable && (
                              <span style={{ color: '#52c41a', marginLeft: 8 }}>[Học thử]</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Panel>
          )}
        </Collapse>
      </div>
    </div>
  );
} 