import { gameState, passTurn, playCards, isValidPlay, sortHand } from "./game.js";
import ui from "./ui.js";
import { log } from "./utils.js";

const humanPlayer = {
  handleCardClick: function (event) {
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
  },

  handlePassButtonClick: function () {
    ui.clearMessage();
    const passSuccessful = passTurn();
    if (!passSuccessful) {
      ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    ui.render();
  },

  handlePlayButtonClick: function () {
    ui.clearMessage();
    if (isValidPlay(gameState.selectedCards, gameState.playPile, gameState.playerHands[gameState.currentPlayer])) {
      playCards();
    } else {
      log("Invalid play", gameState.selectedCards);
      ui.displayMessage("Invalid play", "error");
    }
    ui.render();
  },
};

export default humanPlayer;
