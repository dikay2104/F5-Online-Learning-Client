import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { List, Button, Card, Spin } from 'antd';
import { getLessonsByCourse } from '../../services/lessonService';
import { getCourseById } from '../../services/courseService';

function getYoutubeEmbedUrl(url) {
  const match = url && url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function LessonLearn() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả sử lessonId là ObjectId, cần lấy courseId từ lesson hoặc truyền qua location state
    // Ở đây demo: lấy tất cả lessons của course đầu tiên có lessonId trùng
    // Thực tế bạn nên có API getLessonById trả về cả courseId
    async function fetchData() {
      setLoading(true);
      // Tìm course chứa lesson này (giả sử lessons có courseId)
      // Ở đây bạn cần chỉnh lại cho đúng API thực tế
      // Demo: lấy tất cả courses, tìm course chứa lessonId
      // Hoặc truyền courseId qua location state khi chuyển trang
      // Ở đây sẽ giả lập lấy courseId từ localStorage (bạn nên tối ưu lại)
      const courseId = localStorage.getItem('currentCourseId');
      if (!courseId) return;
      const courseRes = await getCourseById(courseId);
      setCourse(courseRes.data.data);
      const lessonsRes = await getLessonsByCourse(courseId);
      setLessons(lessonsRes.data.data);
      const found = lessonsRes.data.data.find(l => l._id === lessonId);
      setLesson(found);
      setLoading(false);
    }
    fetchData();
  }, [lessonId]);

  if (loading || !lesson) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 48 }} />;

  const currentIdx = lessons.findIndex(l => l._id === lessonId);
  const prevLesson = lessons[currentIdx - 1];
  const nextLesson = lessons[currentIdx + 1];

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Video + nội dung */}
      <div style={{ flex: 2, padding: 32, background: '#fff' }}>
        <Card style={{ marginBottom: 24 }}>
          {lesson.videoUrl && getYoutubeEmbedUrl(lesson.videoUrl) ? (
            <iframe
              width="100%"
              height="400"
              src={getYoutubeEmbedUrl(lesson.videoUrl)}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div>Không có video cho bài học này.</div>
          )}
          <h2 style={{ marginTop: 16 }}>{lesson.title}</h2>
          <div style={{ color: '#888', marginBottom: 8 }}>{lesson.description}</div>
          <div>
            <Button disabled={!prevLesson} onClick={() => prevLesson && navigate(`/student/lessons/${prevLesson._id}`)}>
              &lt; Bài trước
            </Button>
            <Button disabled={!nextLesson} style={{ marginLeft: 8 }} onClick={() => nextLesson && navigate(`/student/lessons/${nextLesson._id}`)}>
              Bài tiếp theo &gt;
            </Button>
          </div>
        </Card>
      </div>
      {/* Sidebar danh sách bài học */}
      <div style={{ flex: 1, background: '#fafafa', padding: 24, borderLeft: '1px solid #eee', overflowY: 'auto' }}>
        <h3>Nội dung khóa học</h3>
        <List
          dataSource={lessons}
          renderItem={item => (
            <List.Item
              style={{ background: item._id === lessonId ? '#e6f7ff' : undefined, cursor: 'pointer' }}
              onClick={() => navigate(`/student/lessons/${item._id}`)}
            >
              <div>
                <b>{item.title}</b>
                <div style={{ fontSize: 12, color: '#888' }}>{item.videoDuration ? Math.floor(item.videoDuration / 60) : 0} phút</div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
} 