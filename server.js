const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers, startGame, removeCard, newRound } = require('./utils/users');
let Deck = [];

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

        // to individual socketid (private message)
        io.to(socket.id).emit('newUserNumber', user.playerNumber);
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

    // Listen for a bet Enter
    socket.on('startRequest', room => {
        let trump = startGame(room);
        io.to(room).emit('drawHands', {users: getRoomUsers(room), trump: trump, roundServer: 1});
    });

    // Listen for a bet Enter
    socket.on('roundDone', ({room, round}) => {
        let trump = newRound(room, round);
        io.to(room).emit('drawHands', {users: getRoomUsers(room), trump: trump, roundServer: round});
    });

    // Listen for a clicked card in a round
    socket.on('cardClicked', ({room, username, cardSend}) => {
        console.log(room, username, cardSend);
        removeCard(username, cardSend);
        socket.broadcast.to(room).emit('cardClickedServer', {usernameSent: username, cardSent: cardSend});

        //let answer = checkTrickDone(room);
    });

    // Broadcast to everybody when a user disconnects
    socket.on('disconnect', () => {
        const userLeft = userLeave(socket.id);
        console.log('Exit Room...');

        if (userLeft) {
            io.to(userLeft.room).emit('message', formatMessage(botName, `${userLeft.username} has left the chat`));

            // Send userself to every user in room
            let users = getRoomUsers(userLeft.room)
            users.forEach(user => {
                io.to(user.id).emit('newUserNumber', user.playerNumber);
            });
            

            // Send users and room info
            io.to(userLeft.room).emit('roomUsers', {room: userLeft.room, users: getRoomUsers(userLeft.room)});
        }
    });
})

