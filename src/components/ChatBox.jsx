import React, { useState } from 'react';

const API_KEY = "sk-C4wNtPDOw2GmaZMf4723A75f58Cd48139b1477CeE40f0867"; // <-- Thay bằng API key thật nếu cần
const BASE_URL = "https://api.sv2.llm.ai.vn/v1/chat/completions";
const MODEL_NAME = "openai:gpt-4.1";

function escapeJson(input) {
  return input.replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function extractMessageContent(json) {
  try {
    const obj = JSON.parse(json);
    return (
      obj?.choices?.[0]?.message?.content || '(Không tìm thấy nội dung)'
    );
  } catch (e) {
    return '(Lỗi khi phân tích nội dung)';
  }
}

const ChatBox = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Tôi là Trợ lý AI, bạn cần hỗ trợ gì?' }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;
    setError("");
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const payload = {
        model: MODEL_NAME,
        messages: [
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: input }
        ],
        max_tokens: 300
      };
      const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      if (res.status === 200) {
        const aiContent = extractMessageContent(text);
        setMessages((prev) => [...prev, { role: 'assistant', content: aiContent }]);
      } else {
        setError(`Lỗi API! Mã HTTP: ${res.status}`);
        setMessages((prev) => [...prev, { role: 'assistant', content: '(Lỗi API, vui lòng thử lại)' }]);
      }
    } catch (e) {
      setError('Lỗi khi gửi hoặc nhận dữ liệu từ AI.');
      setMessages((prev) => [...prev, { role: 'assistant', content: '(Lỗi kết nối)' }]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ width: 360, background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0001', display: 'flex', flexDirection: 'column', fontFamily: 'inherit' }}>
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
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🤖</span> Trợ lý AI
        </span>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 22, cursor: 'pointer', lineHeight: 1 }} title="Thu nhỏ">×</button>
        )}
      </div>
      {/* Chat content */}
      <div style={{ flex: 1, height: 340, overflowY: 'auto', background: '#f6f8fa', padding: 16, borderBottom: '1px solid #e3e6ea' }}>
        {messages.map((msg, idx) => (
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
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: '#888', fontStyle: 'italic', margin: '8px 0' }}>AI đang trả lời...</div>}
      </div>
      {/* Input */}
      <div style={{ padding: 12, background: '#fff', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
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
            onClick={sendMessage}
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