import { Link, useNavigate } from 'react-router-dom';
import { Menu, Dropdown, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/authContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth(); // ✅ Lấy từ context

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null); // ✅ cập nhật lại context
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/')}>
        Profile
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Menu mode="horizontal" theme="dark">
      <Menu.Item key="home">
        <Link to="/">Home</Link>
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
          <Dropdown overlay={userMenu} placement="bottomRight">
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
          </Dropdown>
        </Menu.Item>
      )}
    </Menu>
  );
}
