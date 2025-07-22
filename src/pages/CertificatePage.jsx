import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getCertificateById } from '../services/certificateService';
import { Card, Spin, Button, Typography, message, Input, Modal } from 'antd';
import html2canvas from 'html2canvas';
import { editCertificateName } from '../services/certificateService';

const { Title } = Typography;

export default function CertificatePage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const certRef = useRef();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEditName = async () => {
    setEditLoading(true);
    try {
      const res = await editCertificateName(certificate.certificateId, newName);
      setCertificate(res.data.data);
      setEditModalOpen(false);
      message.success('Đã đổi tên trên chứng chỉ thành công!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Đổi tên thất bại!');
    } finally {
      setEditLoading(false);
    }
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
        <div style={{ textAlign: 'center', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Button type="primary" onClick={handleDownload}>Tải về ảnh chứng chỉ</Button>
          {certificate.allowEditName && (
            <Button onClick={() => { setNewName(certificate.fullName || ''); setEditModalOpen(true); }}>
              Sửa tên trên chứng chỉ
            </Button>
          )}
          <Button
            style={{ background: "#1877f3", color: "#fff", border: "none" }}
            onClick={() => {
              const shareUrl = window.location.href;
              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                "_blank",
                "width=600,height=400"
              );
            }}
          >
            Chia sẻ lên Facebook
          </Button>
        </div>
        <Modal
          open={editModalOpen}
          onCancel={() => setEditModalOpen(false)}
          onOk={handleEditName}
          confirmLoading={editLoading}
          title="Chỉnh sửa tên trên chứng chỉ"
          okText="Lưu"
          cancelText="Hủy"
        >
          <Input value={newName} onChange={e => setNewName(e.target.value)} maxLength={50} />
          <div style={{ marginTop: 8, color: '#888', fontSize: 13 }}>
            * Bạn chỉ được đổi tên trên chứng chỉ <b>1 lần duy nhất</b>. Hãy nhập đúng họ tên thật để nhận chứng chỉ hợp lệ.
          </div>
        </Modal>
      </div>
    </div>
  );
} 