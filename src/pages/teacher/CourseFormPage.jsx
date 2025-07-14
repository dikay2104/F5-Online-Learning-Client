import { useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import {
  Form, Input, Button, Select, InputNumber, Typography, message,
  Card, Space, Divider, Upload, List, Modal
} from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createCourse, updateCourse, getCourseById, uploadThumbnail
} from '../../services/courseService';
import {
  getLessonsByCourse, createLesson, deleteLesson, updateLesson, reorderLessons
} from '../../services/lessonService';
import Loading from '../../components/Loading';
import { usePrompt } from '../../hooks/usePrompt';

const { Title } = Typography;
const { TextArea } = Input;

export default function CourseFormPage() {
  const [form] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [lessons, setLessons] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { courseId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  usePrompt('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang?', hasUnsavedChanges);

  const fetchCourse = async (id) => {
    try {
      setLoading(true);
      const res = await getCourseById(id, token);
      const course = res.data.data;

      form.setFieldsValue({
        ...course,
        thumbnail: course.thumbnail ? [{
          uid: '-1', name: 'thumbnail.jpg', url: course.thumbnail, status: 'done'
        }] : []
      });

      const lessonRes = await getLessonsByCourse(id);
      setLessons(lessonRes.data.data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi tải khoá học');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      setIsEdit(true);
      fetchCourse(courseId);
    }
  }, [courseId]);

  const handleDeleteLesson = async (lessonId) => {
    try {
      await deleteLesson(token, lessonId);
      setLessons(prev => prev.filter(l => l._id !== lessonId));
      setHasUnsavedChanges(true);
      message.success('Đã xoá bài học');
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Xoá bài học thất bại');
    }
  };

  const handleSave = async (status) => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const fileList = values.thumbnail;
      const file = fileList && fileList[0];
      let thumbnailUrl = '';

      if (file) {
        if (file.url) {
          thumbnailUrl = file.url;
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

      if (isEdit) {
        await updateCourse(token, courseId, courseData);
        message.success('Đã cập nhật khoá học');
      } else {
        const res = await createCourse(token, courseData);
        message.success('Đã tạo khoá học');
        setHasUnsavedChanges(false);
        setTimeout(() => navigate(`/courses/${res.data.data._id}/edit`), 0);
        return;
      }

      setHasUnsavedChanges(false);
      setTimeout(() => navigate('/my-courses'), 0);
    } catch (err) {
      if (err?.errorFields) {
        message.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
      } else {
        message.error(err?.response?.data?.message || err.message || 'Lỗi khi lưu khoá học');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddLesson = () => {
    lessonForm.resetFields();
    setEditingLessonId(null);
    setLessonModalVisible(true);
  };

  const handleEditLesson = (lessonId) => {
    const lesson = lessons.find((l) => l._id === lessonId);
    if (!lesson) return message.error('Không tìm thấy bài học');

    lessonForm.setFieldsValue(lesson);
    setEditingLessonId(lessonId);
    setLessonModalVisible(true);
  };

  const handleConfirmAddLesson = async () => {
    try {
      setLessonLoading(true);
      const values = await lessonForm.validateFields();

      if (!isEdit) {
        message.warning('Bạn cần lưu khoá học trước khi thêm bài học.');
        return;
      }

      if (editingLessonId) {
        const res = await updateLesson(token, editingLessonId, values);
        setLessons(prev => prev.map(l => l._id === editingLessonId ? res.data.data : l));
        message.success('Đã cập nhật bài học');
      } else {
        const res = await createLesson(token, { ...values, course: courseId });
        setLessons(prev => [...prev, res.data.data]);
        message.success('Đã thêm bài học');
      }

      setHasUnsavedChanges(true);
      lessonForm.resetFields();
      setEditingLessonId(null);
      setLessonModalVisible(false);
    } catch (err) {
      // form validation errors
    } finally {
      setLessonLoading(false);
    }
  };

  const handleReorderLessons = async (newOrder) => {
    //So sánh nếu không thay đổi thứ tự thì bỏ qua
    const isSameOrder = lessons.every((l , i) => l._id === newOrder[i]._id);
    if (isSameOrder) return;

    setLessons(newOrder);
    try {
      const updates = newOrder.map((lesson, index) => ({ lessonId: lesson._id, order: index }));
      await reorderLessons(token, updates);
      setHasUnsavedChanges(true);
      message.success('Đã cập nhật thứ tự bài học');
    } catch (err) {
      message.error('Lỗi khi cập nhật thứ tự bài học');
    }
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>{isEdit ? 'Chỉnh sửa' : 'Tạo'} khoá học</Title>
        <Form layout="vertical" form={form} onValuesChange={() => setHasUnsavedChanges(true)}>
          <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
          <Form.Item label="Thumbnail" name="thumbnail" valuePropName="fileList" getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}>
            <Upload name="thumbnail" listType="picture" beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Giá (VNĐ)" name="price" initialValue={0}><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item label="Trình độ" name="level">
            <Select options={[{ label: 'Cơ bản', value: 'beginner' }, { label: 'Trung cấp', value: 'intermediate' }, { label: 'Nâng cao', value: 'advanced' }]} />
          </Form.Item>
          <Form.Item label="Chuyên mục" name="category">
            <Select options={[{ label: 'Lập trình', value: 'programming' }, { label: 'Kinh doanh', value: 'business' }, { label: 'Thiết kế', value: 'design' }]} />
          </Form.Item>
        </Form>

        <Divider />

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={handleAddLesson}>+ Thêm bài học</Button>

          <List bordered>
            <ReactSortable
              list={lessons}
              setList={(newList) => handleReorderLessons(newList)} // ✅ Dùng hàm đã tạo
              tag="div"
              animation={150}
            >
              {lessons.map((l) => (
                <List.Item
                  key={l._id}
                  style={{ cursor: 'move' }}
                  actions={[
                    <Button icon={<EditOutlined />} size="small" onClick={() => handleEditLesson(l._id)} />,
                    <Button icon={<DeleteOutlined />} danger size="small" onClick={() => handleDeleteLesson(l._id)} />
                  ]}
                >
                  {l.title} ({(Number(l.videoDuration || 0) / 60).toFixed(1)} phút)
                </List.Item>
              ))}
            </ReactSortable>
          </List>
        </Space>


        <Divider />
        <Space>
          <Button type="primary" onClick={() => handleSave('pending')} loading={loading} disabled={loading}>Gửi duyệt</Button>
          <Button onClick={() => handleSave('draft')} loading={loading} disabled={loading}>Lưu nháp</Button>
        </Space>
      </Card>

      <Modal
        title={editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
        open={lessonModalVisible}
        confirmLoading={lessonLoading}
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
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
          <Form.Item name="videoUrl" label="Video URL" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="isPreviewable" label="Cho học thử?" initialValue={false}>
            <Select options={[{ label: 'Có', value: true }, { label: 'Không', value: false }]} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
