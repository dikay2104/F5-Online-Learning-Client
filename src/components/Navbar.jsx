import { Link, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined, AppstoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
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
                  size={36}
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500, wordBreak: 'break-word' }}>
                    {user?.fullName}
                  </div>
                  <div style={{ color: '#1677ff', fontSize: 12, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    ROLE: {user?.role?.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          ),
        },
        { type: 'divider' },
        { key: 'profile', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate('/') },
        { key: 'setting', icon: <SettingOutlined />, label: 'Thiết lập' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', onClick: handleLogout },
      ]}
    />
  );

  return (
    <div style={{
      width: '100%',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      zIndex: 10,
      position: 'sticky',
      top: 0
    }}>
      {/* Thêm 2 mục Home và About Us */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontWeight: 'bold', fontSize: 22, color: '#1677ff', letterSpacing: 1, cursor: 'pointer', marginRight: 24 }} onClick={() => navigate('/')}>F5 Learning</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#222', fontWeight: 500 }} onClick={() => navigate('/') }>
            <AppstoreOutlined style={{ fontSize: 20, marginRight: 6 }} /> Home
          </div>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#222', fontWeight: 500 }} onClick={() => navigate('/about') }>
            <ExclamationCircleOutlined style={{ fontSize: 20, marginRight: 6 }} /> About Us
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      {!user ? (
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/login" style={{ fontWeight: 500, color: '#1677ff' }}>Login</Link>
          <Link to="/register" style={{ fontWeight: 500, color: '#1677ff' }}>Register</Link>
        </div>
      ) : (
        <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
          <Avatar
            size={36}
            icon={!user?.avatar && <UserOutlined />}
            src={user?.avatar}
            style={{ cursor: 'pointer', marginLeft: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          />
        </Dropdown>
      )}
    </div>
  );
}
