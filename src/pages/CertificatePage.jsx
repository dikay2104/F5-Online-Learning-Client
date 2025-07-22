import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateById } from '../services/certificateService';
import { Card, Spin, Button, Typography, message } from 'antd';
import html2canvas from 'html2canvas';

const { Title } = Typography;

export default function CertificatePage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef();

  useEffect(() => {
    console.log('CertificatePage: certificateId =', certificateId);
    getCertificateById(certificateId)
      .then(res => {
        console.log('CertificatePage: API result =', res.data);
        setCertificate(res.data.data);
      })
      .catch((err) => {
        console.error('CertificatePage: API error', err);
        message.error('Không tìm thấy chứng chỉ!');
      })
      .finally(() => setLoading(false));
  }, [certificateId]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current);
    const link = document.createElement('a');
    link.download = 'certificate.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) return <Spin style={{ margin: 40 }} />;
  if (!certificate) return <div style={{ padding: 40, textAlign: 'center' }}>Không tìm thấy chứng chỉ</div>;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f5f5f5' }}>
      <div>
        <div ref={certRef} style={{
          width: 800,
          minHeight: 600,
          background: '#fff',
          border: '8px solid #f5b041',
          borderRadius: 16,
          padding: 40,
          boxShadow: '0 4px 32px rgba(0,0,0,0.08)',
          position: 'relative',
          margin: '0 auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2} style={{ color: '#154360', marginBottom: 0 }}>CERTIFICATE</Title>
            <div style={{ fontSize: 24, fontWeight: 600, color: '#2874a6', letterSpacing: 2 }}>OF APPRECIATION</div>
          </div>
          <div style={{ textAlign: 'center', margin: '32px 0 16px 0', fontSize: 20 }}>
            This is to certify that
          </div>
          <div style={{ textAlign: 'center', fontSize: 36, fontWeight: 700, color: '#e67e22', fontFamily: 'cursive', marginBottom: 12 }}>
            {certificate.fullName}
          </div>
          <div style={{ textAlign: 'center', fontSize: 20, marginBottom: 12 }}>
            has successfully completed the course
          </div>
          <div style={{ textAlign: 'center', fontSize: 24, color: '#2874a6', fontWeight: 600, marginBottom: 24 }}>
            {certificate.courseTitle || certificate.course?.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 40 }}>
            <div style={{ textAlign: 'left', fontSize: 16 }}>
              <div>Đà Nẵng, {new Date(certificate.issuedAt).toLocaleDateString('vi-VN')}</div>
              <div style={{ fontSize: 14, color: '#888' }}>Date</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <img src="/logo192.png" alt="seal" style={{ width: 80, borderRadius: '50%', border: '2px solid #f5b041', marginBottom: 8 }} />
              <div style={{ fontWeight: 700, color: '#f5b041', fontSize: 18 }}>F5 Learning</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 16 }}>
              <div style={{ fontFamily: 'cursive', color: '#2874a6', fontSize: 20 }}>AI Assistant</div>
              <div style={{ fontSize: 14, color: '#888' }}>Chief Executive Officer</div>
            </div>
          </div>
          <div style={{ position: 'absolute', left: 40, bottom: 40, fontSize: 12, color: '#888' }}>
            Certificate ID: <b>{certificate.certificateId}</b>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Button type="primary" onClick={handleDownload}>Tải về ảnh chứng chỉ</Button>
        </div>
      </div>
    </div>
  );
} 