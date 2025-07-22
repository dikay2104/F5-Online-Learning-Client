import React, { useEffect, useState } from 'react';
import { Card, Button, Spin, Typography, Radio, Form, message, Select, Tag } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const API = process.env.REACT_APP_API_BASE_URL + '/quizzes';

export default function QuizPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách quiz
  useEffect(() => {
    setLoading(true);
    axios.get(API)
      .then(res => setQuizzes(res.data.data || []))
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, []);

  // Lấy chi tiết quiz khi chọn
  useEffect(() => {
    if (selectedQuizId) {
      setLoading(true);
      axios.get(`${API}/${selectedQuizId}`)
        .then(res => {
          setQuiz(res.data.data);
          setAnswers(Array((res.data.data?.questions?.length || 0)).fill(null));
          setResult(null);
        })
        .catch(() => setQuiz(null))
        .finally(() => setLoading(false));
    } else {
      setQuiz(null);
      setAnswers([]);
      setResult(null);
    }
  }, [selectedQuizId]);

  const handleSubmit = () => {
    if (!quiz) return;
    axios.post(`${API}/${quiz._id}/submit`, { answers })
      .then(res => setResult(res.data.data))
      .catch(() => message.error('Nộp bài thất bại!'));
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto' }}>
      <Card style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
        <Title level={3}>Làm bài tập Quiz (Demo kiểu Coursera)</Title>
        {loading && <Spin />}
        <div style={{ marginBottom: 16 }}>
          <b>Chọn bài Quiz:</b>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            placeholder="Chọn bài quiz để bắt đầu"
            value={selectedQuizId}
            onChange={setSelectedQuizId}
            allowClear
          >
            {quizzes.map(q => (
              <Select.Option key={q._id} value={q._id}>{q.title}</Select.Option>
            ))}
          </Select>
        </div>
        {quiz && (
          <div>
            <Title level={4}>{quiz.title}</Title>
            <div style={{ marginBottom: 16 }}>{quiz.description}</div>
            <Form layout="vertical" onFinish={handleSubmit}>
              {quiz.questions.map((q, idx) => (
                <Form.Item
                  key={idx}
                  label={<b>{`Câu ${idx + 1}: ${q.question}`}</b>}
                  required
                >
                  <Radio.Group
                    value={answers[idx]}
                    onChange={e => {
                      const arr = [...answers];
                      arr[idx] = e.target.value;
                      setAnswers(arr);
                    }}
                    disabled={!!result}
                  >
                    {q.options.map((opt, oidx) => {
                      let color = undefined;
                      let icon = null;
                      if (result) {
                        const detail = result.detail[idx];
                        if (oidx === detail.correctAnswer) {
                          color = 'green';
                          icon = <span style={{ color: 'green', fontWeight: 600 }}>✔</span>;
                        }
                        if (oidx === answers[idx] && oidx !== detail.correctAnswer) {
                          color = 'red';
                          icon = <span style={{ color: 'red', fontWeight: 600 }}>✘</span>;
                        }
                      }
                      return (
                        <Radio key={oidx} value={oidx} style={{ color }}>
                          {icon} {opt}
                        </Radio>
                      );
                    })}
                  </Radio.Group>
                  {result && (
                    <div style={{ marginTop: 4 }}>
                      {result.detail[idx].isCorrect ? (
                        <Tag color="green">Đúng</Tag>
                      ) : (
                        <Tag color="red">Sai</Tag>
                      )}
                      <span style={{ marginLeft: 8, color: '#888' }}>
                        Đáp án đúng: <b>{q.options[result.detail[idx].correctAnswer]}</b>
                      </span>
                    </div>
                  )}
                </Form.Item>
              ))}
              {result ? (
                <div style={{ marginTop: 16 }}>
                  <b>Kết quả: {result.correct}/{result.total} đúng</b><br/>
                  <b>Điểm: {result.score} / 100</b>
                </div>
              ) : (
                <Button type="primary" htmlType="submit" disabled={answers.some(a => a === null)}>
                  Nộp bài
                </Button>
              )}
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
} 