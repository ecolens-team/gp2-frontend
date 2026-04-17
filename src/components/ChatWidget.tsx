import React, { useState, useEffect, useRef } from 'react';
import type{ ChatMessage } from '../types/chat';
import { MessageCircleMore, X } from "lucide-react";
import './ChatWidget.css';

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const socketRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

  
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    
    useEffect(() => {
        if (isOpen && !socketRef.current) {
          
    socketRef.current = new WebSocket('ws://64.226.126.199:8000/ws/chat/support/');            socketRef.current.onmessage = (e) => {
                const data = JSON.parse(e.data);
                setMessages((prev) => [...prev, { sender: data.sender, message: data.message }]);
            };

            socketRef.current.onclose = () => {
                socketRef.current = null;
            };
        }
    }, [isOpen]);

    const sendMessage = () => {
        if (input.trim() && socketRef.current) {
            socketRef.current.send(JSON.stringify({
                'message': input,
                'receiver': 'admin'
            }));
            setInput("");
        }
    };

    return (
        <div className="chat-widget-wrapper">
    
           <button className="chat-fab" onClick={() => setIsOpen(!isOpen)}>
    {isOpen ? (
        <X size={26} className="text-teal-600" />
    ) : (
        <MessageCircleMore 
            size={26} 
                color="#0d9488" 

            className="text-gray-500 hover:text-teal-600 transition-all duration-300 transform hover:scale-110" 
           
        />
    )}
        </button>

            {isOpen && (
                <div className="chat-popup">
                    <div className="chat-header">EcoLens Live Chat</div>
                    <div className="chat-body">
                        {messages.map((m, i) => (
                            <div key={i} className={`msg-bubble ${m.sender === 'me' ? 'sent' : 'received'}`}>
                                <small>{m.sender}</small>
                                <p>{m.message}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-footer">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="...." 
                        />
                        <button onClick={sendMessage}>➤</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWidget;