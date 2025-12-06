import React from 'react';
import AiResponseDisplay from './AiResponseDisplay'; 

const Message = ({ message, isSent, isAIAssistant }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isAIMessage = isAIAssistant && !isSent; 

  const messageContent = isAIMessage ? (
    <AiResponseDisplay aiText={message.text} /> 
  ) : (
    <div className="message-text">{message.text}</div> 
  );

  return (
    <div className={`message ${isSent ? 'sent' : 'received'}`}>
      <div className="message-content">
        {messageContent} 
        <div className="message-time">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
};

export default Message;