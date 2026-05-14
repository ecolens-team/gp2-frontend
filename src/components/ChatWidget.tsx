import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types/chat';
import { MessageCircleMore, X } from 'lucide-react';
import './ChatWidget.css';
import { useAuth } from '../contexts/AuthContext/AuthContext';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'open' | 'closed'
  >('closed');
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('access');
  const generateRoomName = (id1: string, id2: string) => {
    return [id1, id2].sort().join('_');
  };

  //    const getCsrfToken = () => {
  // return document.cookie
  //     .split('; ')
  //     .find(row => row.startsWith('csrftoken='))
  //     ?.split('=')[1];
  //        };
  const { authUser } = useAuth();
  const myId = String(authUser?.id);
  const otherId = '1';
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !socketRef.current) {
      const roomName = generateRoomName(myId, otherId);

      const BASE_WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
      // const wsUrl = `${BASE_WS_URL}/ws/chat/${roomName}/`;

      const socket = new WebSocket(
        `${BASE_WS_URL}/ws/chat/${roomName}/?token=${token}`,
      );
      socket.onopen = () => {
        setConnectionStatus('open');
      };

      socket.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        setMessages((prev) => [
          ...prev,
          { sender: data.sender, message: data.message },
        ]);
      };

      socket.onerror = (err) => {
        console.error('WebSocket error:', err);
        setConnectionStatus('closed');
      };

      socket.onclose = () => {
        socketRef.current = null;
        setConnectionStatus('closed');
      };
    }

    return () => {
      if (!isOpen && socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setConnectionStatus('closed');
      }
    };
  }, [isOpen]);

  const sendMessage = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      input.trim()
    ) {
      const messageData = {
        message: input,
        sender: myId,
        recipient: otherId,
      };
      socketRef.current.send(JSON.stringify(messageData));
      setInput('');
    }
  };
  return (
    <div
      style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: '#008080',
          color: 'white',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircleMore size={28} />}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            right: '0',
            width: '320px',
            height: '400px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: '#008080',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            EcoLens Chat
          </div>

          <div
            style={{
              flex: 1,
              padding: '10px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.sender === myId ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.sender === myId ? '#008080' : '#f0f0f0',
                  color: msg.sender === myId ? 'white' : 'black',
                  padding: '8px 12px',
                  borderRadius: '15px',
                  maxWidth: '80%',
                  fontSize: '14px',
                }}
              >
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '10px',
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: '5px',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder='Type a message...'
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                outline: 'none',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={connectionStatus !== 'open'}
              style={{
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                opacity: connectionStatus === 'open' ? 1 : 0.5,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
