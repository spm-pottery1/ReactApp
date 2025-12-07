import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import Login from './components/Auth/Login';
import { getConversations, logout, getAuthToken } from './services/api';
import { connectSocket, disconnectSocket, joinConversations } from './services/socket';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      loadConversations();
      // Connect to socket when user is logged in
      connectSocket();
    } else {
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  const loadConversations = async () => {
    try {
      const convos = await getConversations();
      
      const formattedConvos = convos.map(convo => {
        const otherMembers = convo.members?.filter(m => m.id !== currentUser?.id) || [];
        
        return {
          id: convo.id,
          name: convo.is_group 
            ? convo.name 
            : otherMembers[0]?.username || 'Unknown',
          lastMessage: convo.last_message?.content || 'No messages yet',
          avatar: convo.is_group 
            ? '👥' 
            : otherMembers[0]?.avatar || '👤',
          isGroup: convo.is_group,
          members: convo.members
        };
      });

      setConversations(formattedConvos);
      
      // Join all conversation rooms
      const conversationIds = formattedConvos.map(c => c.id);
      joinConversations(conversationIds);
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      if (error.message.includes('token')) {
        handleLogout();
      }
      setLoading(false);
    }
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    connectSocket();
    loadConversations();
  };

  const handleLogout = () => {
    logout();
    disconnectSocket();
    setCurrentUser(null);
    setConversations([]);
    setSelectedConversation(null);
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleConversationCreated = () => {
    loadConversations();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <Sidebar 
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        currentUser={currentUser}
        onLogout={handleLogout}
        onConversationCreated={handleConversationCreated}
      />
      <ChatWindow 
        conversation={selectedConversation}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;