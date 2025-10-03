import { PLAYER_TYPES } from "../constants.js";
import { Card } from "../deck.js";
import { log } from "../utils.js";
import { Player } from "./base.js";

export class HumanPlayer extends Player {
  constructor(game, number, ui) {
    super(PLAYER_TYPES.HUMAN, game, number);
    this.ui = ui;
  }

  takeTurn() {
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handleCardClick(event) {
    const card = Card.parse(event.target.dataset.card);

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
    Card.sort(this.game.gameState.selectedCards);
    this.ui.renderSelectedCards();
  }

  handlePassButtonClick() {
    this.ui.clearMessage();
    const passSuccessful = this.game.passTurn();
    if (!passSuccessful) {
      this.ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    this.ui.render();
  }

  handlePlayButtonClick() {
    this.ui.clearMessage();
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
      this.ui.displayMessage("Invalid play", "error");
    }
    this.ui.render();
  }
}
