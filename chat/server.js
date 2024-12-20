// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (update this in production)
        methods: ["GET", "POST"],
    }
});

const users = {};

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('new-user-joined', ({ user, userimg }) => {
        console.log("New User:", user);
        users[socket.id] = { user, userimg };
        socket.broadcast.emit('user-joined', { user, userimg });
    });

    socket.on('send', (message) => {
        const userDetails = users[socket.id];
        socket.broadcast.emit('receive', { message, ...userDetails });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
        delete users[socket.id];
    });
});

const PORT = process.env.PORT || 7000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});