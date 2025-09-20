import { sortHand } from "./deck.js";
import ui from "./ui.js";
import { log } from "./utils.js";

export class Player {
  /**
   * @param {string} type The type of player (human or ai).
   * @param {object} game The game instance.
   * @param {object} ai The AI instance if the player is an AI.
   */
  constructor(type, game, ai = null) {
    this.type = type;
    this.game = game;
    this.ai = ai;
  }

  takeTurn() {
    if (this.type === "ai" && this.ai) {
      const playerHand = this.game.gameState.playerHands[this.game.gameState.currentPlayer];
      const playPile = this.game.gameState.playPile;
      const currentTurn = this.game.gameState.currentTurn;
      const allPlayerHands = this.game.gameState.playerHands;
      return this.ai.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    }
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handleCardClick(event) {
    if (this.type === "human") {
      const card = JSON.parse(event.target.dataset.card);

      // Check if the clicked card belongs to the current player's hand
      const currentPlayerHand = this.game.gameState.playerHands[this.game.gameState.currentPlayer];
      if (!currentPlayerHand.some((c) => c.rank === card.rank && c.suit === card.suit)) {
        // If the card does not belong to the current player, do nothing
        return;
      }

      const cardIndex = this.game.gameState.selectedCards.findIndex((c) => c.value === card.value);

      if (cardIndex > -1) {
        this.game.gameState.selectedCards.splice(cardIndex, 1);
      } else {
        this.game.gameState.selectedCards.push(card);
      }
      sortHand(this.game.gameState.selectedCards);
      ui.renderSelectedCards();
    }
  }

  handlePassButtonClick() {
    if (this.type === "human") {
      ui.clearMessage();
      const passSuccessful = this.game.passTurn();
      if (!passSuccessful) {
        ui.displayMessage("You cannot pass on the first play of a round.", "error");
      }
      ui.render();
    }
  }

  handlePlayButtonClick() {
    if (this.type === "human") {
      ui.clearMessage();
      if (
        this.game.isValidPlay(
          this.game.gameState.selectedCards,
          this.game.gameState.playPile,
          this.game.gameState.playerHands[this.game.gameState.currentPlayer],
          this.game.gameState.currentTurn,
          this.game.gameState.playerHands
        )
      ) {
        this.game.playCards();
      } else {
        log("Invalid play", this.game.gameState.selectedCards);
        ui.displayMessage("Invalid play", "error");
      }
      ui.render();
    }
  }
}
