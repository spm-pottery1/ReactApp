// src/services/api.js (Ensure ALL of these functions are present and exported)

const API_BASE_URL = 'http://localhost:5000/api'; 

/**
 * Sends a user message to the AI chat endpoint and saves the user/AI response
 * to the database.
 */
export const sendMessageToAI = async (text, conversationId, senderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: text, conversationId, senderId }), 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message to AI');
    }

    const data = await response.json();
    return data.response; 
  } catch (error) {
    console.error("API Error sending message:", error);
    throw error;
  }
};

/**
 * NEW: Sends a user message to the general message saving endpoint (used for groups).
 */
export const sendGroupMessage = async (text, conversationId, senderId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, conversationId, senderId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send group message');
        }

        return true; 
    } catch (error) {
        console.error("API Error sending group message:", error);
        throw error;
    }
};

/**
 * Fetches the complete message history for a given conversation (used for AI and Groups).
 */
export const fetchMessageHistory = async (conversationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/messages/${conversationId}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch message history');
    }

    const data = await response.json();
    return data.messages; 
  } catch (error) {
    console.error("API Error fetching history:", error);
    throw error;
  }
};

/**
 * Fetches the list of all available group chats.
 */
export const fetchGroups = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch groups list');
    }

    const data = await response.json();
    return data.groups; 
  } catch (error) {
    console.error("API Error fetching groups:", error);
    throw error;
  }
};

/**
 * Fetches the list of all available users for group selection.
 */
export const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch users list');
    }

    const data = await response.json();
    return data.users; 
  } catch (error) {
    console.error("API Error fetching users:", error);
    throw error;
  }
};

/**
 * Creates a new group chat.
 */
export const createGroup = async (name, memberIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, memberIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create group');
    }

    const data = await response.json();
    return data.group; 
  } catch (error) {
    console.error("API Error creating group:", error);
    throw error;
  }
};