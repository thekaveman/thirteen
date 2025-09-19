import { sortHand } from "./deck.js";
import { gameState, passTurn, playCards, isValidPlay } from "./game.js";
import ui from "./ui.js";
import { log } from "./utils.js";

export class Player {
  constructor(type) {
    this.type = type;
  }

  takeTurn() {
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handleCardClick(event) {
    if (this.type === "human") {
      const card = JSON.parse(event.target.dataset.card);

      // Check if the clicked card belongs to the current player's hand
      const currentPlayerHand = gameState.playerHands[gameState.currentPlayer];
      if (!currentPlayerHand.some((c) => c.rank === card.rank && c.suit === card.suit)) {
        // If the card does not belong to the current player, do nothing
        return;
      }

      const cardIndex = gameState.selectedCards.findIndex((c) => c.value === card.value);

      if (cardIndex > -1) {
        gameState.selectedCards.splice(cardIndex, 1);
      } else {
        gameState.selectedCards.push(card);
      }
      sortHand(gameState.selectedCards);
      ui.renderSelectedCards();
    }
  }

  handlePassButtonClick() {
    if (this.type === "human") {
      ui.clearMessage();
      const passSuccessful = passTurn();
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
        isValidPlay(
          gameState.selectedCards,
          gameState.playPile,
          gameState.playerHands[gameState.currentPlayer],
          gameState.currentTurn,
          gameState.playerHands
        )
      ) {
        playCards();
      } else {
        log("Invalid play", gameState.selectedCards);
        ui.displayMessage("Invalid play", "error");
      }
      ui.render();
    }
  }
}
