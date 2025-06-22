import { Card, Avatar, Tag, Button, Space, Typography } from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BookOutlined,
  CheckCircleTwoTone,
  CloseCircleTwoTone,
  HourglassTwoTone,
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

export default function CourseCard({ course, role = 'student', onEdit, onDelete, onSubmit }) {
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

  const renderStatusIcon = () => {
    switch (status) {
      case 'approved':
        return <CheckCircleTwoTone twoToneColor="#52c41a" />;
      case 'rejected':
        return <CloseCircleTwoTone twoToneColor="#f5222d" />;
      default:
        return <HourglassTwoTone twoToneColor="#faad14" />;
    }
  };

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
        ].filter(Boolean) // loại bỏ undefined nếu không hiển thị Gửi duyệt
      : [<Button type="primary">Xem khoá học</Button>];

  return (
    <Card
      hoverable
      cover={
        <img
          alt="course-thumbnail"
          src={thumbnail || thumbnailFallback}
          style={{ height: 200, objectFit: 'cover' }}
        />
      }
      actions={actions}
    >
      <Meta
        avatar={<Avatar icon={<UserOutlined />} src={teacher?.avatar} />}
        title={<Title level={4} style={{ margin: 0 }}>{title}</Title>}
        description={<Text type="secondary">{description?.slice(0, 100)}...</Text>}
      />

      <Space direction="vertical" size="small" style={{ marginTop: 16 }}>
        <Space>
          <Tag color={levelColor[level]}>{level?.toUpperCase()}</Tag>
          <Tag>{category}</Tag>
        </Space>
        <Space>
          <ClockCircleOutlined />
          <Text>{duration} phút</Text>
        </Space>
        <Space>
          <BookOutlined />
          <Text>{studentsCount} học viên</Text>
        </Space>
        <Space>
          <DollarOutlined />
          <Text>{price === 0 ? 'Miễn phí' : `${price.toLocaleString()}đ`}</Text>
        </Space>
        {role === 'teacher' && (
          <Space>
            <Text strong>Trạng thái:</Text>
            <Tag color={statusColor[status]}>{status.toUpperCase()}</Tag>
            {/* {renderStatusIcon()} */}
          </Space>
        )}
      </Space>
    </Card>
  );
}
