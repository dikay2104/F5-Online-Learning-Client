import { Button, Form, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { useAuth } from '../../context/authContext';

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const onFinish = async (values) => {
    try {
      const res = await login(values);
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user); // set context
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
    </div>
  );
}