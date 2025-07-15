import { useEffect, useState } from 'react';
import { Typography, Divider, Spin, Empty, Carousel, Button } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';
import { getAllCourses } from '../../services/courseService';
import CourseCard from '../../components/CourseCard';

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
    img: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'Nâng cấp sự nghiệp IT',
    desc: 'Khóa học nâng cao, cập nhật công nghệ mới, mentor là chuyên gia thực chiến.',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  },
];

export default function GuestHome() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef();

  useEffect(() => {
    getAllCourses()
      .then(res => setCourses(res.data.data || res.data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const freeCourses = courses.filter(c => c.price === 0);
  const vipCourses = courses.filter(c => c.price > 0);

  // Custom responsive grid
  const renderCourseGrid = (courseList) => (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '32px',
      justifyContent: 'flex-start',
    }}>
      {courseList.map(course => (
        <div
          key={course._id}
          style={{
            flex: '1 1 260px',
            minWidth: 260,
            maxWidth: 340,
            boxSizing: 'border-box',
            display: 'flex',
          }}
        >
          <CourseCard course={course} role="guest" />
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 16px' }}>
      {/* Slide bar section */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px auto', position: 'relative' }}>
        {/* Custom Arrow Buttons */}
        <Button
          shape="circle"
          icon={<LeftOutlined />}
          size="large"
          style={{ position: 'absolute', top: '50%', left: -24, zIndex: 2, transform: 'translateY(-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
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
                maxWidth: 1100,
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