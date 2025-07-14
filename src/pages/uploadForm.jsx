import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Button, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export default function UploadForm() {
  const [video, setVideo] = useState(null);
  const [driveLink, setDriveLink] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleUpload = async () => {
    if (!video) {
      message.warning('Vui lòng chọn video trước khi upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', video);

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3001/api/drive/upload', formData);
      console.log(res.data.link);
      setDriveLink(res.data.link);
      message.success('Tải lên thành công!');
    } catch (err) {
      console.error(err);
      message.error('Tải lên thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h2>Upload Video lên Google Drive</h2>

      <Upload
        beforeUpload={() => false} // Chặn upload tự động
        onChange={handleFileSelect} // Lấy file thủ công
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
          <h3>Video đã upload:</h3>
          <iframe
            title="Google Drive Video"
            src={'https://drive.google.com/file/d/1DWLxR63eTBjSSenrk5xV-_XAalVNgg5W/view'}
            width="100%"
            height="400"
            allow="autoplay"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
