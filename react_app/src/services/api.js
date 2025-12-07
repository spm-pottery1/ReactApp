// src/services/api.js

const API_URL = 'http://localhost:5000/api';

// Store token in localStorage
let authToken = localStorage.getItem('authToken');

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => authToken;

const authFetch = async (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Auth APIs
export const register = async (username, email, password, avatar) => {
  const data = await authFetch(`${API_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({ username, email, password, avatar }),
  });
  setAuthToken(data.token);
  return data.user;
};

export const login = async (username, password) => {
  const data = await authFetch(`${API_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  setAuthToken(data.token);
  return data.user;
};

export const logout = () => {
  setAuthToken(null);
};

// User APIs
export const getAllUsers = async () => {
  const data = await authFetch(`${API_URL}/users`);
  return data.users;
};

// Conversation APIs
export const getConversations = async () => {
  const data = await authFetch(`${API_URL}/conversations`);
  return data.conversations;
};

export const createConversation = async (memberIds, name = null, isGroup = false) => {
  const data = await authFetch(`${API_URL}/conversations`, {
    method: 'POST',
    body: JSON.stringify({ member_ids: memberIds, name, is_group: isGroup }),
  });
  return data.conversation_id;
};

// Message APIs
export const getMessages = async (conversationId) => {
  const data = await authFetch(`${API_URL}/conversations/${conversationId}/messages`);
  return data.messages;
};

export const sendMessage = async (conversationId, content) => {
  const data = await authFetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
  return data.message;
};

// AI API
export const sendMessageToAI = async (message) => {
  try {
    const response = await fetch('http://localhost:5000/api/ai-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
};