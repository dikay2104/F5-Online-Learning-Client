import { useEffect, useState } from "react";
import { getAllCourses } from "../../services/courseService";
import CourseCardStudent from "../../components/CourseCardStudent";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { message } from "antd";
import { getMyEnrollments } from "../../services/enrollmentService";
import axios from "axios";

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy danh sách enrollment khi vào trang hoặc sau khi thanh toán thành công
  const fetchEnrollments = async () => {
    try {
      const res = await getMyEnrollments();
      setEnrolledCourseIds(
        res.data.data
          .filter(e => e.status === "active")
          .map(e => e.course._id)
      );
    } catch {}
  };

  useEffect(() => {
    getAllCourses()
      .then(res => {
        setCourses(res.data.data || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const responseCode = params.get("vnp_ResponseCode");
    const orderId = params.get("vnp_TxnRef");
    if (responseCode === "00" && orderId) {
      // Gọi API xác nhận enrollment
      axios.post(
        process.env.REACT_APP_API_BASE_URL + "/enrollments/confirm",
        { orderId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      ).then(() => {
        fetchEnrollments();
        message.success("Thanh toán thành công!");
        window.history.replaceState({}, document.title, "/");
      }).catch(() => {
        message.error("Có lỗi khi xác nhận tham gia khóa học!");
        window.history.replaceState({}, document.title, "/");
      });
    }
    if (responseCode && responseCode !== "00") {
      message.error("Thanh toán thất bại!");
      window.history.replaceState({}, document.title, "/");
    }
  }, [location]);

  // Khi bấm "Xem chi tiết"
  const handleView = (courseId) => {
    console.log("View course", courseId, user);
    if (!user) {
      localStorage.setItem("redirectAfterLogin", `/student/courses/${courseId}`);
      navigate("/login");
    } else {
      navigate(`/student/courses/${courseId}`);
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: 24 }}>
      <h2>Danh sách khóa học</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {courses.length === 0 ? (
          <p>Không có khóa học nào.</p>
        ) : (
          courses.map(course => (
            <div key={course._id}>
              <CourseCardStudent
                course={course}
                isEnrolled={enrolledCourseIds.includes(course._id)}
                onView={() => handleView(course._id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}