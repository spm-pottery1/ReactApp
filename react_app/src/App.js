// src/App.js

import React, { useState, useEffect } from 'react';

// CORRECTED IMPORTS: Use the relative paths to your components
import Sidebar from './components/sidebar/Sidebar';
import ChatWindow from './components/chat/ChatWindow';

// You must have a 'services/api.js' file exporting these fetch functions
import { fetchUsers, fetchGroups } from './services/api'; 


function App() {
  // CRITICAL: This ID must match 'user_1' from the index.js test data
  const currentUser = { id: 'user_1', name: 'You (Simon)' }; 

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- useEffect: Fetch Data from Backend ---
  useEffect(() => {
    async function loadConversations() {
      setIsLoading(true);
      try {
        // 1. Define the AI Assistant conversation manually
        const aiConversation = { 
          id: 'AI-Tutor-ID', 
          name: 'AI Assistant', 
          avatar: '🤖', 
          type: 'AI' 
        };

        // 2. Fetch all individual users from the database
        const { users } = await fetchUsers(); // Assumes fetchUsers returns { users: [...] }
        const userConversations = users
          // Filter out the current user (You can't chat with yourself)
          .filter(u => u.id !== currentUser.id) 
          .map(user => ({
            id: user.id,
            name: user.name,
            avatar: '👤', // Placeholder for user
            type: 'USER' 
          }));

        // 3. Fetch all groups from the database
        const { groups } = await fetchGroups(); // Assumes fetchGroups returns { groups: [...] }
        const groupConversations = groups.map(group => ({
            id: String(group.id), 
            name: group.name,
            avatar: '👥', // Placeholder for group
            type: 'GROUP'
        }));

        // 4. Combine all conversation types for the Sidebar
        const allConversations = [
          aiConversation,
          ...userConversations,
          ...groupConversations,
        ];

        setConversations(allConversations);

        // 5. Select the first conversation (AI Assistant) by default
        if (allConversations.length > 0) {
            setSelectedConversation(allConversations[0]);
        }
        
      } catch (error) {
        console.error("Failed to load initial conversations:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConversations();
  }, [currentUser.id]); 
  // -----------------------------------------------------

  // Function to instantly update the list when a new group is created
  const handleNewGroupCreated = (newGroupConversation) => {
    setConversations(prev => [...prev, newGroupConversation]);
    setSelectedConversation(newGroupConversation); 
  };

  // --- CONDITIONAL RENDERING ---

  // Display a loading state while fetching data
  if (isLoading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '100px', fontSize: '1.2em' }}>
        <p>Loading Section Connection chats... ⏳</p>
      </div>
    );
  }

  // Main application render
  return (
    <div className="app-container">
      <Sidebar 
        conversations={conversations} 
        currentUser={currentUser}
        onSelectConversation={setSelectedConversation}
        onNewGroupCreated={handleNewGroupCreated} 
        selectedConversationId={selectedConversation?.id}
      />
      <ChatWindow 
        conversation={selectedConversation} 
        currentUser={currentUser} 
      />
    </div>
  );
}

export default App;