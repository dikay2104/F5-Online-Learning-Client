import { useEffect, useState } from "react";
import { Table, Button, Tag, message, Input, Select } from "antd";
import { getAllUsers, banUser, unbanUser } from "../../services/userService";
import axios from "axios";

const { Search } = Input;
const { Option } = Select;

const API_URL = "/api/feedbacks";

export const getFeedbacksByCourse = (courseId) =>
  axios.get(`${API_URL}?course=${courseId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  });

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Lấy danh sách user khi load trang
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data.users);
    } catch (err) {
      message.error("Không thể tải danh sách user");
    }
    setLoading(false);
  };

  const handleBan = async (id) => {
    try {
      await banUser(id);
      message.success("Đã ban user");
      fetchUsers();
    } catch {
      message.error("Ban user thất bại");
    }
  };

  const handleUnban = async (id) => {
    try {
      await unbanUser(id);
      message.success("Đã unban user");
      fetchUsers();
    } catch {
      message.error("Unban user thất bại");
    }
  };

  const columns = [
    { title: "Họ tên", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role", render: (role) => <Tag color={role === "admin" ? "red" : role === "teacher" ? "blue" : "green"}>{role}</Tag> },
    { title: "Trạng thái", dataIndex: "isBanned", key: "isBanned", render: (isBanned) => isBanned ? <Tag color="red">Banned</Tag> : <Tag color="green">Active</Tag> },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        record.isBanned
          ? <Button type="primary" onClick={() => handleUnban(record._id)}>Unban</Button>
          : <Button danger onClick={() => handleBan(record._id)}>Ban</Button>
      )
    }
  ];

  const filteredUsers = users
    .filter(
      user =>
        (!searchText ||
          user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter(user => !roleFilter || user.role === roleFilter)
    .filter(user =>
      !statusFilter ||
      (statusFilter === "active" && !user.isBanned) ||
      (statusFilter === "banned" && user.isBanned)
    );

  return (
    <div>
      <h2>Quản lý người dùng</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Search
          placeholder="Tìm kiếm theo tên hoặc email"
          allowClear
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo vai trò"
          allowClear
          style={{ width: 150 }}
          onChange={value => setRoleFilter(value)}
        >
          <Option value="admin">Admin</Option>
          <Option value="teacher">Teacher</Option>
          <Option value="student">Student</Option>
        </Select>
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 150 }}
          onChange={value => setStatusFilter(value)}
        >
          <Option value="active">Active</Option>
          <Option value="banned">Banned</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
