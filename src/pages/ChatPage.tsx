import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { api } from '../lib/axiosConfig';

interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  isHistory?: boolean;
}

interface ChatUser {
  id: string;
  username: string;
}

const CHAT_USERS: ChatUser[] = [
  { id: '5', username: 'solaf@ex.com' },
  { id: '7', username: 'solafabuhaifa' },
  { id: '9', username: 'solaf_clean' },
  { id: '8', username: 'sola' },
];

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

const getAvatarColor = (id: string) => {
  const colors = ['#14b8a6', '#0d9488', '#0f766e', '#115e59'];
  return colors[parseInt(id) % colors.length];
};

// const formatTime = (date: Date) =>
//   date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

const ChatPage: React.FC = () => {
  const { authUser } = useAuth();
  const [wsToken, setWsToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedUser, setSelectedUser] = useState<ChatUser>(CHAT_USERS[0]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myId = String(authUser?.id || '');

  useEffect(() => {
  api.post<{ access: string }>('/auth/token/refresh/')
    .then(() => {
     
      api.get<{ token: string }>('/ws-token/')
        .then((res) => {
          console.log("Token received ✅:", res.data.token);
          setWsToken(res.data.token);
        });
    })
    .catch(() => {
      api.get<{ token: string }>('/ws-token/')
        .then((res) => {
          console.log("Token received ✅:", res.data.token);
          setWsToken(res.data.token);
        })
        .catch((err) => console.error('Failed to get WS token:', err));
    });
}, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!myId || !wsToken) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    setMessages([]);
    setConnectionStatus('connecting');

    const roomName = [myId, selectedUser.id].sort().join('_');
    const BASE_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const socket = new WebSocket(`${BASE_WS_URL}/ws/chat/${roomName}/?token=${wsToken}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Connected! ✅");
      setConnectionStatus('open');
    };

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.error) {
        setConnectionStatus('closed');
        return;
      }
      if (data.type === 'typing') {
        if (data.sender !== myId) {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
        }
        return;
      }
      if (!data.is_history && data.sender === myId) return;

      setIsTyping(false);
      setMessages(prev => [...prev, {
        sender: data.sender,
        message: data.message,
        timestamp: new Date(),
        isHistory: data.is_history,
      }]);
    };

    socket.onerror = (err) => {
      console.error('WebSocket Error ❌:', err);
      setConnectionStatus('closed');
    };

    socket.onclose = () => setConnectionStatus('closed');

    return () => socket.close();
  }, [selectedUser, myId, wsToken]);

  const sendMessage = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && input.trim()) {
      const messageText = input.trim();
      setMessages(prev => [...prev, { sender: myId, message: messageText, timestamp: new Date() }]);
      socketRef.current.send(JSON.stringify({
        message: messageText,
        sender: myId,
        recipient: selectedUser.id,
      }));
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'typing', sender: myId }));
    }
  };

  const groupedMessages = messages.reduce((groups: { date: string; messages: ChatMessage[] }[], msg) => {
    const dateStr = formatDate(msg.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.date === dateStr) last.messages.push(msg);
    else groups.push({ date: dateStr, messages: [msg] });
    return groups;
  }, []);

  const otherUsers = CHAT_USERS.filter(u => u.id !== myId);

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', background: 'linear-gradient(to top right, #14b8a6, #bfdbfe)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: 'white' }}>EcoLens</div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>Messages</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {otherUsers.map(user => (
            <div key={user.id} onClick={() => setSelectedUser(user)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '16px', cursor: 'pointer', marginBottom: '4px', backgroundColor: selectedUser.id === user.id ? 'rgba(255,255,255,0.25)' : 'transparent', transition: 'all 0.2s ease' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '700', color: 'white', flexShrink: 0, border: '1.5px solid rgba(255,255,255,0.4)' }}>{getInitials(user.username)}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: getAvatarColor(selectedUser.id), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700', color: 'white' }}>{getInitials(selectedUser.username)}</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{selectedUser.username}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: connectionStatus === 'open' ? '#22c55e' : '#9ca3af' }} /><span style={{ fontSize: '12px', color: '#64748b' }}>{connectionStatus === 'open' ? 'Online' : 'Offline'}</span></div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {groupedMessages.map((group, gi) => (
            <div key={gi}>
              <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '11px', color: '#94a3b8', fontWeight: '700' }}>{group.date}</div>
              {group.messages.map((msg, mi) => {
                const isMe = msg.sender === myId;
                return (
                  <div key={mi} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '10px', marginBottom: '4px' }}>
                    <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: isMe ? 'linear-gradient(to right, #14b8a6, #0d9488)' : 'white', color: isMe ? 'white' : '#1e293b', fontSize: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{msg.message}</div>
                  </div>
                );
              })}
            </div>
          ))}
          {isTyping && (
            <div style={{ padding: '4px 12px', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
              {selectedUser.username} is typing...
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '20px 24px', backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={connectionStatus === 'open' ? "Type a message..." : "Connecting..."} disabled={connectionStatus !== 'open'} style={{ flex: 1, padding: '14px 20px', borderRadius: '28px', border: '2px solid #f1f5f9', outline: 'none' }} />
          <button onClick={sendMessage} disabled={connectionStatus !== 'open' || !input.trim()} title="Send Message" aria-label="Send Message" style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: connectionStatus === 'open' && input.trim() ? '#14b8a6' : '#e2e8f0', color: 'white', cursor: 'pointer' }}>➔</button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;