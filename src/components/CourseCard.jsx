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
        <div style={{ width: '100%', height: 200, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          <img
            alt="course-thumbnail"
            src={thumbnail || thumbnailFallback}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
      }
      actions={actions}
      style={{
        minWidth: 260,
        maxWidth: 340,
        width: '100%',
        height: 420, // Card luôn cùng chiều cao
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Meta
          avatar={<Avatar icon={<UserOutlined />} src={teacher?.avatar} />}
          title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
          description={
            <Text type="secondary" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minHeight: 48,
              maxHeight: 48,
            }}>
              {description}
            </Text>
          }
        />
        <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
          <Space>
            <Tag color={levelColor[level]}>{level?.toUpperCase()}</Tag>
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
            <Text>
              {price == null
                ? 'Chưa có giá'
                : price === 0
                  ? 'Miễn phí'
                  : `${price.toLocaleString()}đ`}
            </Text>
          </Space>
          {role === 'teacher' && (
            <Space>
              <Text strong>Trạng thái:</Text>
              <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>
            </Space>
          )}
        </Space>
      </div>
      {/* Nút luôn ở dưới cùng */}
      {/* Nếu actions là mảng thì AntD sẽ render ở dưới, không cần custom thêm */}
    </Card>
  );
}