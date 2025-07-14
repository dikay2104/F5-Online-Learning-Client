import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Spin, Empty } from 'antd';
import { 
  BookOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { getUserProgress, formatTime } from '../services/progressService';

const ProgressDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState(null);
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const response = await getUserProgress();
      const data = response.data.data;
      
      setProgressData(data);
      
      // Lấy danh sách khóa học gần đây (có progress)
      const courseMap = new Map();
      data.progresses.forEach(progress => {
        const courseId = progress.course._id;
        if (!courseMap.has(courseId)) {
          courseMap.set(courseId, {
            course: progress.course,
            lessons: [],
            totalProgress: 0,
            completedLessons: 0
          });
        }
        
        const courseData = courseMap.get(courseId);
        courseData.lessons.push(progress);
        
        if (progress.videoDuration && progress.watchedSeconds / progress.videoDuration >= 0.8) {
          courseData.completedLessons++;
        }
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

      // Sắp xếp theo thời gian cập nhật gần nhất
      coursesWithProgress.sort((a, b) => {
        const aLatest = Math.max(...a.lessons.map(l => new Date(l.updatedAt)));
        const bLatest = Math.max(...b.lessons.map(l => new Date(l.updatedAt)));
        return bLatest - aLatest;
      });

      setRecentCourses(coursesWithProgress.slice(0, 5)); // Lấy 5 khóa học gần nhất
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu tiến độ:', error);
    } finally {
      setLoading(false);
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
          <Card>
            <Statistic
              title="Tổng khóa học"
              value={statistics.totalCourses}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bài học"
              value={statistics.totalLessons}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bài đã hoàn thành"
              value={statistics.completedLessons}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
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
                  <Tag color={courseData.progressPercent >= 100 ? "success" : "processing"}>
                    {courseData.progressPercent}% hoàn thành
                  </Tag>
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
                        strokeColor={courseData.progressPercent >= 100 ? "#52c41a" : "#1890ff"}
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