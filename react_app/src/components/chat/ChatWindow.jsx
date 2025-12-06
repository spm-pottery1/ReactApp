import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (conversation) {
      const sampleMessages = [
        {
          id: 1,
          text: 'Hey! How are you?',
          senderId: conversation.id,
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 2,
          text: 'I\'m doing great! Thanks for asking.',
          senderId: currentUser.id,
          timestamp: new Date(Date.now() - 3000000).toISOString()
        },
        {
          id: 3,
          text: 'That\'s wonderful to hear!',
          senderId: conversation.id,
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ];
      setMessages(sampleMessages);
    }
  }, [conversation, currentUser.id]);

  const handleSendMessage = (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      senderId: currentUser.id,
      timestamp: new Date().toISOString()
    };
    
    setMessages([...messages, newMessage]);

    if (conversation.name === 'AI Assistant') {
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          text: 'Thanks for your message! This is a demo response from the AI.',
          senderId: conversation.id,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  if (!conversation) {
    return (
      <div className="chat-window">
        <div className="empty-chat">
          Select a conversation to start messaging
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-avatar">{conversation.avatar}</div>
        <div className="chat-header-info">
          <h3>{conversation.name}</h3>
        </div>
      </div>
      <MessageList messages={messages} currentUserId={currentUser.id} />
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;  // ← Make sure this is here!