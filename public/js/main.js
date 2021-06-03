const chatForm = document.getElementById('chat-form');
const roomName = $('#roomName');
const playerSpace = $('#playerSpace');
const playerEnterBet = $('#enterBet');

let round = 0;
let trump = [];
let turn = 0;
let playerNumber = -1;
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

// Get PlayerNumber
socket.on('newUserNumber', number => {
    playerNumber = number;
});


// MESSAGES FROM SERVER!!!!!!!!!!!!     qx


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
socket.on('drawHands', ({users, trump}) => {
    user = users.filter(user => user.username === username)[0];
    console.log(user);
    let playerHand = $("#playerHandDiv");
    let cards = user.cards;
    console.log(cards);

    playerHand.empty();
    cards.forEach(card => {
        playerHand.append(`<img src="assets/cards/${card.img}" class="img-thumbnail rounded w-100 handCards" id="${card.ID}" style="height: 150px; max-width: 150px">
        `);
    });
    $("#trumpImg").attr("src", `assets/cards/${trump.img}`);
})

// Message from server
socket.on('cardClickedServer', ({usernameSent, cardSent}) => {
    let imgdiv = $(`#${usernameSent}`).children('img');
    console.log(usernameSent, cardSent);
    imgdiv.attr("src", cardSent.img);

    turn++;
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
        <label class="d-block my-0">${user.username} - ${playerNumber}</label>
        <div class="d-block bets"></div>
        <img src="" class="img-thumbnail rounded w-100" style="height: 150px; max-width: 150px">
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

// Clicked on Card
$('body').on('click', 'img.handCards', function() {
    // Emit a message to server
    let imgdiv = $(`#${username}`).children('img');
    let imgsrc = $(this).attr("src");
    let cardID = $(this).attr("id");
    let cardSend = {ID: cardID, img: imgsrc};
    imgdiv.attr("src", imgsrc);
    $(this).remove();
    console.log(username, cardID);
    socket.emit('cardClicked', {room, username, cardSend});
});
