const users = [];
let trump = [];

// Join user to chat
function userJoin(id, username, room) {
    let bet = 0;
    let won = 0;
    let points = 0;
    let cards = [];
    const user = { id, username, room, bet, won, points, cards };

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
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

function startGame(room) {
    Deck = [];
    for (let i = 1; i <= 60; i++) {
        Deck.push({ID: i, img: `Image${i}.png`});
    }
    //shuffle
    shuffleArray(Deck);
    console.log(Deck);
    round = 1;
    startRound(room);
    return trump;
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
    startGame
}

//functions that won't be exported


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function startRound(room) {
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