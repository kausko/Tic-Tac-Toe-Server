var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var socketio = require('socket.io');
require("dotenv").config();
var router = require('./routes');
var GameStore = require('./Store/GameStore');
var SessionStore = require('./Store/SessionStore');
const { OVER } = require('./Components/Status');

var gameStore = new GameStore();
var sessionStore = new SessionStore();
var app = express();
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/game', router(gameStore, sessionStore));

app.set('port', process.env.PORT || 8000)

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port)
})

const io = socketio(server, { cors: { origin: process.env.ORIGIN }});

io.use((socket, next) => {
  socket.sessionID = socket.handshake.auth.sessionID;
  socket.gameID = socket.handshake.auth.gameID;
  next();
})

io.on("connection", socket => {
  console.log(socket.sessionID, "joined");
  socket.join(socket.gameID);

  socket.emit("game:update", { game: gameStore.get(socket.gameID) });

  socket.on("game:update", ({ game }) => {
    gameStore.set(socket.gameID, game);
    socket
    .to(socket.gameID)
    .emit("game:update", { game });
  })

  socket.on("disconnect", () => {
    console.log(socket.sessionID, "disconnected")
    const game = {...gameStore.get(socket.gameID)};
    gameStore.remove(socket.gameID);
    sessionStore.remove(socket.sessionID);
    if (!!game && !!game.players && game.status === "playing") {
      game.moves = game.players[socket.sessionID].token === "X" ? 0 : 1;
      game.status = OVER;
    }
    try {
      socket
      .to(socket.gameID)
      .emit("game:update", { game });
      socket.leave(socket.gameID);
    } catch (error) {
      
    }
  })

  socket.on("connect_error", console.log)
})
