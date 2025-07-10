//courseFormPage/LessonModal.jsx

import { Modal, Form, Input, Select } from 'antd';

export default function LessonModal({ form, visible, loading, isEdit, onCancel, onOk }) {
  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
      open={visible}
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={onOk}
      okText={isEdit ? 'Lưu' : 'Thêm'}
      cancelText="Huỷ"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="description" label="Mô tả"><Input /></Form.Item>
        <Form.Item name="videoUrl" label="Video URL" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="isPreviewable" label="Cho học thử?" initialValue={false}>
          <Select options={[{ label: 'Có', value: true }, { label: 'Không', value: false }]} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
