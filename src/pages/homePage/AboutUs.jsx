import { Typography, Card, Row, Col, Carousel } from 'antd';

const { Title, Paragraph, Text } = Typography;

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

export default function AboutUs() {
  return (
    <div style={{ maxWidth: 1100, margin: '40px auto', padding: '24px' }}>
      {/* 1. Carousel Section */}
      <div style={{ marginBottom: 48 }}>
        <Title level={1} style={{ color: '#1677ff', textAlign: 'center', marginBottom: 24 }}>Khám phá F5 Online Learning</Title>
        <Carousel autoplay dots arrows style={{ margin: '0 auto', maxWidth: 800 }}>
          {slides.map((slide, idx) => (
            <div key={idx}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f7fa',
                borderRadius: 16,
                minHeight: 260,
                overflow: 'hidden',
                padding: 24,
                gap: 32,
                maxWidth: 800,
                margin: '0 auto',
              }}>
                <img src={slide.img} alt={slide.title} style={{ width: 320, height: 200, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} />
                <div>
                  <Title level={3} style={{ color: '#1677ff', marginBottom: 8 }}>{slide.title}</Title>
                  <Text style={{ fontSize: 18 }}>{slide.desc}</Text>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      {/* 2. Description Section */}
      <div style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Title level={1} style={{ color: '#1677ff', textAlign: 'center', marginBottom: 24 }}>Về F5 Online Learning</Title>
        <Card style={{ borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', maxWidth: 700, width: '100%', textAlign: 'center', background: '#fafdff' }}>
          <Paragraph style={{ fontSize: 18, marginBottom: 16 }}>
            F5 Online Learning là nền tảng học trực tuyến hiện đại, giúp kết nối học viên và giảng viên trong lĩnh vực lập trình và công nghệ. Chúng tôi mang đến lộ trình học rõ ràng, nội dung chất lượng và trải nghiệm học tập thân thiện, phù hợp cho cả người mới bắt đầu và lập trình viên muốn nâng cao kỹ năng.
          </Paragraph>
          <Paragraph style={{ fontSize: 16, color: '#555' }}>
            Sứ mệnh của chúng tôi là giúp mọi người tiếp cận tri thức công nghệ một cách dễ dàng, hiệu quả và truyền cảm hứng sáng tạo.
          </Paragraph>
        </Card>
      </div>

      {/* 3. News Section */}
      <div>
        <Title level={1} style={{ color: '#1677ff', textAlign: 'center', marginBottom: 32 }}>Câu chuyện học viên & F5 Learning</Title>
        <Row gutter={[32, 32]} justify="center">
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