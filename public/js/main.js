const chatForm = document.getElementById('chat-form');
const roomName = $('#room-name');
const usersList = document.getElementById('users');
//const chatMessages = document.querySelector('.chat-messages');

// Get username and room from URL
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

const socket = io();

// Join Chatroom
socket.emit('joinRoom', {username, room});

// Get room and users
socket.on('roomUsers', ({ room, users}) => {
    outputRoomName(room);
    outputUsers(users); 
});

// Message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

    // Scroll down
    let height = $('.chat-messages').prop('scrollHeight');
    $('.chat-messages').scrollTop(height);
    //chatMessages.scrollTop = chatMessages.scrollHeight;
})


// Message submit
$('#chat-form').on('submit', function(event){
    event.preventDefault();
    
    //get message text
    let msgInput = $('#msg');
    let msg = msgInput.val();
    //console.log(msg);

    // Emit a message to server
    socket.emit('chatMessage', msg);

    // Clear input
    msgInput.val("");
    msgInput.focus();
});


// Output message to DOM
function outputMessage(message){
    let div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

// Output Roomname to DOM
function outputRoomName(room){
    roomName.text(room);
}

// Output message to DOM
function outputUsers(users){
    usersList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
    console.log(usersList);
    
}