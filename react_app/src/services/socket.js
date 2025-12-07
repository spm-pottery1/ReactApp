import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinConversations = (conversationIds) => {
  if (socket) {
    socket.emit('join-conversations', conversationIds);
  }
};

export const onNewMessage = (callback) => {
  if (socket) {
    socket.on('new-message', callback);
  }
};

export const offNewMessage = () => {
  if (socket) {
    socket.off('new-message');
  }
};

export const getSocket = () => socket;