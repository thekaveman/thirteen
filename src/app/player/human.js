import { GameClient } from "../game/index.js";
import { log } from "../utils.js";
import { Player } from "./base.js";
import { PLAYER_TYPES } from "./index.js";

export class HumanPlayer extends Player {
  /**
   * Create a new HumanPlayer instance.
   * @param {GameClient} gameClient The game client instance this player uses.
   * @param {number} number The player number in the underlying game.
   */
  constructor(gameClient, number) {
    super(PLAYER_TYPES.HUMAN, gameClient, number);
  }

  takeTurn() {
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handlePassButtonClick() {
    this.gameClient.pass();
  }

  handlePlayButtonClick() {
    const selectedCards = this.gameClient.getSelectedCards();
    const playerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex());
    const playPile = this.gameClient.getPlayPile();
    const currentTurn = this.gameClient.getCurrentTurn();
    const allPlayerHands = this.gameClient.getPlayerHands();
    if (this.gameClient.isValidPlay(selectedCards, playPile, playerHand, currentTurn, allPlayerHands)) {
      this.gameClient.play(selectedCards);
    } else {
      log("Invalid play", selectedCards);
    }
  }
}
