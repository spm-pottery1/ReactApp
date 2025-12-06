const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const { Sequelize, DataTypes } = require('sequelize'); 
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Check if API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

// ------------------------------------------------------------------
// PostgreSQL Setup with Sequelize (MODELS)
// ------------------------------------------------------------------
const sequelize = new Sequelize(process.env.POSTGRES_URI || 'postgres://user:pass@localhost:5432/section_connection', {
  logging: false, 
  dialect: 'postgres', 
});

// Define the User Model (REQUIRED for test users)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING, // Use a unique string ID (user_1, user_2, etc.)
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'users'
});

// Define the Group Model
const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'groups'
});

// Define the GroupMember Model (Join Table for User <-> Group)
const GroupMember = sequelize.define('GroupMember', {
  // No custom attributes needed, just foreign keys
}, {
  tableName: 'group_members'
});

// Define the Message Model (Table structure)
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  conversationId: {
    type: DataTypes.STRING, // Links to AI (string) or Group (ID)
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.STRING, // Links to User.id or 'AI Assistant'
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isAI: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'messages'
});

// Define Associations
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'userId' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'groupId' });

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ------------------------------------------------------------------
// API Endpoints
// ------------------------------------------------------------------

// Endpoint to fetch all users (Used by CreateGroupModal and App.js)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'name'],
            order: [['name', 'ASC']]
        });
        res.json({ users: users.map(u => u.get({ plain: true })) });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Endpoint to create a new group
app.post('/api/groups', async (req, res) => {
    const { name, memberIds } = req.body;

    if (!name || !memberIds || memberIds.length < 2) {
        return res.status(400).json({ error: 'Group name and at least two members are required.' });
    }

    try {
        const newGroup = await Group.create({ name });
        const members = await User.findAll({ where: { id: memberIds } });
        await newGroup.addUsers(members); 
        
        res.status(201).json({ 
            success: true, 
            group: newGroup.get({ plain: true }),
            message: `Group '${name}' created successfully.` 
        });

    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ error: 'Failed to create group', details: error.message });
    }
});

// Endpoint to fetch all groups
app.get('/api/groups', async (req, res) => {
    try {
        const groups = await Group.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: User,
                attributes: ['id', 'name'],
                through: { attributes: [] } 
            }],
            order: [['name', 'ASC']]
        });
        res.json({ groups: groups.map(g => g.get({ plain: true })) });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
});

// Endpoint to save a non-AI message (Used by Group Chat)
app.post('/api/messages', async (req, res) => {
    const { text, conversationId, senderId } = req.body;
    
    if (!text || !conversationId || !senderId) {
        return res.status(400).json({ error: 'Text, conversationId, and senderId are required.' });
    }

    try {
        await Message.create({ text, conversationId, senderId, isAI: false });
        res.status(201).json({ success: true, message: 'Message saved.' });
    } catch (error) {
        console.error('Error saving group message:', error);
        res.status(500).json({ error: 'Failed to save message.' });
    }
});

// AI Chat endpoint (POST) - Saves User and AI messages
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, conversationId, senderId } = req.body; 

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 1. SAVE USER MESSAGE to PostgreSQL
    await Message.create({
      conversationId,
      text: message,
      senderId,
      isAI: false
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: (
            "You are a helpful and friendly AI tutor for the student collaboration " +
            "platform 'Section Connection.' Your role is to explain concepts clearly, " +
            "guide students step-by-step, and help them understand rather than simply " +
            "giving direct answers. " +
            "Rules: " +
            "- Provide helpful explanations at a college level. " +
            "- Break down complex topics into simple steps. " +
            "- Encourage understanding, not copying. " +
            "- If the question seems like graded homework, give guidance without providing full solutions. " +
            "- Always be supportive, positive, and educational. " +
            "- Keep responses concise unless the student asks for more detail. " +
            "- USE MARKDOWN SYNTAX for all formatting (e.g., **bold**, 1. lists). " +
            "Context: Section Connection was created at Towson University in 2025 to help students collaborate across course sections."
          )
        },
        { role: "user", content: message }
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    // 2. SAVE AI MESSAGE to PostgreSQL
    await Message.create({
      conversationId,
      text: aiResponse,
      senderId: 'AI Assistant', // Consistent ID for AI
      isAI: true
    });
    
    res.json({ response: aiResponse });

  } catch (error) {
    console.error('OpenAI Error or Database Write Error:', error);
    res.status(500).json({ error: 'Failed to get AI response or save data', details: error.message });
  }
});

// History Read endpoint (GET) - Retrieves message history
app.get('/api/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.findAll({
      where: { conversationId },
      order: [['timestamp', 'ASC']], 
    });

    const cleanMessages = messages.map(msg => msg.get({ plain: true }));

    res.json({ messages: cleanMessages });
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

const PORT = process.env.PORT || 5000;

// Start server only after database is connected and synced
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ Debug: Successfully connected and authenticated with PostgreSQL.');
        
        // SYNC ALL MODELS
        await User.sync({ alter: true });
        await Group.sync({ alter: true });
        await GroupMember.sync({ alter: true });
        await Message.sync({ alter: true }); 

        // ------------------------------------------------------------------
        // TEST USERS SETUP
        // ------------------------------------------------------------------
        const testUsers = [
            { id: 'user_1', name: 'You (Simon)' },
            { id: 'user_2', name: 'John Doe' },
            { id: 'user_3', name: 'Jane Smith' },
            { id: 'user_4', name: 'Alex Johnson' },
            { id: 'user_5', name: 'Diana Prince' }
        ];

        // 1. Insert test users
        for (const user of testUsers) {
            await User.findOrCreate({ 
                where: { id: user.id }, 
                defaults: { name: user.name } 
            });
        }
        
        console.log('✅ Database synchronized (User, Group, Message tables created/checked).');
        console.log('✅ Test users inserted into the database.');

        app.listen(PORT, () => {
          console.log(`✅ Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('ERROR connecting to PostgreSQL or syncing database:', error);
        process.exit(1);
    }
}

startServer();