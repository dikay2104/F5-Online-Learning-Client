import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Spin, message } from "antd";
import { getAdminSummary } from "../../services/adminService";
import AdminRevenueChart from "../../components/AdminRevenueChart";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await getAdminSummary(token);
        setStats(res.data);
      } catch (err) {
        message.error("Không thể tải dữ liệu thống kê");
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) return <Spin style={{ marginTop: 40 }} size="large" />;

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số người dùng" value={stats?.totalUsers || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Số giáo viên" value={stats?.totalTeachers || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Số học viên" value={stats?.totalStudents || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số khóa học" value={stats?.totalCourses || 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Khóa học đã duyệt" value={stats?.approvedCourses || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Khóa học chờ duyệt" value={stats?.pendingCourses || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Khóa học bị từ chối" value={stats?.rejectedCourses || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số bài học" value={stats?.totalLessons || 0} />
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic title="Tổng số phản hồi" value={stats?.totalFeedbacks || 0} />
          </Card>
        </Col>
      </Row>
      {/* Thêm chart doanh thu */}
      <AdminRevenueChart />
    </div>
  );
};

export default AdminDashboard; 