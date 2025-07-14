import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  UsergroupAddOutlined,
  MessageOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const pathname = location.pathname;

  const commonHomeItem = { key: '/', icon: <AppstoreOutlined />, label: 'Home' };
  const commonAboutItem = { key: '/about', icon: <ExclamationCircleOutlined />, label: 'About Us' };
  const profileItem = { key: '/profile', icon: <SettingOutlined />, label: 'Profile' };

  const studentItems = [
    commonHomeItem,
    { key: '/my-courses', icon: <BookOutlined />, label: 'My Courses' },
    { key: '/progress', icon: <LineChartOutlined />, label: 'Progress' },
    { key: '/lessons', icon: <PlayCircleOutlined />, label: 'Lessons' },
    commonAboutItem,
  ];

  const teacherItems = [
    commonHomeItem,
    { key: '/my-courses', icon: <BookOutlined />, label: 'My Courses' },
    { key: '/feedback', icon: <MessageOutlined />, label: 'Feedback' },
    { key: '/students', icon: <UsergroupAddOutlined />, label: 'Students' },
    commonAboutItem,
  ];

  const adminItems = [
    commonHomeItem,
    { key: '/admin/dashboard', icon: <AppstoreOutlined style={{ fontSize: 20 }} />, label: 'Dashboard' },
    { key: '/admin/users', icon: <UsergroupAddOutlined style={{ fontSize: 20 }} />, label: 'Manage Users' },
    { key: '/admin/courses', icon: <BookOutlined style={{ fontSize: 20 }} />, label: 'Manage Courses' },
    { key: '/admin/feedbacks', icon: <MessageOutlined style={{ fontSize: 20 }} />, label: 'Manage Feedback' },
    commonAboutItem,
  ];

  const guestItems = [
    commonHomeItem,
    { key: '/roadmap-fe', icon: <CodeOutlined />, label: 'Lộ trình Frontend' },
    { key: '/roadmap-be', icon: <DatabaseOutlined />, label: 'Lộ trình Backend' },
    commonAboutItem,
  ];

  const handleClick = (e) => {
    navigate(e.key);
  };

  const getMenuItems = () => {
    if (!user) return guestItems;
    switch (user.role) {
      case 'student':
        return studentItems;
      case 'teacher':
        return teacherItems;
      case 'admin':
        return adminItems;
      default:
        return [];
    }
  };

  return (
    <Sider
      width={220}
      className="site-layout-background"
      style={{
        background: '#fff',
        // borderRadius: '0 16px 16px 0',
        boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        minHeight: '100vh',
        // padding: '24px 0 24px 0',
        position: 'sticky',
        top: 0,
        zIndex: 9
      }}
      breakpoint="lg"
      collapsedWidth={0}
    >
      <Menu
        mode="inline"
        theme="light"
        style={{
          height: '100%',
          borderRight: 0,
          background: 'transparent',
          fontWeight: 500,
          fontSize: 14,
          padding: '8px 0',
        }}
        className="custom-sidebar-menu"
        onClick={handleClick}
        items={getMenuItems()}
        selectedKeys={[pathname]}
      />
    </Sider>
  );
}
