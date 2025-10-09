import { Game } from "./game.js";

export class GameClient {
  /**
   * Creates a new GameClient instance.
   * @param {Game} game The game instance to interact with.
   */
  constructor(game) {
    this.game = game;
  }
}
