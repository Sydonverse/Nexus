import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageSquare,
  Paperclip,
  Smile,
  ShieldAlert,
} from 'lucide-react';
import { ChatMessage, DepartmentMemberContext, User } from '../types';
import { socketService } from '../services/socket';

interface ChatViewProps {
  messages: ChatMessage[];
  activeDept: DepartmentMemberContext;
  currentUser: User | null;
  onSendMessage: (content: string) => void;
  typingUsers: { userId: string; name: string }[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  activeDept,
  currentUser,
  onSendMessage,
  typingUsers,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    // Emit typing indicator
    socketService.startTyping(activeDept.slug);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketService.stopTyping(activeDept.slug);
    }, 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim());
    setInputText('');
    socketService.stopTyping(activeDept.slug);
  };

  return (
    <div className="view-container chat-view-layout">
      {/* Header */}
      <div className="chat-header glass-panel">
        <div className="chat-header-info">
          <div className="chat-dept-indicator">
            <div className="status-online-dot"></div>
            <h2 className="chat-title">{activeDept.name} Department Channel</h2>
          </div>
          <p className="chat-subtitle">
            Live real-time collaborative discussion for registered interns and instructors.
          </p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="chat-messages-container glass-panel">
        {messages.length === 0 ? (
          <div className="empty-chat-state">
            <MessageSquare size={48} className="text-muted" />
            <h3>Welcome to {activeDept.name} Channel</h3>
            <p className="text-muted">
              Start the discussion! Ask questions, share progress, or coordinate with your tutors.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const isTutor = msg.sender?.role === 'TUTOR';

            return (
              <div
                key={msg.id}
                className={`chat-bubble-wrapper ${isMe ? 'bubble-me' : 'bubble-other'}`}
              >
                {!isMe && (
                  <div className="chat-sender-avatar" title={msg.sender?.firstName}>
                    {msg.sender?.avatarUrl ? (
                      <img src={msg.sender.avatarUrl} alt="" className="chat-avatar-img" />
                    ) : (
                      <span>{msg.sender?.firstName?.[0] || 'U'}</span>
                    )}
                  </div>
                )}

                <div className="chat-bubble-content">
                  <div className="chat-bubble-meta">
                    <span className="chat-sender-name">
                      {isMe ? 'You' : `${msg.sender?.firstName} ${msg.sender?.lastName}`}
                    </span>
                    {isTutor && <span className="chat-tutor-badge">INSTRUCTOR</span>}
                    <span className="chat-timestamp">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`chat-bubble-text ${
                      isMe ? 'bubble-text-me' : 'bubble-text-other'
                    }`}
                    style={
                      isMe
                        ? { background: `linear-gradient(135deg, ${activeDept.colorHex}, #4f46e5)` }
                        : {}
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator-row">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-text">
              {typingUsers.map((u) => u.name).join(', ')}{' '}
              {typingUsers.length === 1 ? 'is' : 'are'} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form className="chat-input-form glass-panel" onSubmit={handleSend}>
        <input
          type="text"
          className="chat-input-field"
          placeholder={`Message #${activeDept.slug}...`}
          value={inputText}
          onChange={handleInputChange}
        />
        <button
          type="submit"
          className="btn-primary chat-send-btn"
          disabled={!inputText.trim()}
          style={{ background: activeDept.colorHex }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};
