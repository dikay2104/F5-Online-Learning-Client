import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCourseById } from "../../services/courseService";
import { enrollCourse, createPayment } from "../../services/enrollmentService";
import { useAuth } from "../../context/authContext";
import Loading from "../../components/Loading";
import { Button, message, Collapse, List, Tag } from "antd";

export default function StudentCourseDetail() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getCourseById(courseId)
      .then(res => {
        setCourse(res.data.data || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  const handleJoin = async () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/student/courses/${courseId}`);
      navigate("/login");
      return;
    }
    if (course.price === 0) {
      try {
        await enrollCourse(courseId);
        message.success("Đã tham gia khóa học!");
        // Có thể reload lại hoặc chuyển sang trang học
      } catch (err) {
        message.error("Tham gia thất bại!");
      }
    } else {
      try {
        const res = await createPayment(courseId);
        window.location.href = res.data.paymentUrl;
      } catch (err) {
        message.error("Không thể thanh toán!");
      }
    }
  };

  if (loading) return <Loading />;
  if (!course) return <p>Không tìm thấy khóa học</p>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "auto" }}>
      <div style={{ display: "flex", gap: 32 }}>
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{ width: 320, borderRadius: 8 }}
        />
        <div>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div>
            <Tag color="blue">{course.level?.toUpperCase()}</Tag>
            <Tag>{course.category}</Tag>
          </div>
          <div>
            <b>Thời lượng:</b> {Math.floor(course.duration / 60)} phút
          </div>
          <div>
            <b>Số bài học:</b> {course.lessons?.length || 0}
          </div>
          <div>
            <b>Giá:</b> {course.price === 0 ? "Miễn phí" : `${course.price.toLocaleString()}đ`}
          </div>
          <Button type="primary" onClick={handleJoin} style={{ marginTop: 16 }}>
            {course.price === 0 ? "Tham gia khóa học" : "Thanh toán"}
          </Button>
        </div>
      </div>
      <h2 style={{ marginTop: 32 }}>Nội dung khóa học</h2>
      <Collapse accordion>
        <Collapse.Panel header="Tất cả bài học" key="1">
          <List
            dataSource={course.lessons || []}
            renderItem={lesson => (
              <List.Item>
                <div>
                  <b>{lesson.title}</b> - {Math.floor(lesson.videoDuration / 60)} phút
                </div>
              </List.Item>
            )}
          />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
}