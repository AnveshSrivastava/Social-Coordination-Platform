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
    const [error, setError] = useState(null);
    const [isChatEnabled, setIsChatEnabled] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (!isOpen || !group) return;

        const connect = async () => {
            setError(null);
            try {
                const token = authService.getToken();
                if (!token) throw new Error('Not authenticated');

                if (!chatService.isConnected) {
                    await chatService.connect(token);
                }

                setConnected(true);

                const subscription = chatService.subscribe(group.id, (msg) => {
                    setMessages((prev) => [...prev, msg]);
                });

                if (!subscription) {
                    throw new Error('Chat subscription failed');
                }
            } catch (err) {
                console.error('Chat connect error:', err);
                setError(err?.message || 'Chat connect failed');
                setConnected(false);
            }
        };

        setIsChatEnabled(group?.status === 'CONFIRMATION' || group?.status === 'ACTIVE');
        connect();

        return () => {
            chatService.unsubscribe(group.id);
            setConnected(false);
            setError(null);
            setIsChatEnabled(false);
        };
    }, [isOpen, group]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        if (!connected) {
            setError('Not connected to chat server');
            return;
        }

        try {
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
            setError(null);
        } catch (err) {
            console.error('Chat send error:', err);
            setError(err?.message || 'Failed to send');
        }
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

            {error && (
                <div className="chat-error">
                    <span>{error}</span>
                </div>
            )}

            <form className="chat-input-bar" onSubmit={handleSend}>
                <input
                    type="text"
                    className="chat-input"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isChatEnabled ? 'Type a message...' : 'Chat available in confirmation or active phase'}
                    maxLength={500}
                    disabled={!connected || !isChatEnabled}
                />
                <button type="submit" className="chat-send" disabled={!input.trim() || !connected || !isChatEnabled}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
