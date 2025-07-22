import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Typography, Spin, message } from 'antd';
import { Bar } from '@ant-design/charts';
import { getTeacherStatistics } from '../../services/teacherStatsService';

const { Title } = Typography;

const StatisticPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getTeacherStatistics();
        setStats(res.data);
      } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
        message.error('Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spin fullscreen />;

  const { overview, growth, topCourses } = stats;

  // Chart data
  const enrollmentChartData = growth.enrollmentsByMonth.map(item => ({
    date: `${item._id.month}/${item._id.year}`,
    value: item.count,
    type: 'Học viên',
  }));

  const courseChartData = growth.coursesByMonth.map(item => ({
    date: `${item._id.month}/${item._id.year}`,
    value: item.totalCourses,
    type: 'Khóa học',
  }));

  const chartData = [...enrollmentChartData, ...courseChartData];

  const chartConfig = {
    data: chartData,
    isGroup: true,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    color: ['#1890ff', '#fadb14'],
    label: {
        // Fix tại đây: chỉ nên dùng "top" hoặc bỏ luôn
        position: 'top', 
        layout: [{ type: 'interval-adjust-position' }],
    },
    };

  const courseColumns = [
    { title: 'Tên khóa học', dataIndex: 'title', key: 'title' },
    { title: 'Số học viên', dataIndex: 'studentsCount', key: 'studentsCount' },
    { title: 'Tổng thời lượng (phút)', dataIndex: 'duration', key: 'duration' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Thống kê giảng viên</Title>

      {/* Tổng quan */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số khóa học" value={overview.totalCourses} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số học viên" value={overview.totalStudents} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng thời lượng" value={overview.totalDuration} suffix="phút" />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số bài học" value={overview.totalLessons} />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng feedback" value={overview.totalFeedbacks} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Đánh giá trung bình" value={overview.averageRating} precision={2} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Trạng thái khóa học">
            {Object.entries(overview.statusCount).map(([status, count]) => (
              <Statistic key={status} title={status} value={count} style={{ marginBottom: 8 }} />
            ))}
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ tăng trưởng */}
      <Card title="Tăng trưởng theo tháng" style={{ marginTop: 24 }}>
        <Bar {...chartConfig} />
      </Card>

      {/* Top khóa học */}
      <Card title="Top 5 khóa học nhiều học viên nhất" style={{ marginTop: 24 }}>
        <Table
          dataSource={topCourses}
          columns={courseColumns}
          rowKey="_id"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default StatisticPage;
