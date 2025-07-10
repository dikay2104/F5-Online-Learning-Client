//courseFormPage/CourseForm.jsx

import { Form, Input, InputNumber, Select, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
const { TextArea } = Input;

export default function CourseForm({ form }) {
  return (
    <Form layout="vertical" form={form}>
      <Form.Item label="Tiêu đề" name="title" rules={[{ required: true }]}><Input /></Form.Item>
      <Form.Item label="Mô tả" name="description" rules={[{ required: true }]}><TextArea rows={3} /></Form.Item>
      <Form.Item
        label="Thumbnail" name="thumbnail"
        valuePropName="fileList"
        getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
      >
        <Upload name="thumbnail" listType="picture" beforeUpload={() => false} maxCount={1}>
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
      </Form.Item>
      <Form.Item label="Giá (VNĐ)" name="price" initialValue={0}>
        <InputNumber min={0} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="Trình độ" name="level">
        <Select options={[
          { label: 'Cơ bản', value: 'beginner' },
          { label: 'Trung cấp', value: 'intermediate' },
          { label: 'Nâng cao', value: 'advanced' }
        ]} />
      </Form.Item>
      <Form.Item label="Chuyên mục" name="category">
        <Select options={[
          { label: 'Lập trình', value: 'programming' },
          { label: 'Kinh doanh', value: 'business' },
          { label: 'Thiết kế', value: 'design' }
        ]} />
      </Form.Item>
    </Form>
  );
}
