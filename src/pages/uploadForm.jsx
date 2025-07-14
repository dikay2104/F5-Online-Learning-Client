import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Button, message, Spin, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import FocusTrap from 'focus-trap-react';

const { Paragraph, Link } = Typography;

export default function UploadForm() {
  const [video, setVideo] = useState(null);
  const [driveLink, setDriveLink] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileSelect = (info) => {
    const file = info.fileList[0]?.originFileObj;

    if (!file) {
      setVideo(null);
      return;
    }

    const isVideoExtension = /\.(mp4|avi|mov|wmv|mkv)$/i.test(file.name || '');
    if (!isVideoExtension) {
      message.error('Chỉ hỗ trợ file video (.mp4, .avi, .mov, ...)');
      return;
    }

    setVideo(file);
  };

  const extractFileId = (link) => {
    const match = link.match(/\/file\/d\/([^/]+)\//);
    return match ? match[1] : null;
  };

  const handleUpload = async () => {
    if (!video) {
      message.warning('Vui lòng chọn video trước khi upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);

    try {
      setLoading(true);
      setShowPreview(false);
      const res = await axios.post('http://localhost:3001/api/drive/upload', formData);
      const previewLink = res.data.link;
      const fileId = extractFileId(previewLink);

      if (!fileId) throw new Error('Không trích xuất được fileId từ đường dẫn');

      setDriveLink(`https://drive.google.com/file/d/${fileId}/preview`);
      setDownloadLink(`https://drive.google.com/uc?id=${fileId}&export=download`);
      message.success('Tải lên thành công!');

      setTimeout(() => {
        setShowPreview(true);
      }, 10000); // 10 giây
    } catch (err) {
      console.error(err);
      message.error('Tải lên thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FocusTrap active={loading}>
      <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
        <h2>Upload Video lên Google Drive</h2>

        <Upload
          beforeUpload={() => false}
          onChange={handleFileSelect}
          maxCount={1}
          accept="video/*"
          showUploadList={{ showRemoveIcon: true }}
        >
          <Button icon={<UploadOutlined />}>Chọn video</Button>
        </Upload>

        <Button
          type="primary"
          onClick={handleUpload}
          disabled={!video || loading}
          loading={loading}
          style={{ marginTop: '1rem' }}
        >
          Tải lên
        </Button>

        {driveLink && (
          <div style={{ marginTop: '2rem' }}>
            <Paragraph>
              ✅ Tải video về: <Link href={downloadLink} target="_blank" rel="noopener">Nhấn vào đây</Link>
            </Paragraph>

            {showPreview && !loading ? (
              <>
                <h3>Xem trước video (có thể mất vài giây để hiển thị):</h3>
                <iframe
                  title="Google Drive Video"
                  src={driveLink}
                  width="100%"
                  height="400"
                  allow="autoplay"
                  frameBorder="0"
                  allowFullScreen
                />
              </>
            ) : (
              <Spin tip="Đang xử lý video... Vui lòng đợi trong giây lát." />
            )}
          </div>
        )}
      </div>
    </FocusTrap>
  );
}