const users = [];

// Join user to chat
function userJoin(id, username, room) {
    let roomUsers = getRoomUsers(room);
    var playerNumber = Object.keys(roomUsers).length;
    let bet = 0;
    let won = 0;
    let points = 0;
    let cards = [];
    const user = { id, username, room, bet, won, points, cards, playerNumber };

    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        let room = users[index].room;
        let answer = users.splice(index, 1)[0];

        usersRoom = getRoomUsers(room);
        usersRoom.forEach(function callback(user, index) {
            user.playerNumber = index;
        });

        return answer;
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function startGame(room) {
    Deck = getDeck();
    //shuffle
    shuffleArray(Deck);
    let round = 1;
    startRound(room, round);
    return trump;
}

// Get room users
function removeCard(usernameSend, cardSend) {
    const index = users.findIndex(user => user.username === usernameSend);

    let indexCard = -1;
    if (index !== -1) {
        indexCard = users[index].cards.findIndex(card => users[index].cards.ID === cardSend.ID);
    }

    if (indexCard !== -1) {
    console.log(cardSend, users[index].cards, indexCard);
    users[index].cards.splice(indexCard, 1);
    console.log(users[index].cards);
    }
}

// Get room users
function newRound(room, round) {
    Deck = getDeck();
    shuffleArray(Deck);
    startRound(room, round);
}

// Get room users
function checkTrickDone(room) {
    let cont = 0;
    for (let index = 0; index < round; index++) {
        users.filter(user => user.room === room).forEach(user => {
            user.cards.push(Deck[cont]);
            cont++;
        });
    }
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    startGame,
    removeCard,
    newRound
}

//functions that won't be exported


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startRound(room, round) {
    users.filter(user => user.room === room).forEach(user => {
        user.cards = [];
    });
    
    let cont = 0;
    for (let index = 0; index < round; index++) {
        users.filter(user => user.room === room).forEach(user => {
            user.cards.push(Deck[cont]);
            cont++;
        });
    }

    trump = Deck[cont];
}

function getDeck() {
    Deck = [];
    for (let i = 1; i <= 60; i++) {
        Deck.push({ID: i, img: `Image${i}.png`});
    }
    return Deck;
}