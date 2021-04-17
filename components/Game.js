const { WAITING } = require("./Status");
const { _ } = require("./Token");

const Game = {
  moves: 0,
  players: {},
  status: WAITING,
  board: Array(3).fill(Array(3).fill(_))
}

module.exports = Game