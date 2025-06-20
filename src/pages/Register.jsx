// src/pages/Register.jsx
import { Button, Form, Input, Select, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

export default function Register() {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const res = await register(values);
      message.success(res.data.message);
      navigate('/login');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, width: '100%', margin: 'auto', marginTop: 100 }}>
      <h2>Register</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={[
            { label: 'Student', value: 'student' },
            { label: 'Teacher', value: 'teacher' },
          ]} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>Register</Button>
      </Form>
    </div>
  );
}
