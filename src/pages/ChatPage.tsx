import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext/AuthContext';
import { api } from '../lib/axiosConfig';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUIContext } from '../contexts/UIContext';
import { useQuery } from '@tanstack/react-query';
import { getChats, getMessageHistory } from '../services/chatService';

interface ChatMessage {
  sender: string;
  content: string;
  timestamp: Date;
  isHistory?: boolean;
}

interface ChatUser {
  id: string;
  username: string;
  profile_picture: string;
}

interface Chat {
  id: number;
  user: ChatUser;
  updated_at: string;
  last_message: string;
}

const getInitials = (name: string) => name.slice(0, 2).toUpperCase();

const getAvatarColor = (id: string) => {
  const colors = ['bg-[#14b8a6]', 'bg-[#0d9488]', 'bg-[#0f766e]', 'bg-[#115e59]'];
  return colors[parseInt(id) % colors.length];
};

const formatDate = (dateInput: Date | string) => {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
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
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'open' | 'closed'>('closed');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [active, setActive] = useState<'conversations' | 'chat'>('conversations');
  const socketRef = useRef<WebSocket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { setHideBottomNav, setInboxTabsVisible } = useUIContext();

  const myId = String(authUser?.id || '');

  const { data: chats, isLoading } = useQuery({
    queryKey: [myId, 'chats'],
    queryFn: getChats
  });

  const {data: initialMessages, isSuccess } = useQuery({
    queryKey: [selectedUser, 'messages'],
    queryFn: () => {
      if (!selectedChat?.id) throw new Error("No chat selected");
      return getMessageHistory(selectedChat.id);
    },
    enabled: !!selectedChat
  });

  useEffect(() => {
    if(initialMessages && isSuccess){
      setMessages(initialMessages)
    }
  }, [initialMessages, isSuccess]);

  useEffect(() => {
    api.post<{ access: string }>('/auth/token/refresh/')
      .then(() => {
        api.get<{ token: string }>('/ws-token/')
          .then((res) => {
            setWsToken(res.data.token);
          });
      })
      .catch(() => {
        api.get<{ token: string }>('/ws-token/')
          .then((res) => {
            setWsToken(res.data.token);
          })
          .catch((err) => console.error('Failed to get WS token:', err));
      });
  }, []);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!myId || !wsToken || !selectedUser) return;

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

    socket.onopen = () => setConnectionStatus('open');

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
        content: data.message,
        timestamp: new Date(),
        isHistory: data.is_history,
      }]);
    };

    socket.onerror = () => setConnectionStatus('closed');
    socket.onclose = () => setConnectionStatus('closed');

    return () => socket.close();
  }, [selectedUser, myId, wsToken]);

  const sendMessage = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && selectedUser &&input.trim()) {
      const messageText = input.trim();
      setMessages(prev => [...prev, { sender: myId, content: messageText, timestamp: new Date() }]);
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

  if(isLoading) return <Loader2 className='animate-spin'/>

  return (
    <div className="flex h-full bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <div className={`flex flex-col shrink-0 w-full md:w-70 bg-linear-to-tr from-[#14b8a6] to-[#bfdbfe] md:block ${active=='chat'? 'hidden' : 'block'}`}>
        <div className="flex-1 px-2 py-3 overflow-y-auto">
          {chats.map((chat: Chat) => (
            <div 
              key={chat.id} 
              onClick={() => {
                setSelectedUser(chat.user);
                setActive('chat');
                setHideBottomNav(true);
                setInboxTabsVisible(false);
                setSelectedChat(chat)
              }} 
              className={`flex items-center gap-3 p-3 mb-1 rounded-2xl cursor-pointer transition-all duration-200 ${
               selectedUser &&( selectedUser.id === chat.user.id) ? 'bg-white/25' : 'bg-transparent hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-center shrink-0 w-10 h-10 text-sm font-bold text-white border-2 rounded-full bg-white/30 border-white/40">
                {getInitials(chat.user.username)}
              </div>
              <div className="overflow-hidden text-sm font-semibold text-white truncate whitespace-nowrap">
                {chat.user.username}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className={`flex flex-col flex-1 overflow-hidden min-h-0 md:flex ${active=='chat'? 'flex' : 'hidden'}`}>
        {/* Header */}
        {selectedChat && <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200">
          <button className='text-teal-800' onClick={() => {
            setActive('conversations');
            setHideBottomNav(false);
            setInboxTabsVisible(true);
          }}><ArrowLeft /></button>
           {selectedUser && <div className={`flex items-center justify-center w-11 h-11 text-base font-bold text-white rounded-full ${getAvatarColor(selectedUser.id)}`}>
            { getInitials(selectedUser.username)}
          </div>}
          <div>
           {selectedUser && <div className="text-base font-bold text-slate-900">{selectedUser.username}</div>}
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${connectionStatus === 'open' ? 'bg-green-500' : 'bg-slate-400'}`} />
              <span className="text-xs text-slate-500">{connectionStatus === 'open' ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>}

        {/* Message Area */}
        {selectedChat? <div ref={messagesContainerRef} className="flex-1 overflow-y-auto min-h-0">
          <div className="flex flex-col min-h-full gap-1.5 p-6">
            {groupedMessages.map((group, gi) => (
              <div key={gi}>
                <div className="my-5 text-[11px] font-bold text-center uppercase tracking-wider text-slate-400">
                  {group.date}
                </div>
                {group.messages.map((msg, mi) => {
                  const isMe = msg.sender == myId;
                  
                  return (
                    <div key={mi} className={`flex items-end gap-2.5 mb-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`max-w-[70%] px-4 py-3  text-sm shadow-sm ${
                        isMe
                          ? 'rounded-[20px_20px_4px_20px] bg-linear-to-r from-[#14b8a6] to-[#0d9488] text-white'
                          : 'rounded-[20px_20px_20px_4px] bg-white text-slate-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {isTyping && selectedUser && (
              <div className="px-3 py-1 text-xs italic text-slate-500">
                {selectedUser.username} is typing...
              </div>
            )}
          </div>
        </div>
        :
        <div className='w-full h-full flex items-center justify-center text-gray-400 font-bold'>No Chat Selected yet!</div>}

        {/* Input Area */}
        {selectedChat && <div className="flex gap-3 px-6 py-5 bg-white border-t border-slate-200">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)} 
            onKeyDown={handleKeyDown} 
            placeholder={connectionStatus === 'open' ? "Type a message..." : "Connecting..."}
            disabled={connectionStatus !== 'open'}
            className="flex-1 px-5 py-3.5 bg-slate-50 border-2 border-slate-100 rounded-[28px] outline-none focus:border-[#14b8a6] transition-colors disabled:cursor-not-allowed"
          />
          <button 
            onClick={sendMessage} 
            disabled={connectionStatus !== 'open' || !input.trim()}
            className={`flex items-center justify-center w-12 h-12 text-white rounded-full transition-all ${
              connectionStatus === 'open' && input.trim() ? 'bg-[#14b8a6] cursor-pointer' : 'bg-slate-200 cursor-not-allowed'
            }`}
          >
            ➔
          </button>
        </div>}
      </div>
    </div>
  );
};

export default ChatPage;