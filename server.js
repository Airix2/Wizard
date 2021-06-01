const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set Static folder
app.use(express.static(path.join(__dirname, 'public')));

//set PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server runnning on port ${PORT}`));

const botName = "Wizard Bot"    //in case we need a bot, doubt it

//Run when client connects
io.on('connection', socket => {
    console.log('New WS Connection...');

    socket.on('joinRoom', ({ username, room }) => {
        console.log('Entered Room...');
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);     //Joins a room of socket.io

        // Welcome current user
        socket.emit('message', formatMessage(botName,'Welcome to the Game Room'));

        // Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the room`));

        // Send users and room info to view
        io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)});
    });

    
    
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Listen for a bet Enter
    socket.on('enterBet', betAmount => {
        const user = getCurrentUser(socket.id);
        user.bet = betAmount;
        io.to(user.room).emit('betChange', user);
    });

    // Broadcast to everybody when a user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        console.log('Exit Room...');

        if (user) {
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));
            
            // Send users and room info
            io.to(user.room).emit('roomUsers', {room: user.room, users: getRoomUsers(user.room)});
        }
    });
})