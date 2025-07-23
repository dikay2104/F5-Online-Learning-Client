import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Collapse,
  Typography,
  Spin,
  Card,
  Space,
  Button,
  message,
  Descriptions,
  Tag,
  Divider,
  Badge,
  Image,
  List,
  Rate,
  Avatar,
} from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import { getLessonsByCourse } from "../../services/lessonService";
import {
  getCourseById,
  approveCourse,
  rejectCourse,
} from "../../services/courseService";
import { getCollectionsByCourse } from "../../services/collectionService";
import { getFeedbacksByCourse } from "../../services/feedbackService";
import { UserOutlined } from "@ant-design/icons";
import thumbnailFallback from "../../assets/thumbnail.jpg"; // Adjust path if needed

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // useEffect(() => {
  //   if (user?.role === 'admin') {
  //     navigate(`/courses/${courseId}`);
  //   }
  // }, [user, courseId, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseRes = await getCourseById(courseId, token);
        setCourse(courseRes.data.data);

        const lessonRes = await getLessonsByCourse(courseId);
        setLessons(lessonRes.data.data);

        const collectionRes = await getCollectionsByCourse(courseId);
        setCollections(collectionRes.data.data);
      } catch (err) {
        message.error("Không thể tải khóa học");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    setFeedbackLoading(true);
    getFeedbacksByCourse(courseId)
      .then((res) => {
        setFeedbacks(res.data.feedbacks || []);
      })
      .catch(() => setFeedbacks([]))
      .finally(() => setFeedbackLoading(false));
  }, [courseId, token]);

  const ungroupedLessons = lessons.filter((l) => !l.collection);

  if (loading) {
    return (
      <Spin
        size="large"
        style={{ display: "flex", justifyContent: "center", marginTop: 48 }}
      />
    );
  }

  if (!course) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Title level={3}>Không tìm thấy khóa học</Title>
        </Card>
      </div>
    );
  }

  // console.log("USER:", user, "ROLE:", user?.role, "STATUS:", course.status);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Image
            width={320}
            src={course.thumbnail || thumbnailFallback}
            fallback={thumbnailFallback}
            alt="Course thumbnail"
            style={{ borderRadius: 8 }}
          />

          <Title level={2}>{course.title}</Title>
          <Text type="secondary">{course.description}</Text>

          <Descriptions
            bordered
            column={1}
            size="middle"
            style={{ marginTop: 24 }}
            labelStyle={{ fontWeight: "bold", width: 180 }}
          >
            <Descriptions.Item label="Giá">
              {course.price > 0 ? `${course.price}₫` : "Miễn phí"}
            </Descriptions.Item>
            <Descriptions.Item label="Trình độ">
              <Tag color="blue">{course.level}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Chuyên mục">
              <Tag color="purple">{course.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thời lượng">
              {course.duration >= 3600
                ? `${Math.floor(course.duration / 3600)} giờ ${Math.floor(
                    (course.duration % 3600) / 60
                  )} phút`
                : `${Math.floor(course.duration / 60)} phút`}
            </Descriptions.Item>
            <Descriptions.Item label="Số học viên">
              {course.studentsCount}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={
                  course.status === "approved"
                    ? "success"
                    : course.status === "pending"
                    ? "processing"
                    : course.status === "rejected"
                    ? "error"
                    : "default"
                }
                text={
                  course.status === "approved"
                    ? "Đã duyệt"
                    : course.status === "pending"
                    ? "Chờ duyệt"
                    : course.status === "rejected"
                    ? "Từ chối"
                    : "Bản nháp"
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="Giảng viên">
              {course.teacher?.fullName}
            </Descriptions.Item>
          </Descriptions>

          {/* Nếu là admin, hiển thị thêm thông tin kiểm duyệt */}
          {user?.role === "admin" && (
            <Card
              style={{
                marginTop: 24,
                background: "#fffbe6",
                border: "1px solid #ffe58f",
              }}
            >
              <Title level={4} style={{ color: "#faad14" }}>
                Thông tin kiểm duyệt
              </Title>
              <p>
                <b>Trạng thái:</b> {course.status === "approved"
                  ? "Đã duyệt"
                  : course.status === "pending"
                  ? "Chờ duyệt"
                  : course.status === "rejected"
                  ? "Từ chối"
                  : "Bản nháp"}
              </p>
              <p>
                <b>Ngày tạo:</b> {new Date(course.createdAt).toLocaleString()}
              </p>
              <p>
                <b>Giáo viên:</b> {course.teacher?.fullName || "Không rõ"}
              </p>
              {course.status === "pending" && (
                <div style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={async () => {
                      try {
                        await approveCourse(localStorage.getItem("token"), course._id);
                        message.success("Đã duyệt khóa học");
                        window.location.reload();
                      } catch (err) {
                        message.error("Duyệt khóa học thất bại");
                      }
                    }}
                  >
                    Duyệt
                  </Button>
                  <Button
                    danger
                    onClick={async () => {
                      try {
                        await rejectCourse(localStorage.getItem("token"), course._id);
                        message.success("Đã từ chối khóa học");
                        window.location.reload();
                      } catch (err) {
                        message.error("Từ chối khóa học thất bại");
                      }
                    }}
                  >
                    Từ chối
                  </Button>
                </div>
              )}
            </Card>
          )}

          {user?.role === 'teacher' && user?._id === course?.teacher?._id && (
            <Button
              type="primary"
              onClick={() => navigate(`/courses/${courseId}/edit`)}
            >
              Chỉnh sửa khóa học
            </Button>
          )}
        </Space>
      </Card>

      <Divider />

      <Card
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          padding: 24,
          marginBottom: 32,
        }}
      >
        <Title level={4} style={{ marginBottom: 0 }}>
          Đánh giá khóa học
        </Title>
        {feedbackLoading ? (
          <Spin />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Rate
                allowHalf
                disabled
                value={
                  feedbacks.length > 0
                    ? feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
                      feedbacks.length
                    : 0
                }
              />
              <Text strong style={{ fontSize: 18 }}>
                {feedbacks.length > 0
                  ? (
                      feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) /
                      feedbacks.length
                    ).toFixed(1)
                  : 0}
              </Text>
              <Text type="secondary">({feedbacks.length} đánh giá)</Text>
            </div>
            <List
              dataSource={feedbacks}
              locale={{ emptyText: "Chưa có đánh giá nào" }}
              renderItem={(fb) => (
                <List.Item style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={
                      <span>
                        <b>
                          {fb.student?.fullName ||
                            fb.student?.email ||
                            "Học viên"}
                        </b>
                        <Rate
                          disabled
                          value={fb.rating}
                          style={{ fontSize: 14, marginLeft: 8 }}
                        />
                      </span>
                    }
                    description={fb.comment}
                  />
                </List.Item>
              )}
            />
          </>
        )}
      </Card>

      <Divider />

      <Card title="Danh sách bài học" style={{ marginTop: 24 }}>
        <Collapse accordion>
          {/* Collections */}
          {collections.map((collection) => {
            const lessonsInCollection = lessons.filter(
              (l) => l.collection === collection._id
            );
            return (
              <Panel
                key={collection._id}
                header={
                  <Space size="small">
                    <Text strong>{collection.title}</Text>
                    {collection.duration != null && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <ClockCircleOutlined style={{ marginRight: 4 }} />
                        {collection.duration} phút
                      </Text>
                    )}
                  </Space>
                }
              >
                <List
                  dataSource={lessonsInCollection}
                  bordered
                  renderItem={(lesson) => (
                    <List.Item
                      actions={[
                        <Button
                          type="link"
                          onClick={() =>
                            navigate(`/courses/${courseId}/edit`)
                          }
                        >
                          Chỉnh sửa
                        </Button>,
                      ]}
                    >
                      <Space size="small" wrap>
                        <Text strong>{lesson.title}</Text>
                        {lesson.videoDuration != null && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {Math.floor(lesson.videoDuration / 60)}:
                            {(lesson.videoDuration % 60)
                              .toString()
                              .padStart(2, "0")}{" "}
                            phút
                          </Text>
                        )}
                        {lesson.isPreviewable && (
                          <Text type="success" style={{ fontSize: 12 }}>
                            [Học thử]
                          </Text>
                        )}
                      </Space>
                    </List.Item>
                  )}
                />
              </Panel>
            );
          })}

          {/* Ungrouped Lessons */}
          {ungroupedLessons.length > 0 && (
            <Panel key="ungrouped" header="Bài học chưa có Collection">
              <List
                dataSource={ungroupedLessons}
                bordered
                renderItem={(lesson) => (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        onClick={() => navigate(`/lessons/${lesson._id}/edit`)}
                      >
                        Chỉnh sửa
                      </Button>,
                    ]}
                  >
                    <Space size="small" wrap>
                      <Text strong>{lesson.title}</Text>
                      {lesson.videoDuration != null && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <ClockCircleOutlined style={{ marginRight: 4 }} />
                          {Math.floor(lesson.videoDuration / 60)}:
                          {(lesson.videoDuration % 60)
                            .toString()
                            .padStart(2, "0")}{" "}
                          phút
                        </Text>
                      )}
                      {lesson.isPreviewable && (
                        <Text type="success" style={{ fontSize: 12 }}>
                          [Học thử]
                        </Text>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            </Panel>
          )}
        </Collapse>
      </Card>
    </div>
  );
}
