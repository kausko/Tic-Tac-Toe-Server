const crypto = require("crypto");
const Game = require("../components/Game");
const Token = require("../components/Token");

class GameStore {

  constructor() {
    /**
     * @type {Map<string, Game>}
     */
    this.games = new Map();
  }
  
  /**
   * @param  {string} id
   */
  get(id) {
    return this.games.get(id);
  }

  /**
   * @param  {string} id
   * @param  {Game} game
   */
  set(id, game) {
    return this.games.set(id, game);
  }

  /**
   * @param  {string} id
   */
  remove(id) {
    return this.games.delete(id)
  }

  /**
   * @param  {string} sessionID
   */
  generate() {
    let id = crypto.randomBytes(3).toString("hex").slice(1);
    if (this.games.has(id))
      id = this.generate();
    // const newGame = {...Game}
    // newGame.players[sessionID] = {
    //   type: "challenger",
    //   token: Token._
    // }
    // this.set(id, newGame)
    return id;
  }
}

module.exports = GameStore
