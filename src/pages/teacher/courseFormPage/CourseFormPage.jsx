//courseFormPage/CourseFormPage.jsx

import { useEffect, useState } from 'react';
import { Typography, Card, Divider, Space, Button } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import CourseForm from './CourseForm';
import CollectionManager from './CollectionManager';
import { useCourseForm } from './hooks/useCourseForm.js';
import { usePrompt } from '../../../hooks/usePrompt';
import Loading from '../../../components/Loading';

const { Title } = Typography;

export default function CourseFormPage() {
  const {
    form, lessonForm, lessons, setLessons, isEdit, loading, lessonLoading,
    lessonModalVisible, editingLessonId, hasUnsavedChanges, courseId,
    handleAddLesson, handleEditLesson, handleDeleteLesson,
    handleSave, handleConfirmAddLesson, setLessonModalVisible, setEditingLessonId, handleReorderLessons,

    collections, setCollections,
    collectionForm, collectionModalVisible, collectionLoading, editingCollectionId,
    handleAddCollection, handleEditCollection, handleDeleteCollection, handleConfirmAddCollection, setCollectionModalVisible, setEditingCollectionId, handleReorderCollections,
  } = useCourseForm();

  usePrompt('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi trang?', hasUnsavedChanges);

  if (loading) return <Loading />;

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>{isEdit ? 'Chỉnh sửa' : 'Tạo'} khoá học</Title>

        <CourseForm form={form} setHasUnsavedChanges={() => {}} />

        <Divider />
        <Space direction="vertical" style={{ width: '100%' }}>
          <CollectionManager
            collections={collections}
            setCollections={setCollections}
            onAddCollection={handleAddCollection}
            onEditCollection={handleEditCollection}
            onDeleteCollection={handleDeleteCollection}
            onConfirmCollection={handleConfirmAddCollection}
            onCancelCollection={() => {
              collectionForm.resetFields();
              setEditingCollectionId(null);
              setCollectionModalVisible(false);
            }}
            collectionForm={collectionForm}
            collectionModalVisible={collectionModalVisible}
            collectionLoading={collectionLoading}
            editingCollectionId={editingCollectionId}

            lessons={lessons}
            onAddLesson={(collectionId) => {
              setLessonModalVisible(true);
              setEditingLessonId(null);
              lessonForm.setFieldsValue({
                collection: collectionId,
                title: '',
                videoUrl: '',
                description: '',
                isPreviewable: false,
              });
            }}
            onEditLesson={handleEditLesson}
            onDeleteLesson={handleDeleteLesson}
            onConfirmLesson={handleConfirmAddLesson}
            onCancelLesson={() => {
              lessonForm.resetFields();
              setEditingLessonId(null);
              setLessonModalVisible(false);
            }}
            lessonForm={lessonForm}
            lessonModalVisible={lessonModalVisible}
            lessonLoading={lessonLoading}
            editingLessonId={editingLessonId}
            onReorderLessons={handleReorderLessons}
          />
        </Space>

        <Divider />
        <Space>
          <Button type="primary" onClick={() => handleSave('pending')}>Gửi duyệt</Button>
          <Button onClick={() => handleSave('draft')}>Lưu nháp</Button>
        </Space>
      </Card>
    </div>
  );
}
