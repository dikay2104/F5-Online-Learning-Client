import { Card, Avatar, Tag, Button, Space, Typography } from 'antd';
import { UserOutlined, ClockCircleOutlined, DollarOutlined, BookOutlined } from '@ant-design/icons';
import thumbnailFallback from '../assets/thumbnail.jpg';
import { useState } from 'react';
import { Modal } from 'antd';

const { Meta } = Card;
const { Text, Title } = Typography;

export default function CourseCardStudent({ course, onView, isEnrolled, onJoin, onPay }) {
  const {
    title, description, price, thumbnail, level, category, duration, studentsCount, teacher,
  } = course;

  return (
    <Card
      hoverable
      cover={
        <img
          alt="course-thumbnail"
          src={thumbnail || thumbnailFallback}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        />
      }
      onClick={onView}
      style={{
        minWidth: 260,
        maxWidth: 340,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
      bodyStyle={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        height: '100%'
      }}
    >
      <Meta
        avatar={<Avatar icon={<UserOutlined />} src={teacher?.avatar} />}
        title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
        description={<Text type="secondary">{description?.slice(0, 100)}...</Text>}
      />
      <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
        <Space>
          <Tag color="blue">{level?.toUpperCase()}</Tag>
          <Tag>{category}</Tag>
        </Space>
        <Space>
          <ClockCircleOutlined />
          <Text>
            {duration >= 3600
              ? `${Math.floor(duration / 3600)} giờ ${Math.floor((duration % 3600) / 60)} phút`
              : `${Math.floor(duration / 60)} phút`}
          </Text>
        </Space>
        <Space>
          <BookOutlined />
          <Text>{studentsCount} học viên</Text>
        </Space>
        <Space>
          <DollarOutlined />
          <Text>{typeof price === 'number' ? (price === 0 ? 'Miễn phí' : `${price.toLocaleString()}đ`) : '---'}</Text>
        </Space>
      </Space>
    </Card>
  );
}