import { Typography, Card, Row, Col, Carousel, Button, Divider } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import React, { useRef } from 'react';

const { Title, Paragraph, Text } = Typography;

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

const news = [
  {
    title: 'Phỏng vấn sinh viên học IT',
    content: '“Nhờ F5 Learning, mình đã có lộ trình học rõ ràng, được mentor hỗ trợ tận tình và tự tin apply thực tập chỉ sau 6 tháng!” – Minh, sinh viên năm 2.',
    img: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'Phỏng vấn người đi làm chuyển ngành IT',
    content: '“Mình từng là kế toán, nhờ các khóa học thực chiến và cộng đồng hỗ trợ, mình đã chuyển sang làm lập trình viên backend tại công ty công nghệ lớn.” – Huyền, 27 tuổi.',
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
  {
    title: 'F5 Learning – Nền tảng học IT hiện đại',
    content: 'F5 Learning cung cấp lộ trình học bài bản, mentor giàu kinh nghiệm, hệ thống bài tập thực tế và hỗ trợ 1-1 giúp bạn chinh phục ngành IT dễ dàng.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80',
  },
];

export default function AboutUs() {
  const carouselRef = useRef();

  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '24px' }}>
      {/* Slide bar section (copied from guest/home) */}
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


      {/* 3. News Section */}
      <div>
      <Divider orientation="left" orientationMargin={0} style={{ fontWeight: 600, fontSize: 18 }}>
          Khóa học miễn phí
        </Divider><Row gutter={[32, 32]} justify="center">
          {news.map((item, idx) => (
            <Col xs={24} sm={12} md={8} key={idx}>
              <Card
                hoverable
                cover={<img src={item.img} alt={item.title} style={{ width: '100%', height: 180, objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }} />}
                style={{ borderRadius: 12, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}
              >
                <Title level={4} style={{ color: '#1677ff', minHeight: 48 }}>{item.title}</Title>
                <Paragraph style={{ fontSize: 15, color: '#444', flex: 1 }}>{item.content}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
} 