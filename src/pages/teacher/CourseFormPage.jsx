import { useEffect, useState } from 'react';
import {
  Form, Input, Button, Select, InputNumber, Typography, message,
  Card, Space, Divider, Upload, List, Modal
} from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { createCourse, updateCourse, getCourseById, uploadThumbnail } from '../../services/courseService';
import { getLessonsByCourse, createLesson, deleteLesson, updateLesson } from '../../services/lessonService';

const { Title } = Typography;
const { TextArea } = Input;

export default function CourseFormPage() {
  const [form] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [lessons, setLessons] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (courseId) {
      setIsEdit(true);
      fetchCourse(courseId);
    }
  }, [courseId]);

  const fetchCourse = async (id) => {
    try {
      const res = await getCourseById(id, token);
      const course = res.data.data;

      form.setFieldsValue({
        ...course,
        thumbnail: course.thumbnail ? [{
          uid: '-1',
          name: 'thumbnail.jpg',
          url: course.thumbnail,
          status: 'done'
        }] : []
      });

      const lessonRes = await getLessonsByCourse(id);
      setLessons(lessonRes.data.data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi tải khoá học');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(token, lessonId);
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      message.success('Đã xoá bài học');
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Xoá bài học thất bại');
    }
  };

  const handleSave = async (status) => {
    try {
      const values = await form.validateFields();
      const fileList = values.thumbnail;
      const file = fileList && fileList[0];

      let thumbnailUrl = '';
      if (file) {
        if (file.url) {
          thumbnailUrl = file.url; // đã upload từ trước
        } else if (file.originFileObj) {
          const uploadRes = await uploadThumbnail(token, file.originFileObj);
          thumbnailUrl = uploadRes.data.url;
        }
      }

      if (status === 'pending' && lessons.length === 0) {
        message.error('Khoá học cần ít nhất 1 bài học để gửi duyệt.');
        return;
      }

      const courseData = {
        ...values,
        thumbnail: thumbnailUrl,
        duration: lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0),
        status
      };

      setLoading(true);
      if (isEdit) {
        await updateCourse(token, courseId, courseData);
        message.success('Đã cập nhật khoá học');
      } else {
        const res = await createCourse(token, courseData);
        message.success('Đã tạo khoá học');
        navigate(`/courses/${res.data.data._id}/edit`);
        return;
      }
      navigate('/my-courses');
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi lưu khoá học');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    lessonForm.resetFields();
    setEditingLessonId(null);
    setLessonModalVisible(true);
  };

  const handleEditLesson = async (lessonId) => {
    try {
      const lesson = lessons.find((l) => l._id === lessonId);
      if (!lesson) return message.error('Không tìm thấy bài học');

      lessonForm.setFieldsValue({
        title: lesson.title,
        description: lesson.description,
        videoUrl: lesson.videoUrl,
        isPreviewable: lesson.isPreviewable,
      });
      setEditingLessonId(lessonId);
      setLessonModalVisible(true);
    } catch (err) {
      message.error('Lỗi khi tải bài học');
    }
  };

  const handleConfirmAddLesson = async () => {
    try {
      const values = await lessonForm.validateFields();

      if (!isEdit) {
        message.warning('Bạn cần lưu khoá học trước khi thêm bài học.');
        return;
      }

      if (editingLessonId) {
        const res = await updateLesson(token, editingLessonId, values);
        setLessons(prev => prev.map(l => (l._id === editingLessonId ? res.data.data : l)));
        message.success('Đã cập nhật bài học');
      } else {
        const res = await createLesson(token, {
          ...values,
          course: courseId,
        });
        setLessons(prev => [...prev, res.data.data]);
        message.success('Đã thêm bài học');
      }

      lessonForm.resetFields();
      setEditingLessonId(null);
      setLessonModalVisible(false);
    } catch (err) {
      // AntD sẽ hiển thị lỗi dưới form
    }
  };

  console.log('Lessons:', lessons);

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>{isEdit ? 'Chỉnh sửa' : 'Tạo'} khoá học</Title>
        <Form layout="vertical" form={form}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
          <Form.Item label="Thumbnail" name="thumbnail" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
            <Upload name="thumbnail" listType="picture" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Giá (VNĐ)" name="price" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Trình độ" name="level"><Select options={[{ label: 'Cơ bản', value: 'beginner' }, { label: 'Trung cấp', value: 'intermediate' }, { label: 'Nâng cao', value: 'advanced' }]} /></Form.Item>
          <Form.Item label="Chuyên mục" name="category"><Select options={[{ label: 'Lập trình', value: 'programming' }, { label: 'Kinh doanh', value: 'business' }, { label: 'Thiết kế', value: 'design' }]} /></Form.Item>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleAddLesson}>+ Thêm bài học</Button>
          <List
            bordered
            dataSource={lessons}
            renderItem={(l) => (
              <List.Item
                actions={[
                  <Button icon={<EditOutlined />} size="small" onClick={() => handleEditLesson(l._id)} />,
                  <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDeleteLesson(l._id)} />
                ]}
              >
                {l.title} ({(Number(l.videoDuration || 0) / 60).toFixed(1)} phút)
              </List.Item>
            )}
          />
        </Space>

        <Divider />
        <Space>
          <Button type="primary" onClick={() => handleSave('pending')} loading={loading}>Gửi duyệt</Button>
          <Button onClick={() => handleSave('draft')} loading={loading}>Lưu nháp</Button>
        </Space>
      </Card>

      <Modal
        title={editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
        open={lessonModalVisible}
        onCancel={() => {
          lessonForm.resetFields();
          setEditingLessonId(null);
          setLessonModalVisible(false);
        }}
        onOk={handleConfirmAddLesson}
        okText={editingLessonId ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
      >
        <Form form={lessonForm} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Please enter Tiêu đề' }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="videoUrl" label="Video URL" rules={[{ required: true, message: 'Please enter Video URL' }]}><Input /></Form.Item>
          <Form.Item name="isPreviewable" label="Cho học thử?" initialValue={false}><Select options={[{ label: 'Có', value: true }, { label: 'Không', value: false }]} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
}