const express = require('express');
const cors = require('cors');

// Create the Express app
const app = express();
app.use(cors());

// Determine the port dynamically for deployment, with 10000 as the default for local use
const PORT = process.env.PORT || 10000;

// Set up the Socket.IO server
const io = require('socket.io')(PORT, {
    cors: {
        origin: "*", // Allow all origins (use specific origin in production)
        methods: ["GET", "POST"],
    },
});

console.log(`Socket.IO server running on port ${PORT}`);

// Object to store connected users
const users = {};

// Handle client connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle 'new-user-joined' event
    socket.on('new-user-joined', ({ user, userimg }) => {
        console.log('New User Joined:', user, userimg);
        users[socket.id] = { user, userimg };
        socket.broadcast.emit('user-joined', { user, userimg });
    });

    // Handle 'send' event
    socket.on('send', ({ user, message, userimg }) => {
        console.log(`Message from ${user}: ${message}`);
        // Broadcast the message to all other connected clients
        socket.broadcast.emit('receive', { user, message, userimg });
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (users[socket.id]) {
            socket.broadcast.emit('user-left', users[socket.id]);
            delete users[socket.id];
        }
    });
});
