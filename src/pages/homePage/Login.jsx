import { Button, Form, Input, message, Divider } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/authContext';
import { GoogleLogin } from '@react-oauth/google';
import { GoogleOutlined, FacebookFilled } from '@ant-design/icons'

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onFinish = async (values) => {
    try {
      const res = await login(values);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user)); // Dòng này rất quan trọng!
      setUser(res.data.user);
      message.success('Login successful');
      // Xử lý redirect sau khi login
      const redirect = localStorage.getItem("redirectAfterLogin");
      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        navigate(redirect);
      } else {
        // Nếu là student thì về trang home student
        if (res.data.user.role === "student") {
          navigate("/student/home");
        } else if (res.data.user.role === "teacher") {
          navigate("/my-courses"); // hoặc route phù hợp cho teacher
        } else if (res.data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/"); // fallback
        }
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      return message.error('Token không hợp lệ từ Google');
    }

    try {
      const res = await login({ type: 'google', token });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      message.success('Login with Google successful');
      navigateAfterLogin(res.data.user);
    } catch (err) {
      message.error(err.response?.data?.message || 'Google login failed');
    }
  };


  const navigateAfterLogin = (user) => {
    const redirect = localStorage.getItem('redirectAfterLogin');
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirect);
    } else {
      if (user.role === 'student') navigate('/student/home');
      else if (user.role === 'teacher') navigate('/my-courses');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    }
  };

  const handleFacebookLogin = async (token) => {
    try {
      const res = await login({ type: 'facebook', token });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setUser(res.data.user);
      message.success('Login with Facebook successful');
      navigateAfterLogin(res.data.user);
    } catch (err) {
      console.error("❌ Facebook login error", err.response);
      message.error(err.response?.data?.message || 'Facebook login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, width: '100%', margin: 'auto', marginTop: 100 }}>
      <h2>Login</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="email" label="Email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>Login</Button>
      </Form>

      <Divider plain>Hoặc đăng nhập bằng</Divider>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => message.error('Google login failed')}
            size="large"
            width="100%"
          />
        </div>

        <Button
          icon={<FacebookFilled />}
          style={{ backgroundColor: '#1877F2', color: 'white' }}
          block
          onClick={() => {
            window.FB.login(
              (response) => {
                if (response.authResponse) {
                  const { accessToken } = response.authResponse;
                  handleFacebookLogin(accessToken);
                } else {
                  message.error('Facebook login bị hủy hoặc lỗi');
                }
              },
              { scope: 'email' }
            );
          }}
        >
          Đăng nhập bằng Facebook
        </Button>
      </div>
    </div>
  );
}