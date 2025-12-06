import React from 'react';

const ConversationItem = ({ conversation, isActive, onSelect }) => {
  return (
    <div 
      className={`conversation-item ${isActive ? 'active' : ''}`}
      onClick={onSelect}
    >
      <div className="conversation-avatar">{conversation.avatar}</div>
      <div className="conversation-info">
        <div className="conversation-name">{conversation.name}</div>
        <div className="conversation-last-message">{conversation.lastMessage}</div>
      </div>
    </div>
  );
};

export default ConversationItem;  // ← Make sure this is here!