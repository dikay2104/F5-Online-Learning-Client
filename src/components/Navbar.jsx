import { Link, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined,} from '@ant-design/icons';
import { useAuth } from '../context/authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // ✅ Lấy từ context

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); // ✅ cập nhật lại context
    navigate('/guest/home');
  };

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
    <Menu mode="horizontal" theme="light" style={{ height: 55, lineHeight: '55px' }}>
      <Menu.Item key="logo" onClick={() => navigate('/')}>
        <div style={{ fontWeight: 'bold', fontSize: 18 }}>F5 Learning</div>
      </Menu.Item>

      <Menu.Item key="spacer" style={{ marginLeft: 'auto', cursor: 'default' }} disabled />

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
  );
}