const chatForm = document.getElementById('chat-form');
const roomName = $('#roomName');
const playerSpace = $('#playerSpace');
const playerEnterBet = $('#enterBet');
let Deck = [];
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

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// MESSAGES FROM SERVER!!!!!!!!!!!!


// Message from server
socket.on('message', message => {
    console.log(message);
    //outputMessage(message);

    // Scroll down
    let height = $('.chat-messages').prop('scrollHeight');
    $('.chat-messages').scrollTop(height);
    //chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Message from server
socket.on('betChange', user => {
    let bet = user.bet;
    console.log(bet);

    // Scroll down
    let betDiv = $(`#${user.username}`).find(".bets");
    betDiv.html('');
    for (let i = 0; i < bet; i++) {
        betDiv.append(`<span class="dot"></span>`);
    }
})

// Message from server
socket.on('startGame', users => {
    Deck = [];
    for (let i = 0; i < 60; i++) {
        Deck.push({cardID: i, img: `Image${i}.png`});
    }
    //shuffle
    shuffleArray(Deck);
    console.log(Deck);
})



// MESSAGES FROM USER!!!!!!!!!!!!


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
    roomName.text("WIZARD: "+room);
}

// Output Users Space to DOM
function outputUsers(users){
    playerSpace.html("");
    users.forEach(user => {
        let playerhtml = playerSpace.html();
        playerSpace.html(playerhtml + `<div class="col-2" id="${user.username}">
        <label class="d-block my-0">${user.username}</label>
        <div class="d-block bets"></div>
        <img src="assets/cards/c1.png" class="img-thumbnail rounded w-100" style="height: 200px; max-width: 150px">
        </div>`);
    });
}

// Enter Bet click
$('#enterBet').on('click', function(event){
    let betHTML = $('#bet-text');
    let betAmount = betHTML.val();
    console.log(betAmount);
    if (betAmount > 20) {betAmount = 20;}

    // Emit a message to server
    socket.emit('enterBet', betAmount);

    // Clear input
    betHTML.val("");
});

// Start Game click
$('#start').on('click', function(event){
    // Emit a message to server
    socket.emit('startRequest', room);
});