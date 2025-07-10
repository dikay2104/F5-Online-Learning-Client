//courseFormPage/CollectionManager.jsx

import { Collapse, Button, Modal, Form, Input, List, Select } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';
import { useEffect } from 'react';

const { Panel } = Collapse;

export default function CollectionManager({
  collections,
  setCollections,
  onAddCollection,
  onEditCollection,
  onDeleteCollection,
  onConfirmCollection,
  onCancelCollection,
  collectionForm,
  collectionModalVisible,
  collectionLoading,
  editingCollectionId,

  lessons,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onConfirmLesson,
  onCancelLesson,
  lessonForm,
  lessonModalVisible,
  lessonLoading,
  editingLessonId,
  onReorderLessons,
}) {
  const ungroupedLessons = lessons.filter(l => !l.collection);

  const groupedLessons = collections.map(collection => ({
    ...collection,
    lessons: lessons.filter(l => l.collection === collection._id),
  }));

  return (
    <>
      <Button onClick={onAddCollection} icon={<PlusOutlined />}>Thêm Collection</Button>

      <Collapse accordion style={{ marginTop: 16 }}>
        {groupedLessons.map((collection) => (
          <Panel
            key={collection._id}
            header={collection.title}
            extra={
              <>
                <Button icon={<EditOutlined />} size="small" onClick={(e) => {
                  e.stopPropagation();
                  onEditCollection(collection._id);
                }} />
                <Button icon={<DeleteOutlined />} danger size="small" onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCollection(collection._id);
                }} />
              </>
            }
          >
            <Button
              onClick={() => onAddLesson(collection._id)}
              size="small"
              style={{ marginBottom: 8 }}
            >+ Thêm bài học</Button>

            <ReactSortable
              list={collection.lessons}
              setList={(newList) => {
                const reorderedLessons = [...lessons];
                newList.forEach((l, idx) => {
                  const index = reorderedLessons.findIndex(item => item._id === l._id);
                  if (index !== -1) {
                    reorderedLessons[index] = { ...reorderedLessons[index], order: idx };
                  }
                });
                onReorderLessons(reorderedLessons);
              }}
              animation={150}
            >
              <List
                bordered
                dataSource={collection.lessons}
                renderItem={(lesson) => (
                  <List.Item
                    actions={[
                      <Button icon={<EditOutlined />} size="small" onClick={() => onEditLesson(lesson._id)} />,
                      <Button icon={<DeleteOutlined />} danger size="small" onClick={() => onDeleteLesson(lesson._id)} />,
                    ]}
                  >
                    {lesson.title}
                  </List.Item>
                )}
              />
            </ReactSortable>
          </Panel>
        ))}

        {ungroupedLessons.length > 0 && (
          <Panel key="ungrouped" header="Bài học chưa có Collection">
            <ReactSortable
              list={ungroupedLessons}
              setList={(newList) => {
                const reordered = newList.map((l, idx) => ({ ...l, order: idx, collection: null }));
                onReorderLessons([...lessons.filter(l => l.collection), ...reordered]);
              }}
              animation={150}
            >
              <List
                bordered
                dataSource={ungroupedLessons}
                renderItem={(lesson) => (
                  <List.Item
                    actions={[
                      <Button icon={<EditOutlined />} size="small" onClick={() => onEditLesson(lesson._id)} />,
                      <Button icon={<DeleteOutlined />} danger size="small" onClick={() => onDeleteLesson(lesson._id)} />,
                    ]}
                  >
                    {lesson.title}
                  </List.Item>
                )}
              />
            </ReactSortable>
          </Panel>
        )}
      </Collapse>

      {/* Modal Collection */}
      <Modal
        title={editingCollectionId ? 'Chỉnh sửa Collection' : 'Thêm Collection'}
        open={collectionModalVisible}
        confirmLoading={collectionLoading}
        onCancel={onCancelCollection}
        onOk={onConfirmCollection}
        okText={editingCollectionId ? 'Lưu' : 'Thêm'}
      >
        <Form layout="vertical" form={collectionForm}>
          <Form.Item label="Tên Collection" name="title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Lesson */}
      <Modal
        title={editingLessonId ? 'Chỉnh sửa bài học' : 'Thêm bài học'}
        open={lessonModalVisible}
        confirmLoading={lessonLoading}
        onCancel={onCancelLesson}
        onOk={onConfirmLesson}
        okText={editingLessonId ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
        okButtonProps={{
          disabled: !lessonForm.isFieldsTouched() || lessonForm.getFieldsError().some(({ errors }) => errors.length > 0),
        }}
      >
        <Form form={lessonForm} layout="vertical">
          <Form.Item name="collection" hidden rules={[{ required: false }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài học' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="videoUrl"
            label="Video URL"
            rules={[{ required: true, message: 'Vui lòng nhập URL video' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="isPreviewable"
            label="Cho học thử?"
            initialValue={false}
          >
            <Select options={[{ label: 'Có', value: true }, { label: 'Không', value: false }]} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
