import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
// UPDATED: Import both AI and new Group service functions
import { sendMessageToAI, fetchMessageHistory, sendGroupMessage } from '../../services/api'; 

function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (conversation) {
      // Determine conversation type
      const isAIAssistant = conversation.name === 'AI Assistant';
      const isGroupChat = conversation.type === 'GROUP'; 

      if (isAIAssistant || isGroupChat) {
        // Load history for AI Assistant or Group Chat
        const loadHistory = async () => {
          try {
            const history = await fetchMessageHistory(conversation.id);
            setMessages(history); 
          } catch (e) {
            console.error('Failed to load history:', e);
            setMessages([]);
          }
        };
        loadHistory();

      } else {
        // Existing logic for non-AI/non-Group user-to-user conversations (simulated)
        const sampleMessages = [
          {
            id: 1,
            text: 'Hey! How are you?',
            senderId: conversation.id,
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 2,
            text: "I'm doing great! Thanks for asking.",
            senderId: currentUser.id,
            timestamp: new Date(Date.now() - 3000000).toISOString()
          }
        ];
        setMessages(sampleMessages);
      }
    }
  }, [conversation, currentUser.id]);

  const handleSendMessage = async (text) => {
    // 1. Add user message immediately
    const newMessage = {
      id: Date.now(),
      text,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      // isAI is false by default for user messages
    };
    
    setMessages(prev => [...prev, newMessage]);

    // Determine conversation type
    const isAIAssistant = conversation.name === 'AI Assistant';
    const isGroupChat = conversation.type === 'GROUP'; 
    
    if (isAIAssistant) {
      // 2. AI ASSISTANT LOGIC (Call AI endpoint and wait for response)
      setIsTyping(true);
      
      try {
        const aiResponseText = await sendMessageToAI(
            text, 
            conversation.id, 
            currentUser.id
        );
        
        const aiResponse = {
          id: Date.now() + 1,
          text: aiResponseText,
          senderId: 'AI Assistant', // Use a standard senderId for AI
          timestamp: new Date().toISOString(),
          isAI: true
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Sorry, I encountered an error. Please try again.',
          senderId: 'System',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }

    } else if (isGroupChat) { 
      // 2. GROUP CHAT LOGIC (Save to database without waiting for a response)
      try {
        // Send and save the message to the new general message endpoint
        await sendGroupMessage(text, conversation.id, currentUser.id);
        
        // Note: For real-time updates (other users seeing this), 
        // you would typically add WebSocket/Socket.io integration here.
        
      } catch (error) {
        console.error("Error saving group message:", error);
        // Handle error if DB write failed (e.g., show status error)
      }
    } else {
      // 2. USER-TO-USER LOGIC (Simulated response)
      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          text: 'This is a simulated response from ' + conversation.name,
          senderId: conversation.id,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, response]);
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

  // The AI check logic is already correct here
  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="chat-header-avatar">{conversation.avatar}</div>
        <div className="chat-header-info">
          <h3>{conversation.name}</h3>
          {(isTyping && conversation.name === 'AI Assistant') && <p style={{ fontSize: '12px', color: '#666' }}>Typing...</p>}
        </div>
      </div>
      <MessageList 
        messages={messages} 
        currentUserId={currentUser.id} 
        isAIAssistant={conversation.name === 'AI Assistant'} 
      />
      <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}

export default ChatWindow;