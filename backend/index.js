const app = require('express');
const { clearInterval } = require('timers');
const { WordHelper } = require('./util/words.js');
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
    cors: true,
    origins: ["*"]
});

const games = [];
const timers = {};
const wordHelper = new WordHelper();

const getNextPlayer = (gameId) => {
    let i = games[gameId].currentPlayerIndex;
    i++;
    if (i === games[gameId].players.length) {
        i = 0;
    }
    return i;
}

const setWord = (gameId) => {
    games[gameId].word = wordHelper.getWord();
}


const startTurn = (gameId) => {
    games[gameId].state = 'playing';
    games[gameId].turnScore = 0;
    games[gameId].timer = games[gameId].turnTime;
    setWord(gameId);
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

const joinTeam = (gameId, playerId, team) => {
    games[gameId].players.find(player => player.id === playerId).team = team;
    games[gameId].players.find(player => player.id === playerId).active = true;
    games[gameId].players.find(player => player.id === playerId).score = 0;
};

const getPlayer = (gameId, playerId) => {
    return games[gameId].players.find(player => player.id === playerId);
};

const getCurrentPlayer = (gameId) => {
    return games[gameId].players[games[gameId].currentPlayerIndex];
};

io.on("connection", (socket) => {
    console.log(" a user connected");

    socket.on('createGame', (data) => {
        const gameId = data.gameId;
        socket.join(gameId);
        games[gameId] = { players: [data.player], turnTime: data.turnTime, state: "waiting" };
        joinTeam(gameId, data.player.id, 1);
        socket.playerId = data.player.id;
        socket.gameId = gameId;
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('joinGame', (data) => {
        const gameId = data.gameId;
        if (!games[gameId]) {
            socket.emit('error', 'Error: Game does not exist');
            return;
        }
        socket.join(gameId);
        let team1Count = games[gameId].players.filter(player => player.team === 1).length;
        let team2Count = games[gameId].players.filter(player => player.team === 2).length;
        if (team1Count > team2Count) {
            data.player.team = 2;
        } else {
            data.player.team = 1;
        }
        if (games[gameId].players.filter(player => player.id === data.player.id).length === 0) {
            games[gameId].players.push(data.player);
        }
        socket.playerId = data.player.id;
        socket.gameId = gameId;
        socket.to(gameId).emit('joinedGame', "A player joined the game!");
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('joinTeam', ({ gameId, playerId, team }) => {
        joinTeam(gameId, playerId, team);
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

    socket.on('skipWord', (data) => {
        const gameId = data.gameId;
        io.to(gameId).emit('notification', { action: 'skipped', playerName: getCurrentPlayer(gameId).name, message: `skipped ${games[gameId].word.word}` });
        setWord(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('badWord', (data) => {
        const gameId = data.gameId;
        io.to(gameId).emit('notification', { action: 'wrong', playerName: getPlayer(gameId, data.playerId).name, message: `caught ${getCurrentPlayer(gameId).name} saying ${games[gameId].word.word}`});
        setWord(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('message', (data) => {
        const gameId = socket.gameId;
        if (data.message.toString().trim().toLowerCase() === games[gameId].word.word.toLowerCase()) {
            data.turnWord = true;
            io.to(gameId).emit('message', data);
            games[gameId].turnScore += 1;
            games[gameId].players[games[gameId].currentPlayerIndex].score += 1;
            io.to(gameId).emit('notification', { action: 'correct', playerName: getPlayer(gameId, data.playerId).name, message: `correctly guessed ${games[gameId].word.word}` });
            setWord(gameId);
            io.to(gameId).emit('gameUpdate', games[gameId]);
        } else {
            io.to(gameId).emit('message', data);
        }
    });

    socket.on('skipTurn', (data) => {
        const gameId = data.gameId;
        turnEnded(gameId);
        io.to(gameId).emit('gameUpdate', games[gameId]);
    });

    socket.on('disconnect', () => {
        if (socket.gameId) {
            let playerIndex = games[socket.gameId].players.map(player => player.id).indexOf(socket.playerId);
            games[socket.gameId].players[playerIndex].active = false;
            io.to(socket.gameId).emit('gameUpdate', games[socket.gameId]);
        }
    });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log('Server started on port ' + PORT));