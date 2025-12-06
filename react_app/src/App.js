import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';
import Login from './components/Auth/Login';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([
    { id: 1, name: 'John Doe', lastMessage: 'Hey there!', avatar: '👤' },
    { id: 2, name: 'AI Assistant', lastMessage: 'How can I help?', avatar: '🤖' },
    { id: 3, name: 'Jane Smith', lastMessage: 'See you tomorrow', avatar: '👩' }
  ]);

  const handleLogin = (username) => {
    setCurrentUser({ id: Date.now(), username });
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

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
      />
      <ChatWindow 
        conversation={selectedConversation}
        currentUser={currentUser}
      />
    </div>
  );
}

export default App;