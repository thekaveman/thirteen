import { Card, GameClient } from "../game/index.js";
import { UI } from "../ui.js";
import { log } from "../utils.js";
import { Player } from "./base.js";
import { PLAYER_TYPES } from "./index.js";

export class HumanPlayer extends Player {
  /**
   * Create a new HumanPlayer instance.
   * @param {GameClient} gameClient The game client instance this player uses.
   * @param {number} number The player number in the underlying game.
   * @param {UI} ui The UI class to wire this player into.
   */
  constructor(gameClient, number, ui) {
    super(PLAYER_TYPES.HUMAN, gameClient, number);
    this.ui = ui;
  }

  takeTurn() {
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handleCardClick(event) {
    const card = Card.parse(event.target.dataset.card);

    // Check if the clicked card belongs to the current player's hand
    const currentPlayerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex());
    if (!currentPlayerHand.some((c) => c.rank === card.rank && c.suit === card.suit)) {
      // If the card does not belong to the current player, do nothing
      return;
    }

    this.gameClient.toggleCardSelection(card);
    this.ui.renderSelectedCards();
  }

  handlePassButtonClick() {
    this.ui.clearMessage();
    const passSuccessful = this.gameClient.pass();
    if (!passSuccessful) {
      this.ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    this.ui.render();
  }

  handlePlayButtonClick() {
    this.ui.clearMessage();
    const selectedCards = this.gameClient.getSelectedCards();
    const playerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex());
    const playPile = this.gameClient.getPlayPile();
    const currentTurn = this.gameClient.getCurrentTurn();
    const allPlayerHands = this.gameClient.getPlayerHands();
    if (this.gameClient.isValidPlay(selectedCards, playPile, playerHand, currentTurn, allPlayerHands)) {
      this.gameClient.play(selectedCards);
    } else {
      log("Invalid play", selectedCards);
      this.ui.displayMessage("Invalid play", "error");
    }
    this.ui.render();
  }
}
