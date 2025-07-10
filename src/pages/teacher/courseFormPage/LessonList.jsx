//courseFormPage/LessonList.jsx

import { List, Button, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';

export default function LessonList({ lessons, onEdit, onDelete, onReorder }) {
  const handleReorder = (newOrder) => {
    const isSameOrder = lessons.every((l, i) => l._id === newOrder[i]._id);
    if (isSameOrder) return;
    onReorder(newOrder); // Gọi hàm xử lý từ useCourseForm
  };

  return (
    <List bordered>
      <ReactSortable
        list={lessons}
        setList={handleReorder}
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
  );
}
