import React from 'react';
import ConversationItem from './ConversationItem';

const Sidebar = ({ conversations, selectedConversation, onSelectConversation, currentUser }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Messages</h3>
        <p>Logged in as: {currentUser.username}</p>
      </div>
      <div className="conversations-list">
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={selectedConversation?.id === conversation.id}
            onSelect={() => onSelectConversation(conversation)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar;  // ← Make sure this is here!