import { Card, Avatar, Tag, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BookOutlined,
} from '@ant-design/icons';
import thumbnailFallback from '../assets/thumbnail.jpg';

const { Meta } = Card;
const { Text, Title } = Typography;

const statusColor = {
  approved: 'green',
  pending: 'orange',
  rejected: 'red',
  draft: 'default',
};

const levelColor = {
  beginner: 'blue',
  intermediate: 'purple',
  advanced: 'red',
};

export default function CourseCard({ course, role = 'student', onClick, onEdit, onDelete, onSubmit }) {
  const {
    title,
    description,
    price,
    thumbnail,
    level,
    category,
    duration,
    studentsCount,
    status,
    teacher,
  } = course;

  const actions =
    role === 'teacher'
      ? [
          <Button type="link" onClick={(e) => { e.stopPropagation(); onEdit(); }}>Chỉnh sửa</Button>,
          <Button type="link" danger onClick={(e) => { e.stopPropagation(); onDelete(); }}>Xoá</Button>,
          status === 'draft' && (
            <Button type="link" onClick={(e) => { e.stopPropagation(); onSubmit(); }}>
              Gửi duyệt
            </Button>
          ),
        ].filter(Boolean)
      : [<Button type="primary">Xem khoá học</Button>];

  return (
    <Card
      hoverable
      onClick={onClick}
      cover={
        <img
          alt="course-thumbnail"
          src={thumbnail || thumbnailFallback}
          style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        />
      }
      actions={actions}
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
      }}
      bodyStyle={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '16px',
        height: '100%'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Meta
          avatar={<Avatar icon={<UserOutlined />} src={teacher?.avatar} />}
          title={
            <Title level={5} style={{ margin: 0, lineHeight: 1.4, minHeight: 40 }}>
              {title}
            </Title>
          }
          description={
            <Text type="secondary" style={{ 
              display: 'block', 
              minHeight: 48,
              lineHeight: 1.5,
              fontSize: 13
            }}>
              {description?.slice(0, 80)}...
            </Text>
          }
        />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: 16 }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space wrap>
              <Tag color={levelColor[level]} style={{ margin: 0 }}>{level?.toUpperCase()}</Tag>
              <Tag style={{ margin: 0 }}>{category}</Tag>
            </Space>
            <Space size="small">
              <ClockCircleOutlined style={{ color: '#666' }} />
              <Text style={{ fontSize: 13 }}>
                {duration >= 3600
                  ? `${Math.floor(duration / 3600)} giờ ${Math.floor((duration % 3600) / 60)} phút`
                  : `${Math.floor(duration / 60)} phút`}
              </Text>
            </Space>
            <Space size="small">
              <BookOutlined style={{ color: '#666' }} />
              <Text style={{ fontSize: 13 }}>{studentsCount} học viên</Text>
            </Space>
            <Space size="small">
              <DollarOutlined style={{ color: '#666' }} />
              <Text style={{ fontSize: 13, fontWeight: 500 }}>
                {price == null
                  ? 'Chưa có giá'
                  : price === 0
                    ? 'Miễn phí'
                    : `${price.toLocaleString()}đ`}
              </Text>
            </Space>
            {role === 'teacher' && (
              <Space size="small">
                <Text strong style={{ fontSize: 13 }}>Trạng thái:</Text>
                <Tag color={statusColor[status]} style={{ margin: 0 }}>{status.toUpperCase()}</Tag>
              </Space>
            )}
          </Space>
        </div>
      </div>
    </Card>
  );
}