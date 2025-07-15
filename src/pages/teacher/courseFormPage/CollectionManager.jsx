// phần import đầu file
import { Collapse, Button, Modal, Form, Input, List, Select, Row, Col, Typography, Divider, Space, Upload, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';
import { useEffect, useState } from 'react';
import { uploadVideo } from '../../../services/lessonService';

const { Text } = Typography;
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
  const [canSubmitLesson, setCanSubmitLesson] = useState(false);
  const [uploading, setUploading] = useState(false);

  const ungroupedLessons = lessons.filter(l => !l.collection);
  const groupedLessons = collections.map(collection => ({
    ...collection,
    lessons: lessons.filter(l => l.collection === collection._id),
  }));

  const handleUploadVideo = async (file) => {
    try {
      setUploading(true);

      const token = localStorage.getItem("token"); // nếu bạn dùng token từ local
      const res = await uploadVideo(token, file);
      const url = res.data.url;

      lessonForm.setFieldValue('videoUrl', url);
      setCanSubmitLesson(true);
      message.success('Đã upload video lên Cloudinary');
    } catch (err) {
      console.error(err);
      message.error('Lỗi khi upload video');
    } finally {
      setUploading(false);
    }
  };


  return (
    <>
      <Button onClick={onAddCollection} icon={<PlusOutlined />}>Thêm Collection</Button>

      <Collapse accordion style={{ marginTop: 16 }}>
        {groupedLessons.map((collection) => (
          <Panel
            key={collection._id}
            header={
              <Space size="small">
                <Text strong>{collection.title}</Text>
                {collection.duration != null && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {collection.duration} phút
                  </Text>
                )}
              </Space>
            }
            extra={
              <Space split={<Divider type="vertical" />} size={0}>
                <Button
                  icon={<EditOutlined />}
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditCollection(collection._id);
                  }}
                />
                <Button
                  icon={<DeleteOutlined />}
                  danger
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCollection(collection._id);
                  }}
                />
              </Space>
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
                    <div style={{ width: '100%' }}>
                      <Space size="small" wrap>
                        <Text strong>{lesson.title}</Text>
                        {lesson.videoDuration != null && (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            {Math.floor(lesson.videoDuration / 60)}:
                            {(lesson.videoDuration % 60).toString().padStart(2, '0')} phút
                          </Text>
                        )}
                        {lesson.isPreviewable && (
                          <Text type="success" style={{ fontSize: 12 }}>[Học thử]</Text>
                        )}
                      </Space>
                    </div>
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
        onCancel={() => {
          setCanSubmitLesson(false);
          onCancelLesson();
        }}
        onOk={onConfirmLesson}
        okText={editingLessonId ? 'Lưu' : 'Thêm'}
        cancelText="Huỷ"
        okButtonProps={{ disabled: !canSubmitLesson }}
        forceRender
      >
        <Form
          form={lessonForm}
          layout="vertical"
          onValuesChange={(changedValues, allValues) => {
            const url = changedValues.videoUrl || allValues.videoUrl;
            if (url && (url.includes('youtube.com') || url.includes('res.cloudinary.com'))) {
              setCanSubmitLesson(true);
            }
          }}
        >
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
          <Form.Item name="description" label="Mô tả">
            <Input />
          </Form.Item>
          <Form.Item
            name="videoUrl"
            label="Video URL"
            rules={[{ required: true, message: 'Vui lòng nhập URL video' }]}
          >
            <Input />
          </Form.Item>

          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              handleUploadVideo(file);
              return false; // để không upload tự động
            }}
          >
            <Button icon={<UploadOutlined />} loading={uploading}>
              Tải video lên
            </Button>
          </Upload>

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
