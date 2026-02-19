import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import './ChatPanel.css';

export default function ChatPanel({ group, isOpen, onClose }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !group) return;

        const connect = async () => {
            try {
                const token = authService.getToken();
                if (!chatService.isConnected) {
                    await chatService.connect(token);
                }
                setConnected(true);
                chatService.subscribe(group.id, (msg) => {
                    setMessages((prev) => [...prev, msg]);
                });
            } catch (err) {
                console.error('Chat connect error:', err);
            }
        };

        connect();

        return () => {
            chatService.unsubscribe(group.id);
        };
    }, [isOpen, group]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !connected) return;
        chatService.sendMessage(group.id, input.trim());
        // Optimistic local add
        setMessages((prev) => [
            ...prev,
            {
                senderId: user?.id,
                senderEmail: user?.email,
                content: input.trim(),
                timestamp: new Date().toISOString(),
            },
        ]);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="chat-panel animate-slide-up">
            <div className="chat-header">
                <h4>Group Chat</h4>
                <span className={`chat-status ${connected ? 'chat-status--online' : ''}`}>
                    {connected ? '● Connected' : '○ Connecting...'}
                </span>
                <button className="chat-close" onClick={onClose}>
                    <X size={18} />
                </button>
            </div>

            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-empty">
                        <p>No messages yet. Say hello! 👋</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.senderId === user?.id;
                    return (
                        <div key={i} className={`chat-message ${isMe ? 'chat-message--me' : 'chat-message--other'}`}>
                            {!isMe && <span className="chat-sender">{msg.senderEmail || 'User'}</span>}
                            <div className="chat-bubble">
                                <span>{msg.content}</span>
                            </div>
                            <span className="chat-time">
                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    maxLength={500}
                    disabled={!connected}
                />
                <button type="submit" className="chat-send" disabled={!input.trim() || !connected}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
