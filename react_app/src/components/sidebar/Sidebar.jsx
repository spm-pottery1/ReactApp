import React, { useState } from 'react';
import ConversationItem from './ConversationItem';
import NewConversationModal from './NewConversationModal.jsx';

function Sidebar({ conversations, selectedConversation, onSelectConversation, currentUser, onLogout, onConversationCreated }) {
  const [showNewConversation, setShowNewConversation] = useState(false);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Messages</h3>
            <p>Logged in as: {currentUser.username}</p>
          </div>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 12px',
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Logout
          </button>
        </div>
        <button
          onClick={() => setShowNewConversation(true)}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '10px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          + New Conversation
        </button>
      </div>
      
      <div className="conversations-list">
        {conversations.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            No conversations yet. Start a new one!
          </div>
        ) : (
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={selectedConversation?.id === conversation.id}
              onSelect={() => onSelectConversation(conversation)}
            />
          ))
        )}
      </div>

      {showNewConversation && (
        <NewConversationModal
          currentUser={currentUser}
          onClose={() => setShowNewConversation(false)}
          onConversationCreated={() => {
            setShowNewConversation(false);
            onConversationCreated();
          }}
        />
      )}
    </div>
  );
}

export default Sidebar;