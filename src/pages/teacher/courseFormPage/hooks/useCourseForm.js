//courseFormPage/hooks/useCourseForm.js

import { useEffect, useState } from 'react';
import { message, Form } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createCourse, updateCourse, getCourseById, uploadThumbnail
} from '../../../../services/courseService';

import {
  getLessonsByCourse, createLesson, deleteLesson, updateLesson, reorderLessons
} from '../../../../services/lessonService';

import {
  getCollectionsByCourse, createCollection, deleteCollection, updateCollection, reorderCollection
} from '../../../../services/collectionService';

export function useCourseForm() {
  const [form] = Form.useForm();
  const [lessonForm] = Form.useForm();
  const [lessons, setLessons] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);
  const [collectionForm] = Form.useForm();
  const [editingCollectionId, setEditingCollectionId] = useState(null);

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
      setLoading(true);
      const res = await getCourseById(id, token);
      const course = res.data.data;

      form.setFieldsValue({
        ...course,
        thumbnail: course.thumbnail ? [{
          uid: '-1',
          name: 'thumbnail.jpg',
          url: course.thumbnail,
          status: 'done',
        }] : [],
      });

      const lessonRes = await getLessonsByCourse(id);
      setLessons(lessonRes.data.data);

      const collectionRes = await getCollectionsByCourse(id);
      setCollections(collectionRes.data.data);
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Lỗi khi tải khoá học');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (status) => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const fileList = values.thumbnail;
      const file = fileList?.[0];
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

      // Cập nhật thứ tự lessons trước khi lưu
      const updates = lessons.map((lesson, index) => ({
        lessonId: lesson._id,
        order: index,
        collection: lesson.collection,
      }));
      await reorderLessons(token, updates);

      const courseData = {
        ...values,
        thumbnail: thumbnailUrl,
        duration: lessons.reduce((sum, l) => sum + (l.videoDuration || 0), 0),
        status,
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

  const handleConfirmAddLesson = async () => {
    console.log("✅ Đã click nút OK trong modal bài học");
    try {
      setLessonLoading(true);
      const values = await lessonForm.validateFields();
      console.log("Dữ liệu từ form bài học:", values);

      if (!isEdit) {
        message.warning('Bạn cần lưu khoá học trước khi thêm bài học.');
        setLessonLoading(false);
        return;
      }

      // Tính giá trị order cho lesson mới
      const collectionId = values.collection || null;
      const collectionLessons = lessons.filter(l => l.collection === collectionId);
      const maxOrder = collectionLessons.length > 0 
        ? Math.max(...collectionLessons.map(l => l.order || 0)) + 1 
        : 0;

      const payload = {
        ...values,
        course: courseId,
        collection: collectionId,
        order: maxOrder,
      };

      if (!editingLessonId) {
        const res = await createLesson(token, payload);
        setLessons((prev) => {
          const newLessons = [...prev, res.data.data];
          console.log("Updated lessons state:", newLessons);

          // Cập nhật thứ tự lessons
          const updates = newLessons.map((lesson, index) => ({
            lessonId: lesson._id,
            order: index,
            collection: lesson.collection,
          }));
          reorderLessons(token, updates); // Gọi API để cập nhật thứ tự

          return newLessons;
        });
        message.success('Đã thêm bài học');
      }

      setHasUnsavedChanges(true);
      lessonForm.resetFields();
      setEditingLessonId(null);
      setLessonModalVisible(false);
    } catch (err) {
      console.error("❌ Lỗi validateFields:", err);
      message.error('Vui lòng điền đầy đủ thông tin bắt buộc');
    } finally {
      setLessonLoading(false);
    }
  };

  const handleReorderLessons = async (newFullList) => {
    setLessons(newFullList); // 👈 dùng toàn bộ danh sách mới

    try {
      const updates = newFullList.map((lesson) => ({
        lessonId: lesson._id,
        order: lesson.order,
        collection: lesson.collection,
      }));
      await reorderLessons(token, updates);
      setHasUnsavedChanges(true);
      message.success('Đã cập nhật thứ tự bài học');
    } catch (err) {
      message.error('Lỗi khi cập nhật thứ tự bài học');
    }
  };



  const handleAddCollection = () => {
    collectionForm.resetFields();
    setEditingCollectionId(null);
    setCollectionModalVisible(true);
  };

  const handleEditCollection = (collectionId) => {
    const collection = collections.find(c => c._id === collectionId);
    if (!collection) return message.error('Không tìm thấy collection');

    collectionForm.setFieldsValue(collection);
    setEditingCollectionId(collectionId);
    setCollectionModalVisible(true);
  };

  const handleDeleteCollection = async (collectionId) => {
    try {
      await deleteCollection(token, collectionId);
      setCollections(prev => prev.filter(c => c._id !== collectionId));
      setHasUnsavedChanges(true);
      message.success('Đã xoá collection');
    } catch (err) {
      message.error(err?.response?.data?.message || err.message || 'Xoá collection thất bại');
    }
  };

  const handleConfirmAddCollection = async () => {
    try {
      const values = await collectionForm.validateFields();

      if (!isEdit) {
        message.warning('Bạn cần lưu khoá học trước khi thêm collection.');
        return;
      }

      if (editingCollectionId) {
        const res = await updateCollection(token, editingCollectionId, values);
        setCollections(prev => prev.map(c => c._id === editingCollectionId ? res.data.data : c));
        message.success('Đã cập nhật collection');
      } else {
        const res = await createCollection(token, { ...values, course: courseId });
        setCollections(prev => [...prev, res.data.data]);
        message.success('Đã thêm collection');
      }

      setHasUnsavedChanges(true);
      collectionForm.resetFields();
      setEditingCollectionId(null);
      setCollectionModalVisible(false);
    } catch (err) {
      // lỗi validate
    }
  };

  const handleReorderCollections = async (newOrder) => {
    const isSameOrder = collections.every((c, i) => c._id === newOrder[i]._id);
    if (isSameOrder) return;

    setCollections(newOrder);
    try {
      const updates = newOrder.map((collection, index) => ({
        collectionId: collection._id,
        order: index,
      }));
      await reorderCollection(token, updates);
      setHasUnsavedChanges(true);
      message.success('Đã cập nhật thứ tự collection');
    } catch (err) {
      message.error('Lỗi khi cập nhật thứ tự collection');
    }
  };
      
  return {
    form,
    lessonForm,
    lessons,
    setLessons,
    isEdit,
    loading,
    lessonLoading,
    lessonModalVisible,
    setLessonModalVisible,
    editingLessonId,
    setEditingLessonId,
    hasUnsavedChanges,
    courseId,
    handleSave,
    handleAddLesson,
    handleEditLesson,
    handleDeleteLesson,
    handleConfirmAddLesson,
    handleReorderLessons,
    collections,
    setCollections,
    collectionForm,
    collectionModalVisible,
    setCollectionModalVisible,
    editingCollectionId,
    setEditingCollectionId,
    handleAddCollection,
    handleEditCollection,
    handleDeleteCollection,
    handleConfirmAddCollection,
    handleReorderCollections,
  };
}
