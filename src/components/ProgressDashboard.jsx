import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Spin, Empty, Button } from 'antd';
import { 
  BookOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getUserProgress, formatTime } from '../services/progressService';
import { getMyEnrollments } from '../services/enrollmentService';
import { getLessonsByCourse } from '../services/lessonService';
import { issueCertificate } from '../services/certificateService';
import { getMyCertificates } from '../services/certificateService';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

const ProgressDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);
  const [issuedCourses, setIssuedCourses] = useState([]);

  useEffect(() => {
    loadProgressData();
    // Lấy danh sách certificate đã nhận
    getMyCertificates().then(res => {
      const courseIds = (res.data.data || []).map(cert => cert.course && (cert.course._id || cert.course));
      setIssuedCourses(courseIds);
    });
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      // Lấy enrollments (các khóa học đã đăng ký)
      const enrollmentsRes = await getMyEnrollments();
      const enrollments = enrollmentsRes.data.data || [];
      // Lấy progress
      const response = await getUserProgress();
      const data = response.data.data;
      setProgressData(data);

      // Map progress theo lessonId
      const progressMap = new Map();
      data.progresses.forEach(progress => {
        progressMap.set(progress.lesson._id, progress);
      });

      // Lấy danh sách bài học cho từng khóa học
      const courseLessons = [];
      for (const enrollment of enrollments) {
        const course = enrollment.course;
        if (!course || !course._id) continue;
        const lessonsRes = await getLessonsByCourse(course._id);
        const lessons = lessonsRes.data.data || [];
        courseLessons.push({ course, lessons });
      }

      // Join bài học với progress
      const courseMap = new Map();
      courseLessons.forEach(({ course, lessons }) => {
        const courseId = course._id;
        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            course,
            lessons: [],
            completedLessons: 0
          });
        }
        const courseData = courseMap.get(courseId);
        lessons.forEach(lesson => {
          const progress = progressMap.get(lesson._id);
          const watchedSeconds = progress ? progress.watchedSeconds : 0;
          const videoDuration = lesson.videoDuration || (progress ? progress.videoDuration : 0);
          const isCompleted = videoDuration > 0 && watchedSeconds / videoDuration >= 0.8;
          if (isCompleted) courseData.completedLessons++;
          courseData.lessons.push({ ...lesson, watchedSeconds, videoDuration, isCompleted });
        });
      });

      // Tính % hoàn thành cho từng khóa học
      const coursesWithProgress = Array.from(courseMap.values()).map(courseData => {
        const totalLessons = courseData.lessons.length;
        const progressPercent = totalLessons > 0 
          ? Math.round((courseData.completedLessons / totalLessons) * 100)
          : 0;
        return {
          ...courseData,
          progressPercent
        };
      });

      // Sắp xếp theo số lượng bài học đã hoàn thành gần nhất
      coursesWithProgress.sort((a, b) => b.completedLessons - a.completedLessons);
      setRecentCourses(coursesWithProgress.slice(0, 5));
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu tiến độ:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleIssueCertificate = async (courseId) => {
    try {
      const res = await issueCertificate(courseId);
      message.success(res.data.message || 'Đã nhận chứng chỉ thành công!');
      // Cập nhật issuedCourses bằng cách gọi lại getMyCertificates
      getMyCertificates().then(res2 => {
        const courseIds = (res2.data.data || []).map(cert => cert.course && (cert.course._id || cert.course));
        setIssuedCourses(courseIds);
      });
      if (res.data.data && res.data.data.certificateId) {
        window.open(`/certificate/${res.data.data.certificateId}`, '_blank');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Không thể nhận chứng chỉ!');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải thống kê tiến độ...</p>
      </div>
    );
  }

  if (!progressData) {
    return (
      <Empty 
        description="Chưa có dữ liệu tiến độ học tập"
        style={{ margin: '40px 0' }}
      />
    );
  }

  const { statistics } = progressData;

  return (
    <div>
      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Statistic
              title="Tổng khóa học"
              value={statistics.totalCourses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Statistic
              title="Tổng bài học"
              value={statistics.totalLessons}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Statistic
              title="Bài đã hoàn thành"
              value={statistics.completedLessons}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Statistic
              title="Tiến độ trung bình"
              value={statistics.averageProgress}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar tổng quan */}
      <Card title="Tiến độ học tập tổng quan" style={{ marginBottom: '24px' }}>
        <Progress 
          percent={statistics.averageProgress} 
          status="active"
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
        />
        <div style={{ marginTop: '8px', color: '#666' }}>
          Đã hoàn thành {statistics.completedLessons} / {statistics.totalLessons} bài học
        </div>
      </Card>

      {/* Danh sách khóa học gần đây */}
      <Card title="Khóa học gần đây">
        {recentCourses.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={recentCourses}
            renderItem={(courseData) => (
              <List.Item
                actions={[
                  <Tag color={courseData.progressPercent >= 100 ? "success" : courseData.progressPercent >= 90 ? "blue" : "processing"}>
                    {courseData.progressPercent}% hoàn thành
                  </Tag>,
                  <Button
                    type="primary"
                    disabled={courseData.progressPercent < 90}
                    onClick={() => {
                      if (issuedCourses.includes(courseData.course._id)) {
                        getMyCertificates().then(res => {
                          const cert = (res.data.data || []).find(cert => (cert.course && (cert.course._id || cert.course)) === courseData.course._id);
                          if (cert && cert.certificateId) {
                            window.open(`/certificate/${cert.certificateId}`, '_blank');
                          } else {
                            message.error('Không tìm thấy chứng chỉ!');
                          }
                        });
                      } else {
                        handleIssueCertificate(courseData.course._id);
                      }
                    }}
                  >
                    {issuedCourses.includes(courseData.course._id) ? 'Xem chứng chỉ' : 'Nhận certificate'}
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={courseData.course.thumbnail} 
                      icon={<BookOutlined />}
                      size="large"
                    />
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {courseData.course.title}
                      {courseData.progressPercent >= 100 && (
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                          Hoàn thành
                        </Tag>
                      )}
                    </div>
                  }
                  description={
                    <div>
                      <div>Đã học {courseData.completedLessons} / {courseData.lessons.length} bài</div>
                      <Progress 
                        percent={courseData.progressPercent} 
                        size="small" 
                        style={{ marginTop: '8px' }}
                        strokeColor={courseData.progressPercent >= 100 ? "#52c41a" : courseData.progressPercent >= 90 ? "#1890ff" : "#1890ff"}
                      />
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty 
            description="Chưa có khóa học nào được học"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Chi tiết bài học gần đây */}
      <Card title="Bài học gần đây" style={{ marginTop: '24px' }}>
        {progressData.progresses.length > 0 ? (
          <List
            size="small"
            dataSource={progressData.progresses
              .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
              .slice(0, 10)
            }
            renderItem={(progress) => {
              const progressPercent = progress.videoDuration > 0 
                ? Math.min((progress.watchedSeconds / progress.videoDuration) * 100, 100)
                : 0;
              const isCompleted = progressPercent >= 80;

              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={isCompleted ? <CheckCircleOutlined /> : <PlayCircleOutlined />}
                        style={{ 
                          backgroundColor: isCompleted ? '#52c41a' : '#1890ff' 
                        }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {progress.lesson.title}
                        {isCompleted && (
                          <Tag color="success" size="small">Hoàn thành</Tag>
                        )}
                      </div>
                    }
                    description={
                      <div>
                        <div>
                          <ClockCircleOutlined /> {formatTime(progress.watchedSeconds)} / {formatTime(progress.videoDuration)}
                        </div>
                        <Progress 
                          percent={Math.round(progressPercent)} 
                          size="small" 
                          style={{ marginTop: '4px' }}
                          strokeColor={isCompleted ? "#52c41a" : "#1890ff"}
                        />
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Cập nhật: {new Date(progress.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty 
            description="Chưa có bài học nào được học"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>
    </div>
  );
};

export default ProgressDashboard; 