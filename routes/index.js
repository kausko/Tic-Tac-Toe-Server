const { Router } = require("express");
const { CHOOSING, WAITING } = require("../components/Status");
const GameStore = require("../Store/GameStore");
const SessionStore = require("../Store/SessionStore");
const { _ } = require("../components/Token")
/**
 * @param  {GameStore} gameStore
 * @param  {SessionStore} sessionStore
 */
module.exports = (gameStore, sessionStore) => Router()
.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "content-type")
  next()
})
.post('/', (req, res, _next) => {
  const sessionID = sessionStore.generate();
  sessionStore.insert(sessionID);
  const gameID = gameStore.generate();
  gameStore.set(gameID, {
    moves: 0,
    players: {
      [sessionID]: {
          type: "challenger",
          token: _
        }
    },
    status: WAITING,
    board: Array(3).fill(Array(3).fill(_))
  })
  res.status(200).json({ sessionID, gameID });
})
.put('/', (req, res, _next) => {
  const sessionID = sessionStore.generate();
  const gameID = req.body.gameID;
  let game = gameStore.get(gameID);

  if (!game)
    throw new Error('Game not found');
  if (game.status !== "waiting")
    throw new Error("Game already underway");
  // game.players[sessionID] = _;
  const challenger = Object.keys(game.players)[0];
  game.players[sessionID] = {
    type: "challengee",
    token: _,
    opponent: challenger
  }
  game.players[challenger].opponent = sessionID;
  game.status = CHOOSING;

  gameStore.set(gameID, game);
  res.status(200).json({ sessionID, gameID });
})