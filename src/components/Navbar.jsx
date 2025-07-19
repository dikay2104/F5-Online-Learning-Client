import { Link, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar, Badge, Modal, List, Button, message, Spin } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, BellOutlined, DeleteOutlined, CheckOutlined} from '@ant-design/icons';
import { useAuth } from '../context/authContext';
import { useEffect, useState } from 'react';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../services/notificationService';
import socket from '../utils/socket';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // ✅ Lấy từ context
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (user?._id) {
      socket.emit('join', user._id);
      fetchNotifications();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); // ✅ cập nhật lại context
    navigate('/guest/home');
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications(token);
      setNotifications(res.data.data); // tùy thuộc vào backend trả về
    } catch (err) {
      message.error('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(token, id);
    fetchNotifications();
  };

  const handleDelete = async (id) => {
    await deleteNotification(token, id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead(token);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Lắng nghe socket khi có thông báo mới
  useEffect(() => {
    const handleNewNotification = (data) => {
      message.info(data.message);
      fetchNotifications();
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, []);

  // Khi mở modal thì fetch thông báo
  useEffect(() => {
    if (visible) fetchNotifications();
  }, [visible]);

  const userMenu = (
    <Menu
      style={{ width: 200 }}
      items={[
        {
          type: 'group',
          key: 'userinfo',
          label: (
            <div style={{ padding: 0 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <Avatar
                  size={30}
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>
                    {user?.fullName}
                  </div>
                  <div
                    style={{
                      color: '#f56c6c',
                      fontSize: 12,
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ROLE: {user?.role?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        {
          type: 'divider',
        },
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'Profile',
          onClick: () => navigate('/profile'),
        },
        {
          key: 'setting',
          icon: <SettingOutlined />,
          label: 'Thiết lập'
          // style: { backgroundColor: '#fff7e6' },
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          onClick: handleLogout,
        },
      ]}
    />
  );

  return (
    <>
      <Menu mode="horizontal" theme="light" style={{ height: 55, lineHeight: '55px' }}>
        <Menu.Item key="logo" onClick={() => navigate('/')}>
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>F5 Learning</div>
        </Menu.Item>

        <Menu.Item key="spacer" style={{ marginLeft: 'auto', cursor: 'default' }} disabled />

        {user && (
            <Menu.Item key="notification">
              <Badge count={unreadCount} offset={[10, 0]}>
                <BellOutlined
                  style={{ fontSize: 20, cursor: 'pointer' }}
                  onClick={() => setVisible(true)}
                />
              </Badge>
            </Menu.Item>
        )}

        {!user ? (
          <>
            <Menu.Item key="login">
              <Link to="/login">Login</Link>
            </Menu.Item>
            <Menu.Item key="register">
              <Link to="/register">Register</Link>
            </Menu.Item>
          </>
        ) : (
          <Menu.Item key="user">
            <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
              <Avatar
                icon={!user?.avatar && <UserOutlined />}
                src={user?.avatar}
                style={{ cursor: 'pointer' }}
              />
            </Dropdown>
          </Menu.Item>
        )}
      </Menu>
      
      {/* Modal Notification */}
      <Modal
        title="Thông báo"
        open={visible}
        onCancel={() => setVisible(false)}
        footer={[
          <Button key="markall" type="default" onClick={handleMarkAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>,
          <Button key="close" onClick={() => setVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {loading ? (
          <Spin />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.read ? '#fafafa' : '#e6f7ff',
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 12,
                  display: 'flex',
                }}
                actions={[
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!item.read && (
                      <Button
                        icon={<CheckOutlined />}
                        size="small"
                        onClick={() => handleMarkAsRead(item._id)}
                      >
                        Đã đọc
                      </Button>
                    )}
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      onClick={() => handleDelete(item._id)}
                    >
                      Xoá
                    </Button>
                  </div>,
                ]}
              >
                <div>
                  <div style={{ fontWeight: item.read ? 'normal' : 'bold', marginBottom: 4 }}>
                    {item.message}
                  </div>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              </List.Item>

            )}
          />
        )}
      </Modal>
    </>
  );
}