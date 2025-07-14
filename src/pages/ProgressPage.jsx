import React from 'react';
import { useAuth } from '../context/authContext';
import { Navigate } from 'react-router-dom';
import ProgressDashboard from '../components/ProgressDashboard';
import { Card, Typography } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function ProgressPage() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'student') {
    return <Navigate to="/" />;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrophyOutlined style={{ color: '#faad14' }} />
          Thống kê tiến độ học tập
        </Title>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Theo dõi tiến độ học tập của bạn qua các khóa học
        </p>
      </Card>

      <ProgressDashboard />
    </div>
  );
} 