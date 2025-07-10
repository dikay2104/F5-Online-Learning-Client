import { useEffect, useState } from "react";
import { Table, message, Popconfirm, Button, Modal, Input, Select } from "antd";
import { getAllFeedbacks, deleteFeedback, replyFeedback } from "../../services/feedbackService";

const { Option } = Select;

export default function ManageFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [replyModal, setReplyModal] = useState({ open: false, id: null });
  const [replyText, setReplyText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await getAllFeedbacks();
      setFeedbacks(Array.isArray(res.data) ? res.data : res.data.feedbacks || []);
    } catch (err) {
      message.error("Không thể tải danh sách feedback");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      message.success("Đã xóa phản hồi");
      fetchFeedbacks();
    } catch {
      message.error("Xóa phản hồi thất bại");
    }
  };

  const handleReply = async () => {
    try {
      await replyFeedback(replyModal.id, replyText);
      message.success("Đã trả lời phản hồi");
      setReplyModal({ open: false, id: null });
      setReplyText("");
      fetchFeedbacks();
    } catch {
      message.error("Trả lời phản hồi thất bại");
    }
  };

  const columns = [
    {
      title: "Người gửi",
      dataIndex: "student",
      key: "student",
      render: student => student?.email ? student.email : "Không rõ"
    },
    // {
    //   title: "Khóa học",
    //   dataIndex: "course",
    //   key: "course",
    //   render: course => course?.title || "Không có"
    // },
    {
      title: "Đánh giá",
      dataIndex: "rating",
      key: "rating",
      render: rating => rating ? rating : "Không có"
    },
    {
      title: "Nội dung",
      dataIndex: "comment",
      key: "comment",
      render: comment => comment || "Không có nội dung"
    },
    {
      title: "Nội dung trả lời",
      dataIndex: "reply",
      key: "reply",
      render: reply => reply?.content || "Chưa trả lời"
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdAt",
      key: "createdAt",
      render: date => new Date(date).toLocaleString()
    },
    {
      title: "Trạng thái",
      dataIndex: "reply",
      key: "replyStatus",
      render: reply => reply ? <span style={{ color: "green" }}>Đã trả lời</span> : <span style={{ color: "red" }}>Chưa trả lời</span>
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <>
          <Popconfirm
            title="Bạn có chắc muốn xóa phản hồi này?"
            onConfirm={() => handleDelete(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
          {!record.reply && (
            <Button
              type="primary"
              style={{ marginLeft: 8 }}
              onClick={() => setReplyModal({ open: true, id: record._id })}
            >
              Trả lời
            </Button>
          )}
        </>
      )
    }
  ];

  const filteredFeedbacks = feedbacks
    .filter(
      fb =>
        (!searchText ||
          fb.comment?.toLowerCase().includes(searchText.toLowerCase()) ||
          fb.student?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
          fb.reply?.content?.toLowerCase().includes(searchText.toLowerCase())
        )
    )
    .filter(fb =>
      !statusFilter ||
      (statusFilter === "answered" && fb.reply) ||
      (statusFilter === "unanswered" && !fb.reply)
    );

  return (
    <div>
      <h2>Quản lý phản hồi</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm nội dung hoặc người gửi"
          allowClear
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          allowClear
          style={{ width: 180 }}
          onChange={value => setStatusFilter(value)}
        >
          <Option value="answered">Đã trả lời</Option>
          <Option value="unanswered">Chưa trả lời</Option>
        </Select>
      </div>
      <Table
        columns={columns}
        dataSource={filteredFeedbacks}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title="Trả lời phản hồi"
        open={replyModal.open}
        onOk={handleReply}
        onCancel={() => { setReplyModal({ open: false, id: null }); setReplyText(""); }}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Input.TextArea
          rows={4}
          value={replyText}
          onChange={e => setReplyText(e.target.value)}
          placeholder="Nhập nội dung trả lời..."
        />
      </Modal>
    </div>
  );
}
