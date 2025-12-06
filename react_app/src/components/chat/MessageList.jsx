import React, { useEffect, useRef } from 'react';
import Message from './Message';

const MessageList = ({ messages, currentUserId, isAIAssistant }) => { 
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-container">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isSent={message.senderId === currentUserId}
          isAIAssistant={isAIAssistant} // Used to decide Markdown rendering
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;