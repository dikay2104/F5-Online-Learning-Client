import { Layout, Menu } from 'antd';
import {
  BookOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  UsergroupAddOutlined,
  MessageOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Lấy đường dẫn hiện tại
  const { user } = useAuth();

  const pathname = location.pathname; // 👈 Dùng làm selectedKey

  const commonHomeItem = { key: '/', icon: <AppstoreOutlined />, label: 'Home' };
  const commonAboutItem = { key: '/about', icon: <ExclamationCircleOutlined />, label: 'About Us' };

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
    { key: '/admin/dashboard', icon: <AppstoreOutlined />, label: 'Dashboard' },
    { key: '/admin/users', icon: <UsergroupAddOutlined />, label: 'Manage Users' },
    { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
    commonAboutItem,
  ];

  const handleClick = (e) => {
    navigate(e.key);
  };

  const getMenuItems = () => {
    if (!user) return [commonHomeItem, commonAboutItem];
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
    <Sider width={200} className="site-layout-background">
      <Menu
        mode="inline"
        theme="light"
        style={{ height: '100%', borderRight: 0 }}
        className="custom-sidebar-menu"
        onClick={handleClick}
        items={getMenuItems()}
        selectedKeys={[pathname]} // 👈 Highlight theo route
      />
    </Sider>
  );
}
