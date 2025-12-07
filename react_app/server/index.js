const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const OpenAI = require('openai');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// ... keep all your existing code ...

// Add Socket.io connection handling BEFORE the app.listen
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User joins their conversations
  socket.on('join-conversations', (conversationIds) => {
    conversationIds.forEach(id => {
      socket.join(`conversation-${id}`);
    });
    console.log(`User ${socket.id} joined conversations:`, conversationIds);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Update the send message endpoint to emit socket event
app.post('/api/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const memberCheck = await pool.query(
      'SELECT 1 FROM conversation_members WHERE conversation_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this conversation' });
    }

    const result = await pool.query(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [id, req.user.id, content]
    );

    // Get sender info
    const userResult = await pool.query(
      'SELECT username, avatar FROM users WHERE id = $1',
      [req.user.id]
    );

    const message = result.rows[0];
    const user = userResult.rows[0];
    
    const messageData = {
      id: message.id,
      text: message.content,
      senderId: message.sender_id,
      timestamp: message.created_at,
      senderName: user.username,
      senderAvatar: user.avatar
    };

    // EMIT TO ALL USERS IN THIS CONVERSATION
    io.to(`conversation-${id}`).emit('new-message', {
      conversationId: id,
      message: messageData
    });

    res.json({ message: messageData });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// CHANGE app.listen to server.listen at the bottom
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ Test at: http://localhost:${PORT}/health`);
});