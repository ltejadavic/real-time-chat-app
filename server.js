const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const users = {}; // Store socket IDs and usernames
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Store images in the "uploads" folder
const mongoose = require('mongoose');

// MongoDB connection
mongoose.connect('mongodb+srv://########################')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 4000;

app.use(express.static('public'));

// Message schema and model
const messageSchema = new mongoose.Schema({
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Handle socket connections
io.on('connection', (socket) => {
    console.log('A user connected. Socket ID:', socket.id);

    // When a user joins the room
    socket.on('joinRoom', async (username) => {
        console.log(`${username} joined the room. Socket ID: ${socket.id}`);
        
        socket.username = username;
        users[username] = socket.id; // Add user to users object
        console.log('Current users:', users);

        // Load previous messages from the database
        try {
            const messages = await Message.find().sort({ createdAt: 1 });
            socket.emit('loadMessages', messages); // Send previous messages to the user
            console.log(`${username} loaded previous messages.`);
        } catch (err) {
            console.error('Error loading messages from MongoDB:', err);
        }
    
        // Notify other users
        io.emit('userJoined', `${username} has joined the chat.`);
        console.log(`${username} has joined the chat.`);
    });

    // Handle public chat messages
    socket.on('chatMessage', (msg) => {
        console.log(`${socket.username} sent a message: ${msg}`);
        
        const newMessage = new Message({ username: socket.username, text: msg });
        newMessage.save()
            .then(() => {
                io.emit('message', { username: socket.username, text: msg });
                console.log(`Message from ${socket.username} saved and broadcasted.`);
            })
            .catch((err) => console.error('Error saving message to MongoDB:', err));
    });

    // Handle private messages
    socket.on('privateMessage', ({ recipient, message }) => {
        console.log(`Private message from ${socket.username} to ${recipient}: ${message}`);
        
        const recipientSocketId = users[recipient]; // Get recipient's socket ID
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('privateMessageReceived', {
                from: socket.username,
                message: message
            });
            console.log(`Private message from ${socket.username} to ${recipient} delivered.`);
        } else {
            console.log(`Private message failed: ${recipient} not found.`);
        }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`${socket.username} disconnected. Socket ID: ${socket.id}`);
        io.emit('userLeft', `${socket.username} has left the chat.`);
        delete users[socket.username]; // Remove the user from the list
        console.log('Updated users list:', users);
    });
});

// Handle profile picture upload
app.post('/uploadProfilePicture', upload.single('profilePicture'), (req, res) => {
    console.log(`Profile picture uploaded for ${req.file.filename}`);
    
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ imageUrl: filePath });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
