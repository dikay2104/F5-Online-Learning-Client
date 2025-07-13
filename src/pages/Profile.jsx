import { useEffect, useState } from 'react';
import { Card, Input, Button, Avatar, message, Upload, Form, Spin, Table } from 'antd';
import { getCurrentUser, updateCurrentUser } from '../services/userService';
import { useAuth } from '../context/authContext';
import { UploadOutlined } from '@ant-design/icons';
import { getMyEnrollments } from '../services/enrollmentService';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await getCurrentUser(token);
        const u = res.data.user || res.data;
        form.setFieldsValue({
          fullName: u.fullName,
          email: u.email,
          avatar: u.avatar,
        });
        setAvatarUrl(u.avatar);
        // Lấy lịch sử mua khóa học
        const enrollRes = await getMyEnrollments();
        setEnrollments(enrollRes.data.data || []);
      } catch (e) {
        message.error('Không thể tải thông tin cá nhân!');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await updateCurrentUser(values);
      message.success('Cập nhật thành công!');
      setUser(res.data.user);
      setAvatarUrl(res.data.user.avatar);
      if (res.data.token) localStorage.setItem('token', res.data.token);
      form.resetFields(['currentPassword', 'newPassword']);
    } catch (e) {
      message.error(e.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = info => {
    if (info.file.status === 'uploading') {
      // Có thể show loading nếu muốn
      return;
    }
    if (info.file.status === 'done') {
      const url = info.file.response?.url || info.file.response;
      if (url) {
        setAvatarUrl(url);
        form.setFieldsValue({ avatar: url });
        message.success('Tải ảnh thành công!');
      } else {
        message.error('Không lấy được link ảnh!');
      }
    } else if (info.file.status === 'error') {
      message.error('Tải ảnh thất bại!');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '40px auto' }}>
      <Card title="Thông tin cá nhân" bordered>
        {loading ? <Spin /> : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            initialValues={{ avatar: avatarUrl }}
          >
            <Form.Item label="Ảnh đại diện" name="avatar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Avatar src={avatarUrl} size={64} />
                <Form.Item name="avatar" noStyle>
                  <Input style={{ display: 'none' }} />
                </Form.Item>
                <Upload
                  name="file"
                  action={process.env.REACT_APP_API_BASE_URL + '/upload/avatar'}
                  showUploadList={false}
                  onChange={handleAvatarChange}
                  headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                >
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                </Upload>
              </div>
            </Form.Item>
            <Form.Item label="Họ tên" name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}> 
              <Input />
            </Form.Item>
            <Form.Item label="Mật khẩu hiện tại" name="currentPassword">
              <Input.Password autoComplete="current-password" />
            </Form.Item>
            <Form.Item label="Mật khẩu mới" name="newPassword">
              <Input.Password autoComplete="new-password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={saving}>Lưu thay đổi</Button>
            </Form.Item>
          </Form>
        )}
      </Card>
      {/* Lịch sử mua khóa học */}
      <Card title="Lịch sử mua khóa học" style={{ marginTop: 32 }}>
        <Table
          dataSource={enrollments}
          rowKey={e => e._id}
          pagination={false}
          columns={[
            {
              title: 'Tên khóa học',
              dataIndex: ['course', 'title'],
              key: 'title',
              render: (text, record) => record.course?.title || '---',
            },
            {
              title: 'Ngày đăng ký',
              dataIndex: 'enrolledAt',
              key: 'enrolledAt',
              render: date => date ? new Date(date).toLocaleString() : '---',
            },
            {
              title: 'Giá',
              dataIndex: ['course', 'price'],
              key: 'price',
              render: (price) => price === 0 ? 'Miễn phí' : (price ? price.toLocaleString() + 'đ' : '---'),
            },
            {
              title: 'Trạng thái',
              dataIndex: 'status',
              key: 'status',
              render: status => {
                if (status === 'active') return 'Đã thanh toán';
                if (status === 'pending_payment') return 'Chờ thanh toán';
                if (status === 'cancelled') return 'Đã hủy';
                return status;
              }
            }
          ]}
        />
      </Card>
    </div>
  );
} 