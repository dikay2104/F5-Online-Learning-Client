import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, Button, Card, Spin, Tabs } from 'antd';
import { getLessonsByCourse } from '../../services/lessonService';
import { getCourseById } from '../../services/courseService';
import { useAuth } from '../../context/authContext';
import { Rate, Form, Input, message, Typography, Avatar, Spin as AntdSpin } from 'antd';
import { getFeedbacksByCourse, createFeedback } from '../../services/feedbackService';
import {
  getCommentsByLesson,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  replyComment
} from '../../services/commentService';
import { UserOutlined } from '@ant-design/icons';
const { Title } = Typography;

function getYoutubeEmbedUrl(url) {
  const match = url && url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function LessonLearn() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('feedback');
  // Comment state
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(true);
  const [commentForm] = Form.useForm();
  const [submittingComment, setSubmittingComment] = useState(false);
  // Thêm các state cho sửa, trả lời, like/dislike
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingCommentId, setReplyingCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [likeLoading, setLikeLoading] = useState({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const courseId = localStorage.getItem('currentCourseId');
      if (!courseId) return;
      const token = localStorage.getItem('token');
      try {
        const courseRes = await getCourseById(courseId, token);
        setCourse(courseRes.data.data);
        const lessonsRes = await getLessonsByCourse(courseId);
        setLessons(lessonsRes.data.data);
        const found = lessonsRes.data.data.find(l => l._id === lessonId);
        setLesson(found);
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

  // Lấy comments cho bài học
  useEffect(() => {
    setCommentLoading(true);
    getCommentsByLesson(lessonId)
      .then(res => setComments(res.data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setCommentLoading(false));
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

  const handleSubmitComment = async (values) => {
    setSubmittingComment(true);
    try {
      await createComment({ lesson: lessonId, content: values.content });
      message.success('Đã gửi bình luận!');
      commentForm.resetFields();
      setCommentLoading(true);
      // Reload comments
      getCommentsByLesson(lessonId)
        .then(res => setComments(res.data.comments || []))
        .finally(() => setCommentLoading(false));
    } catch (err) {
      message.error(err.response?.data?.message || 'Gửi bình luận thất bại!');
    }
    setSubmittingComment(false);
  };

  // Kiểm tra user đã gửi feedback chưa
  const userId = user?.id || user?._id;
  const hasFeedback = !!(userId && feedbacks.some(fb => String(fb.student?._id) === String(userId)));
  console.log('userId:', userId, 'feedbacks:', feedbacks.map(fb => fb.student?._id), 'user:', user, 'feedbacks full:', feedbacks);

  // Xử lý sửa comment
  const handleEditComment = (comment) => {
    setEditingCommentId(comment._id);
    setEditingContent(comment.content);
  };
  const handleUpdateComment = async (id) => {
    if (!editingContent.trim()) {
      message.error('Nội dung không được để trống');
      return;
    }
    try {
      await updateComment(id, editingContent);
      setEditingCommentId(null);
      setEditingContent('');
      setCommentLoading(true);
      getCommentsByLesson(lessonId)
        .then(res => setComments(res.data.comments || []))
        .finally(() => setCommentLoading(false));
      message.success('Đã cập nhật bình luận');
    } catch (err) {
      message.error(err.response?.data?.message || 'Cập nhật bình luận thất bại!');
    }
  };
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent('');
  };
  // Xử lý xóa comment
  const handleDeleteComment = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bình luận này?')) return;
    try {
      await deleteComment(id);
      setCommentLoading(true);
      getCommentsByLesson(lessonId)
        .then(res => setComments(res.data.comments || []))
        .finally(() => setCommentLoading(false));
      message.success('Đã xóa bình luận');
    } catch (err) {
      message.error(err.response?.data?.message || 'Xóa bình luận thất bại!');
    }
  };
  // Xử lý like/dislike
  const handleLikeDislike = async (id, type) => {
    setLikeLoading(prev => ({ ...prev, [id]: true }));
    try {
      await likeComment(id, type);
      setCommentLoading(true);
      getCommentsByLesson(lessonId)
        .then(res => setComments(res.data.comments || []))
        .finally(() => setCommentLoading(false));
    } catch (err) {
      message.error('Thao tác thất bại!');
    }
    setLikeLoading(prev => ({ ...prev, [id]: false }));
  };
  // Xử lý trả lời
  const handleReplyComment = (id) => {
    setReplyingCommentId(id);
    setReplyContent('');
  };
  const handleSubmitReply = async (id) => {
    if (!replyContent.trim()) {
      message.error('Nội dung không được để trống');
      return;
    }
    try {
      await replyComment(id, replyContent);
      setReplyingCommentId(null);
      setReplyContent('');
      setCommentLoading(true);
      getCommentsByLesson(lessonId)
        .then(res => setComments(res.data.comments || []))
        .finally(() => setCommentLoading(false));
      message.success('Đã trả lời bình luận');
    } catch (err) {
      message.error('Trả lời thất bại!');
    }
  };
  const handleCancelReply = () => {
    setReplyingCommentId(null);
    setReplyContent('');
  };
  // Hàm dựng cây comment lồng nhau
  function buildCommentTree(list) {
    const map = {};
    list.forEach(c => (map[c._id] = { ...c, children: [] }));
    const tree = [];
    list.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].children.push(map[c._id]);
      } else {
        tree.push(map[c._id]);
      }
    });
    return tree;
  }
  // Render comment lồng nhau
  function renderComments(commentsTree, level = 0) {
    return commentsTree.map(cmt => {
      const isOwner = userId && String(cmt.user?._id) === String(userId);
      return (
        <Card
          key={cmt._id}
          style={{ marginBottom: 10, borderRadius: 8, marginLeft: level * 32, background: level ? '#fafbfc' : undefined }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar icon={<UserOutlined />} />
            <b>{cmt.user?.fullName || cmt.user?.email || 'Học viên'}</b>
            <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{new Date(cmt.createdAt).toLocaleString()}</span>
          </div>
          <div style={{ marginTop: 6 }}>
            {editingCommentId === cmt._id ? (
              <>
                <Input.TextArea
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                  rows={2}
                  style={{ marginBottom: 8 }}
                />
                <Button size="small" type="primary" onClick={() => handleUpdateComment(cmt._id)} style={{ marginRight: 8 }}>Lưu</Button>
                <Button size="small" onClick={handleCancelEdit}>Hủy</Button>
              </>
            ) : (
              <span>{cmt.content}</span>
            )}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button
              size="small"
              type={cmt.likes?.includes(userId) ? 'primary' : 'default'}
              loading={likeLoading[cmt._id]}
              onClick={() => handleLikeDislike(cmt._id, 'like')}
            >👍 {cmt.likes?.length || 0}</Button>
            <Button
              size="small"
              type={cmt.dislikes?.includes(userId) ? 'primary' : 'default'}
              loading={likeLoading[cmt._id]}
              onClick={() => handleLikeDislike(cmt._id, 'dislike')}
            >👎 {cmt.dislikes?.length || 0}</Button>
            <Button size="small" onClick={() => handleReplyComment(cmt._id)}>Trả lời</Button>
            {isOwner && (
              <>
                <Button size="small" onClick={() => handleEditComment(cmt)}>Sửa</Button>
                <Button size="small" danger onClick={() => handleDeleteComment(cmt._id)}>Xóa</Button>
              </>
            )}
          </div>
          {replyingCommentId === cmt._id && (
            <div style={{ marginTop: 8 }}>
              <Input.TextArea
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                rows={2}
                placeholder="Nhập trả lời..."
                style={{ marginBottom: 8 }}
              />
              <Button size="small" type="primary" onClick={() => handleSubmitReply(cmt._id)} style={{ marginRight: 8 }}>Gửi</Button>
              <Button size="small" onClick={handleCancelReply}>Hủy</Button>
            </div>
          )}
          {/* Render reply lồng nhau */}
          {cmt.children && cmt.children.length > 0 && renderComments(cmt.children, level + 1)}
        </Card>
      );
    });
  }

  if (loading || !lesson) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;

  const currentIdx = lessons.findIndex(l => l._id === lessonId);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];

  return (
    <div style={{ display: 'flex' }}>
      {/* Video + nội dung */}
      <div style={{ flex: 2, padding: 32, background: '#fff' }}>
        <Card style={{ marginBottom: 24 }}>
          {lesson.videoUrl && getYoutubeEmbedUrl(lesson.videoUrl) ? (
            <iframe
              width="100%"
              height="400"
              src={getYoutubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
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
        {/* Feedback & Comment Tabs section dưới video */}
        <Card style={{ borderRadius: 12, marginBottom: 48 }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
            {
              key: 'feedback',
              label: 'Đánh giá',
              children: (
                <div>
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
                </div>
              )
            },
            {
              key: 'comment',
              label: 'Bình luận',
              children: (
                <div>
                  <Title level={5}>Bình luận về bài học</Title>
                  {!authLoading && user && (
                    <Form form={commentForm} layout="vertical" onFinish={handleSubmitComment} style={{ marginBottom: 16 }}>
                      <Form.Item
                        name="content"
                        label="Nội dung bình luận"
                        validateTrigger="onSubmit"
                        rules={[
                          {
                            validator: (_, value) =>
                              value && value.trim()
                                ? Promise.resolve()
                                : Promise.reject("Vui lòng nhập nội dung bình luận"),
                          },
                        ]}
                      >
                        <Input.TextArea rows={2} placeholder="Nhập bình luận..." />
                      </Form.Item>
                      <Button type="primary" htmlType="submit" loading={submittingComment}>Gửi bình luận</Button>
                    </Form>
                  )}
                  {commentLoading ? <AntdSpin /> : (
                    <div>
                      {comments.length === 0 && <div>Chưa có bình luận nào.</div>}
                      {renderComments(buildCommentTree(comments))}
                    </div>
                  )}
                </div>
              )
            }
          ]} />
        </Card>
      </div>
      {/* Sidebar danh sách bài học */}
      <div style={{ flex: 1, background: '#fafafa', padding: 24, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
        <h3>Nội dung khóa học</h3>
        <List
          dataSource={lessons}
          renderItem={item => (
            <List.Item
              style={{ background: item._id === lessonId ? '#e6f7ff' : undefined, cursor: 'pointer' }}
              onClick={() => navigate(`/student/lessons/${item._id}`)}
            >
              <div>
                <b>{item.title}</b>
                <div style={{ fontSize: 12, color: '#888' }}>{item.videoDuration ? Math.floor(item.videoDuration / 60) : 0} phút</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
} 