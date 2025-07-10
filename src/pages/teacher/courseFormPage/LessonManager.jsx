// courseFormPage/LessonManager.jsx

import { List, Button, Modal, Form, Input, Select } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';

export default function LessonManager({
  lessons,
  onAdd,
  onEdit,
  onDelete,
  onReorder,
  lessonForm,
  lessonModalVisible,
  lessonLoading,
  isEditing,
  onCancel,
  onConfirm,
}) {
  return (
    <>
      <Button onClick={onAdd}>+ Thêm bài học</Button>

      <List bordered style={{ marginTop: 16 }}>
        <ReactSortable
          list={lessons}
          setList={onReorder}
          tag="div"
          animation={150}
        >
          {lessons.map((lesson) => (
            <List.Item
              key={lesson._id}
              style={{ cursor: 'move' }}
              actions={[
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={() => onEdit(lesson._id)}
                />,
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  onClick={() => onDelete(lesson._id)}
                />,
              ]}
            >
              {lesson.title} ({(Number(lesson.videoDuration || 0) / 60).toFixed(1)} phút)
            </List.Item>
          ))}
        </ReactSortable>
      </List>

      <Modal
        title={isEditing ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
        open={lessonModalVisible}
        confirmLoading={lessonLoading}
        onCancel={onCancel}
        onOk={onConfirm}
        okText={isEditing ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
      >
        <Form form={lessonForm} layout="vertical">
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
          <Form.Item
            name="videoUrl"
            label="Video URL"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="isPreviewable"
            label="Cho học thử?"
            initialValue={false}
          >
            <Select
              options={[
                { label: 'Có', value: true },
                { label: 'Không', value: false },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
