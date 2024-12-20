const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const io = require('socket.io')(7000, {
    cors: {
        origin: "*", // Allow all origins (use specific origin in production)
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"], 
        credentials: true 
    }
});

const users ={};

io.on('connection', socket => {
    console.log('A user connected');

    socket.on('new-user-joined', ({ user, userimg }) =>{
        console.log("New User:", user, userimg);
        users[socket.id] = { user, userimg };
        socket.broadcast.emit('user-joined', { user, userimg });
    })

    // Handle 'send' event from a client
    socket.on('send', ({user, message, userimg }) => {
        console.log(`Message received: ${message}`);
        
        // Broadcast the message to all other clients
        socket.broadcast.emit('receive', {user, message, userimg });
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});