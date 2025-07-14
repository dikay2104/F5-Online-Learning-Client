import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Spin, Empty, Table } from 'antd';
import { 
  UserOutlined, 
  PlayCircleOutlined, 
  CheckCircleOutlined, 
  BookOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { getCourseProgressStats } from '../services/progressService';

const TeacherProgressStats = ({ courseId }) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    if (courseId) {
      loadStatsData();
    }
  }, [courseId]);

  const loadStatsData = async () => {
    try {
      setLoading(true);
      const response = await getCourseProgressStats(courseId);
      setStatsData(response.data.data);
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <p style={{ marginTop: '16px' }}>Đang tải thống kê khóa học...</p>
      </div>
    );
  }

  if (!statsData) {
    return (
      <Empty 
        description="Không có dữ liệu thống kê"
        style={{ margin: '40px 0' }}
      />
    );
  }

  const { courseTitle, totalStudents, totalLessons, lessonStats } = statsData;

  // Tính tổng % hoàn thành trung bình
  const averageCompletionRate = lessonStats.length > 0 
    ? Math.round(lessonStats.reduce((sum, lesson) => sum + lesson.completionRate, 0) / lessonStats.length)
    : 0;

  // Columns cho table
  const columns = [
    {
      title: 'Bài học',
      dataIndex: 'lessonTitle',
      key: 'lessonTitle',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            ID: {record.lessonId}
          </div>
        </div>
      )
    },
    {
      title: 'Học viên đã học',
      dataIndex: 'totalStudents',
      key: 'totalStudents',
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ marginRight: '4px' }} />
          {value}
        </div>
      )
    },
    {
      title: 'Học viên hoàn thành',
      dataIndex: 'completedStudents',
      key: 'completedStudents',
      render: (value, record) => (
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ marginRight: '4px', color: '#52c41a' }} />
          {value} / {record.totalStudents}
        </div>
      )
    },
    {
      title: 'Tỷ lệ hoàn thành',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (value) => (
        <div>
          <Progress 
            percent={value} 
            size="small" 
            strokeColor={value >= 80 ? "#52c41a" : value >= 50 ? "#faad14" : "#ff4d4f"}
          />
          <div style={{ textAlign: 'center', fontSize: '12px', marginTop: '4px' }}>
            {value}%
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: '#1890ff' }}>
          <BookOutlined style={{ marginRight: '8px' }} />
          Thống kê tiến độ: {courseTitle}
        </h2>
      </Card>

      {/* Thống kê tổng quan */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng học viên"
              value={totalStudents}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bài học"
              value={totalLessons}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tỷ lệ hoàn thành TB"
              value={averageCompletionRate}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Trạng thái"
              value={totalStudents > 0 ? "Đang hoạt động" : "Chưa có học viên"}
              valueStyle={{ 
                color: totalStudents > 0 ? '#52c41a' : '#ff4d4f',
                fontSize: '16px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Bar tổng quan */}
      <Card title="Tỷ lệ hoàn thành trung bình" style={{ marginBottom: '24px' }}>
        <Progress 
          percent={averageCompletionRate} 
          status="active"
          strokeColor={{
            '0%': '#ff4d4f',
            '50%': '#faad14',
            '100%': '#52c41a',
          }}
        />
        <div style={{ marginTop: '8px', color: '#666' }}>
          Trung bình {averageCompletionRate}% học viên hoàn thành mỗi bài học
        </div>
      </Card>

      {/* Bảng chi tiết từng bài học */}
      <Card title="Chi tiết tiến độ từng bài học">
        {lessonStats.length > 0 ? (
          <Table
            columns={columns}
            dataSource={lessonStats}
            rowKey="lessonId"
            pagination={false}
            size="middle"
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty 
            description="Chưa có dữ liệu tiến độ cho bài học nào"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Card>

      {/* Biểu đồ phân tích */}
      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Phân bố tỷ lệ hoàn thành">
            {lessonStats.length > 0 ? (
              <div>
                {lessonStats.map((lesson, index) => (
                  <div key={lesson.lessonId} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px' }}>
                        {lesson.lessonTitle.length > 30 
                          ? lesson.lessonTitle.substring(0, 30) + '...' 
                          : lesson.lessonTitle
                        }
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>
                        {lesson.completionRate}%
                      </span>
                    </div>
                    <Progress 
                      percent={lesson.completionRate} 
                      size="small"
                      strokeColor={lesson.completionRate >= 80 ? "#52c41a" : lesson.completionRate >= 50 ? "#faad14" : "#ff4d4f"}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thống kê nhanh">
            {lessonStats.length > 0 ? (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bài học có tỷ lệ cao nhất:</span>
                    <Tag color="success">
                      {lessonStats.reduce((max, lesson) => 
                        lesson.completionRate > max.completionRate ? lesson : max
                      ).lessonTitle}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bài học có tỷ lệ thấp nhất:</span>
                    <Tag color="error">
                      {lessonStats.reduce((min, lesson) => 
                        lesson.completionRate < min.completionRate ? lesson : min
                      ).lessonTitle}
                    </Tag>
                  </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bài học có nhiều học viên nhất:</span>
                    <Tag color="processing">
                      {lessonStats.reduce((max, lesson) => 
                        lesson.totalStudents > max.totalStudents ? lesson : max
                      ).lessonTitle}
                    </Tag>
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Số bài học đã có học viên:</span>
                    <Tag color="blue">
                      {lessonStats.filter(lesson => lesson.totalStudents > 0).length} / {lessonStats.length}
                    </Tag>
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherProgressStats; 