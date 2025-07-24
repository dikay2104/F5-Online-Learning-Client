import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

function escapeJson(input) {
  return input.replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

const CHATBOX_HEIGHT = 480; // Chiều cao cố định cho toàn bộ chat box
const CHAT_HISTORY_KEY = 'ai_chat_history';

// Câu hỏi mẫu
const QUICK_QUESTIONS = [
  'Có những khóa học nào nổi bật?',
  'Tôi nên học gì để bắt đầu lập trình?',
  'Khóa học nào phù hợp cho người mới?',
];

const GREETING = {
  role: 'assistant',
  content: 'Xin chào! Tôi là Trợ lý AI của F5-Online-Learning, bạn cần hỗ trợ gì về học tập, khóa học, kỹ năng hay hệ thống?'
};

// Hàm chuyển đổi link trong text thành thẻ <a>
function renderWithLinks(text) {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', wordBreak: 'break-all' }}>{part}</a>;
    }
    return part;
  });
}

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastCourses, setLastCourses] = useState([]); // Lưu courses recommend cuối cùng

  // Khôi phục lịch sử chat khi load lại trang
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_HISTORY_KEY);
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr) && arr.length > 0) {
          setMessages(arr);
        } else {
          setMessages([GREETING]);
        }
      } catch {
        setMessages([GREETING]);
      }
    } else {
      setMessages([GREETING]);
    }
  }, []);

  // Lưu lịch sử chat mỗi khi messages thay đổi
  useEffect(() => {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  }, [messages]);

  // Gửi tin nhắn (dùng cho cả nhập tay và quick question)
  const sendMessage = async (customInput) => {
    const messageToSend = typeof customInput === 'string' ? customInput : input;
    if (!messageToSend.trim()) return;
    setError("");
    const userMsg = { role: 'user', content: messageToSend };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput("");
    try {
      const res = await fetch(`${API_URL}/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });
      const data = await res.json();
      if (res.status === 200 && data.answer) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.answer }]);
        setLastCourses(Array.isArray(data.courses) ? data.courses : []);
      } else {
        setError(data.message || 'Lỗi API!');
        setMessages((prev) => [...prev, { role: 'assistant', content: '(Lỗi API, vui lòng thử lại)' }]);
        setLastCourses([]);
      }
    } catch (e) {
      setError('Lỗi khi gửi hoặc nhận dữ liệu từ AI.');
      setMessages((prev) => [...prev, { role: 'assistant', content: '(Lỗi kết nối)' }]);
      setLastCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Phân tách lời chào và các tin nhắn còn lại
  const greetingMsg = messages[0]?.role === 'assistant' ? messages[0] : GREETING;
  const restMsgs = messages.slice(1);

  return (
    <div style={{
      width: 360,
      height: CHATBOX_HEIGHT,
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px #0001',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'inherit',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: '#0d6efd',
        color: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontWeight: 600,
        fontSize: 18,
        letterSpacing: 0.5,
        flexShrink: 0,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🤖</span> Trợ lý AI
        </span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }} title="Thu nhỏ">×</button>
        )}
      </div>
      {/* Chat content */}
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        background: '#f6f8fa',
        padding: 16,
        borderBottom: '1px solid #e3e6ea',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Lời chào ở đầu */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          margin: '8px 0',
        }}>
          <span style={{
            background: '#e9ecef',
            color: '#222',
            borderRadius: '16px 16px 16px 4px',
            padding: '10px 14px',
            maxWidth: '75%',
            fontSize: 15,
            boxShadow: '0 2px 8px #aaa2',
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
          }}>
            {renderWithLinks(greetingMsg.content)}
          </span>
        </div>
        {/* Quick Questions sau lời chào */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(q)}
              disabled={loading}
              style={{
                background: '#e9ecef',
                color: '#0d6efd',
                border: 'none',
                borderRadius: 16,
                padding: '4px 12px',
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 4,
                transition: 'background 0.2s',
              }}
            >
              {q}
            </button>
          ))}
        </div>
        {/* Tin nhắn chat còn lại */}
        {restMsgs.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            margin: '8px 0',
          }}>
            <span style={{
              background: msg.role === 'user' ? '#0d6efd' : '#e9ecef',
              color: msg.role === 'user' ? '#fff' : '#222',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              padding: '10px 14px',
              maxWidth: '75%',
              fontSize: 15,
              boxShadow: msg.role === 'user' ? '0 2px 8px #0d6efd22' : '0 2px 8px #aaa2',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
            }}>
              {msg.role === 'assistant' ? renderWithLinks(msg.content) : msg.content}
            </span>
          </div>
        ))}
        {/* Hiển thị link recommend khóa học nếu có */}
        {lastCourses.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: '#0d6efd' }}>Khóa học gợi ý:</div>
            {lastCourses.map((c, i) => (
              <div key={c._id} style={{ marginBottom: 6 }}>
                <a href={`https://f5-online-learning-client.vercel.app/courses/${c._id}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0d6efd', fontWeight: 500, textDecoration: 'underline', fontSize: 15 }}>
                  {c.title}
                </a>
                <div style={{ color: '#555', fontSize: 13 }}>{c.description}</div>
              </div>
            ))}
          </div>
        )}
        {loading && <div style={{ color: '#888', fontStyle: 'italic', margin: '8px 0' }}>AI đang trả lời...</div>}
      </div>
      {/* Input */}
      <div style={{
        padding: 12,
        background: '#fff',
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Nhập tin nhắn..."
            style={{
              flex: 1,
              borderRadius: 8,
              padding: '10px 12px',
              border: '1px solid #d0d7de',
              resize: 'none',
              fontSize: 15,
              outline: 'none',
              background: '#f8fafc',
              color: '#222',
              boxShadow: 'none',
              transition: 'border 0.2s',
            }}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            style={{
              borderRadius: 8,
              background: '#0d6efd',
              color: '#fff',
              border: 'none',
              fontWeight: 'bold',
              fontSize: 16,
              padding: '0 18px',
              cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px #0d6efd22',
              transition: 'background 0.2s',
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Gửi"
          >
            ➤
          </button>
        </div>
        {error && <div style={{ color: 'red', marginTop: 8, fontSize: 14 }}>{error}</div>}
      </div>
    </div>
  );
};

export default ChatBox; 