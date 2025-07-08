import { Typography, Card } from 'antd';

const { Title, Paragraph } = Typography;

export default function AboutUs() {
  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: '24px' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <Title level={1} style={{ color: '#1677ff' }}>Về F5 Online Learning</Title>
        <Paragraph style={{ fontSize: 18 }}>
          F5 Online Learning là nền tảng học trực tuyến hiện đại, giúp kết nối học viên và giảng viên trong lĩnh vực lập trình và công nghệ. Chúng tôi mang đến lộ trình học rõ ràng, nội dung chất lượng và trải nghiệm học tập thân thiện, phù hợp cho cả người mới bắt đầu và lập trình viên muốn nâng cao kỹ năng.
        </Paragraph>
        <Paragraph style={{ fontSize: 16, color: '#555' }}>
          Sứ mệnh của chúng tôi là giúp mọi người tiếp cận tri thức công nghệ một cách dễ dàng, hiệu quả và truyền cảm hứng sáng tạo.
        </Paragraph>
      </Card>
    </div>
  );
} 