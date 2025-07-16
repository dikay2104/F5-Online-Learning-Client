import { useEffect, useState, useRef } from "react";
import { getAllCourses } from "../../services/courseService";
import CourseCardStudent from "../../components/CourseCardStudent";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/authContext";
import { useNavigate, useLocation } from "react-router-dom";
import { message, Typography, Divider, Spin, Empty, Carousel, Button, Input } from "antd";
import { getMyEnrollments } from "../../services/enrollmentService";
import axios from "axios";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React from 'react';

const { Title } = Typography;

const slides = [
  {
    title: 'Học IT từ con số 0',
    desc: 'Lộ trình rõ ràng, mentor đồng hành, thực chiến dự án thực tế.',
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Cộng đồng hỗ trợ 24/7',
    desc: 'Tham gia group học tập, hỏi đáp, chia sẻ kinh nghiệm cùng hàng ngàn học viên.',
    img: 'https://images.unsplash.com/photo-1503676382389-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Nâng cấp sự nghiệp IT',
    desc: 'Khóa học nâng cao, cập nhật công nghệ mới, mentor là chuyên gia thực chiến.',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  },
];

export default function StudentHome() {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const carouselRef = useRef();
  const [searchValue, setSearchValue] = useState("");

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

  // Lọc theo search
  const filteredCourses = courses.filter(course => {
    const keyword = searchValue.trim().toLowerCase();
    if (!keyword) return true;
    return (
      course.title?.toLowerCase().includes(keyword) ||
      course.description?.toLowerCase().includes(keyword)
    );
  });
  const freeCourses = filteredCourses.filter((c) => c.price === 0);
  const vipCourses = filteredCourses.filter((c) => c.price > 0);

  // Responsive grid: auto-fit cho mọi thiết bị
  const renderCourseGrid = (courseList) => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '32px',
        justifyContent: 'center',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {courseList.map(course => (
        <div key={course._id} style={{ display: 'flex' }}>
          <CourseCardStudent
            course={course}
            isEnrolled={enrolledCourseIds.includes(course._id)}
            onView={() => handleView(course._id)}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 16px' }}>
      {/* Slide bar section */}
      <div style={{ width: '100%', margin: '0 auto', padding: '32px 0', position: 'relative' }}>
        {/* Custom Arrow Buttons */}
        <Button
          shape="circle"
          icon={<LeftOutlined />}
          size="large"
          style={{
            position: 'absolute',
            top: '50%',
            left: -18,
            zIndex: 10,
            transform: 'translateY(-50%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            background: '#fff',
            border: '1.5px solid #e0e0e0',
            borderRadius: 20,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => carouselRef.current.prev()}
        />
        <Button
          shape="circle"
          icon={<RightOutlined />}
          size="large"
          style={{ position: 'absolute', top: '50%', right: -24, zIndex: 2, transform: 'translateY(-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
          onClick={() => carouselRef.current.next()}
        />
        <Carousel
          ref={carouselRef}
          autoplay
          dots
          style={{ margin: '0 auto', maxWidth: 1100, width: '100%' }}
        >
          {slides.map((slide, idx) => (
            <div key={idx}>
              <div style={{
                position: 'relative',
                background: '#f5f7fa',
                borderRadius: 20,
                minHeight: 340,
                overflow: 'hidden',
                padding: 0,
                width: '100%',
                margin: '0 auto',
                border: '1.5px solid #e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img 
                  src={slide.img} 
                  alt={slide.title} 
                  style={{ 
                    width: '100%', 
                    height: 340, 
                    objectFit: 'cover', 
                    borderRadius: 20, 
                    display: 'block',
                  }} 
                />
                {/* Caption overlay */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 80%, rgba(0,0,0,0) 100%)',
                  color: '#fff',
                  padding: '20px 32px 18px 32px',
                  borderBottomLeftRadius: 20,
                  borderBottomRightRadius: 20,
                  boxSizing: 'border-box',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 600, marginBottom: 2 }}>{slide.title}</div>
                  <div style={{ fontSize: 16, fontWeight: 400 }}>{slide.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
      {/* Search bar dưới carousel */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
        <Input.Search
          placeholder="Tìm kiếm khoá học..."
          allowClear
          enterButton
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={v => setSearchValue(v)}
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Khóa học miễn phí */}
      <div style={{ marginBottom: 48 }}>
        <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, fontSize: 18 }}>
          Khóa học miễn phí
        </Divider>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : freeCourses.length === 0 ? (
          <Empty description="Chưa có khóa học miễn phí" style={{ margin: '32px 0' }} />
        ) : (
          renderCourseGrid(freeCourses)
        )}
      </div>

      {/* Khóa học VIP/Pro */}
      <div style={{ marginBottom: 48 }}>
        <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, fontSize: 18 }}>
          Khóa học VIP/Pro
        </Divider>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : vipCourses.length === 0 ? (
          <Empty description="Chưa có khóa học VIP/Pro" style={{ margin: '32px 0' }} />
        ) : (
          renderCourseGrid(vipCourses)
        )}
      </div>
    </div>
  );
}