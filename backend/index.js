const app = require('express');
const { clearInterval } = require('timers');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: true,
    origins: ["*"]
});

const games = [];
const timers = {};

const getNextPlayer = (gameId) => {
    let i = games[gameId].currentPlayerIndex;
    i++;
    if (i === games[gameId].players.length) {
        i = 0;
    }
    return i;
}

const getWord = () => {
    return 'word' + Math.floor(Math.random() * 100);
}


const startTurn = (gameId) => {
    games[gameId].state = 'playing';
    games[gameId].turnScore = 0;
    games[gameId].timer = 1000;
    games[gameId].word = getWord();
    timers[gameId] = setInterval(() => gameTick(gameId), 1000);
    return games[gameId];
};

const turnEnded = (gameId) => {
    clearInterval(timers[gameId]);
    games[gameId].currentPlayerIndex = getNextPlayer(gameId);
    games[gameId].state = 'between_round';
}

const gameTick = (gameId) => {
    games[gameId].timer --;
    if (games[gameId].timer < 1) {
       turnEnded(gameId);
    }
    io.to(gameId).emit('gameUpdate', games[gameId]);
};

const joinTeam = (socket, gameId, playerId, team) => {
    games[gameId].players.find(player => player.id === playerId).team = team;
};

io.on("connection", (socket) => {
    console.log(" a user connected");

    socket.on('createGame', (data) => {
        const gameId = data.gameId;
        socket.join(gameId);
        games[gameId] = { players: [data.player], state: "waiting" };
        joinTeam(socket, gameId, data.player.id, 1);
        socket.playerId = data.player.id;
        socket.gameId = gameId;
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('joinGame', (data) => {
        const gameId = data.gameId;
        socket.join(gameId);
        let team1Count = games[gameId].players.filter(player => player.team === 1).length;
        let team2Count = games[gameId].players.filter(player => player.team === 2).length;
        if (team1Count > team2Count) {
            data.player.team = 2;
        } else {
            data.player.team = 1;
        }
        games[gameId].players.push(data.player);
        socket.playerId = data.player.id;
        socket.gameId = gameId;
        socket.to(gameId).emit('joinedGame', "A player joined the game!");
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('joinTeam', ({ gameId, playerId, team }) => {
        joinTeam(socket, gameId, playerId, team);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('startGame', (data) => {
        const gameId = data.gameId;
        games[gameId].players.forEach(player => {
            player.score = 0;
        });
        games[gameId].currentPlayerIndex = 0;
        games[gameId] = startTurn(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('startTurn', (data) => {
        const gameId = data.gameId;
        games[gameId] = startTurn(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('message', (data) => {
        const gameId = socket.gameId;
        io.to(gameId).emit('message', data.message);
        if (data.message === games[gameId].word) {
            games[gameId].turnScore += 1;
            games[gameId].players[games[gameId].currentPlayerIndex].score += 1;
            games[gameId].word = getWord();
            io.to(gameId).emit('gameUpdate', games[gameId]);
        }
    });

    socket.on('skipTurn', (data) => {
        const gameId = data.gameId;
        turnEnded(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('disconnect', () => {
        if (socket.gameId) {
            games[socket.gameId].players = games[socket.gameId].players.filter(player => player.id !== socket.playerId);
            io.to(socket.gameId).emit('gameUpdate', games[socket.gameId]);
        }
    });
    
    // socket.emit('message', 'Hey I just connected');

    // socket.broadcast.emit('message', 'This message is sent to everyone but the sender');

    // io.emit('This message is sent to everyone');

    // socket.join('room1');

    // socket.to('room1').emit('message', 'This message is sent to everyone in room1 except the sender'); 
    
    // io.to("room1").emit('message', 'This message is sent to everyone in room1');
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log('Server started on port ' + PORT));