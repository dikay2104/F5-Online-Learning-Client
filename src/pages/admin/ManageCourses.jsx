import { useEffect, useState } from "react";
import { Table, message, Tag, Input, Select, Button, Modal } from "antd";
import { getAllCourses, approveCourse, rejectCourse } from "../../services/courseService";
const { Option } = Select;

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getAllCourses();
      setCourses(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      message.error("Không thể tải danh sách khóa học");
    }
    setLoading(false);
  };

  const handleViewDetail = (course) => {
    setSelectedCourse(course);
    setDetailModalOpen(true);
  };

  const handleApprove = async (id) => {
    try {
      await approveCourse(id);
      message.success("Đã duyệt khóa học");
      setDetailModalOpen(false);
      fetchCourses();
    } catch {
      message.error("Duyệt khóa học thất bại");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectCourse(id);
      message.success("Đã từ chối khóa học");
      setDetailModalOpen(false);
      fetchCourses();
    } catch {
      message.error("Từ chối khóa học thất bại");
    }
  };

  const columns = [
    { title: "Tên khóa học", dataIndex: "title", key: "title" },
    { title: "Giáo viên", dataIndex: "teacher", key: "teacher", render: teacher => teacher?.fullName || "Không rõ" },
    { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", render: date => new Date(date).toLocaleString() },
    { title: "Trạng thái", dataIndex: "status", key: "status", render: status => {
        let color = "default";
        if (status === "approved") color = "green";
        else if (status === "pending") color = "orange";
        else if (status === "rejected") color = "red";
        return <Tag color={color}>{status || "Không rõ"}</Tag>;
      }
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          Xem chi tiết
        </Button>
      )
    },
  ];

  const filteredCourses = courses
    .filter(
      course =>
        (!searchText ||
          course.title?.toLowerCase().includes(searchText.toLowerCase()))
    )
    .filter(
      course =>
        !statusFilter || course.status === statusFilter
    );

  return (
    <div>
      <h2>Quản lý tất cả khóa học</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm tên khóa học"
          allowClear
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 250 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 180 }}
          onChange={value => setStatusFilter(value)}
        >
          <Option value="approved">Đã duyệt</Option>
          <Option value="pending">Chờ duyệt</Option>
          <Option value="rejected">Bị từ chối</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredCourses}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Chi tiết khóa học"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={600}
      >
        {selectedCourse && (
          <div>
            <p><b>Tên:</b> {selectedCourse.title}</p>
            <p><b>Mô tả:</b> {selectedCourse.description}</p>
            <p><b>Giáo viên:</b> {selectedCourse.teacher?.fullName || "Không rõ"}</p>
            <p><b>Trạng thái:</b> {selectedCourse.status}</p>
            {/* ... các thông tin khác */}
            {selectedCourse.status === "pending" && (
              <div style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  onClick={() => handleApprove(selectedCourse._id)}
                  style={{ marginRight: 8 }}
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  onClick={() => handleReject(selectedCourse._id)}
                >
                  Từ chối
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
