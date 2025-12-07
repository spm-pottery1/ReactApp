import React, { useState, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { getMessages, sendMessage } from '../../services/api';
import { sendMessageToAI } from '../../services/api';
import { onNewMessage, offNewMessage } from '../../services/socket';

function ChatWindow({ conversation, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (conversation) {
      loadMessages();
      
      // Listen for new messages
      onNewMessage((data) => {
        if (data.conversationId === conversation.id) {
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(m => m.id === data.message.id)) {
              return prev;
            }
            return [...prev, data.message];
          });
        }
      });
    }

    return () => {
      offNewMessage();
    };
  }, [conversation]);

  const loadMessages = async () => {
    if (!conversation) return;
    
    setLoading(true);
    try {
      const msgs = await getMessages(conversation.id);
      const formattedMsgs = msgs.map(msg => ({
        id: msg.id,
        text: msg.text,
        senderId: msg.sender_id,
        timestamp: msg.timestamp,
        senderName: msg.sender_name,
        senderAvatar: msg.sender_avatar
      }));
      setMessages(formattedMsgs);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text) => {
    if (!conversation) return;

    try {
      if (conversation.name === 'AI Assistant') {
        const userMsg = {
          id: Date.now(),
          text,
          senderId: currentUser.id,
          timestamp: new Date().toISOString(),
          senderName: currentUser.username,
          senderAvatar: currentUser.avatar
        };
        setMessages(prev => [...prev, userMsg]);
        setIsTyping(true);

        const aiResponseText = await sendMessageToAI(text);
        
        const aiMsg = {
          id: Date.now() + 1,
          text: aiResponseText,
          senderId: 'ai',
          timestamp: new Date().toISOString(),
          senderName: 'AI Assistant',
          senderAvatar: '🤖'
        };
        
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);
      } else {
        // Regular conversation - message will appear via socket
        await sendMessage(conversation.id, text);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
      setIsTyping(false);
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
          {conversation.isGroup && (
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {conversation.members?.length} members
            </p>
          )}
          {isTyping && (
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              Typing...
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center' 
        }}>
          Loading messages...
        </div>
      ) : (
        <>
          <MessageList messages={messages} currentUserId={currentUser.id} />
          <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
        </>
      )}
    </div>
  );
}

export default ChatWindow;