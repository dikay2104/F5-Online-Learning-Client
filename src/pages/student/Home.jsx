import { useEffect, useState } from "react";
import { getAllCourses } from "../../services/courseService";
import CourseCardStudent from "../../components/CourseCardStudent";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses()
      .then(res => {
        setCourses(res.data.data || res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
                onView={() => handleView(course._id)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}