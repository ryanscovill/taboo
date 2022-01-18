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
    let i = games[gameId].currentPlayer;
    i++;
    if (i === games[gameId].players.length) {
        i = 0;
    }
    return i;
}

const startRound = (gameId) => {
    games[gameId].timer = 10;
    timers[gameId] = setInterval(() => gameTick(gameId), 1000);
    return games[gameId];
};

const gameTick = (gameId) => {
    games[gameId].timer --;
    if (games[gameId].timer < 1) {
        clearInterval(timers[gameId]);
        games[gameId].currentPlayer = getNextPlayer(gameId);
        games[gameId].state = 'between_round';
    }
    io.to(gameId).emit('gameUpdate', games[gameId]);
};

io.on("connection", (socket) => {
    console.log(" a user connected");

    socket.on('createGame', (data) => {
        const gameId = data.gameId;
        socket.join(gameId);
        data.player.team = 1;
        games[gameId] = { players: [data.player], state: "waiting" };
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
        games[gameId].players.find(player => player.id === playerId).team = team;
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('startGame', (data) => {
        const gameId = data.gameId;
        games[gameId].state = "playing";
        games[gameId].players.forEach(player => {
            player.score = 0;
        });
        games[gameId].currentPlayer = 0;
        games[gameId] = startRound(gameId);
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