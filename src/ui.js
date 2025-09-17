import { gameState, handContainsCard, isValidPlay, passTurn, playCards } from "./game.js";
import { log } from "./utils.js";

const ui = {
  id: {
    gameMessages: "game-messages",
    playersHands: "players-hands",
    playArea: "play-area",
    gameContent: "game-content",
    playButton: "play-button",
    passButton: "pass-button",
    newGameButton: "new-game-button",
  },
};

let messageTimeout;

/**
 * Displays a message to the user.
 * @param {string} message The message to display.
 * @param {string} type The type of message (e.g., "error", "info").
 */
ui.displayMessage = function (message, type) {
  console.log(`displayMessage: ${message}, type: ${type}`);
  const messageEl = document.createElement("p");
  messageEl.textContent = message;
  ui.gameMessages.classList.add(type);
  ui.gameMessages.appendChild(messageEl);
  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    ui.clearMessage();
  }, 3000); // Clear message after 3 seconds
};

/**
 * Clears the displayed message.
 */
ui.clearMessage = function () {
  console.log("clearMessage called");
  ui.gameMessages.textContent = "";
  ui.gameMessages.className = "";
};

/**
 * Creates a card element.
 * @param {object} card The card object.
 * @returns {HTMLElement} The card element.
 */
ui.createCardElement = function (card) {
  const cardSpan = document.createElement("span");
  cardSpan.textContent = `${card.rank}${card.suit} `;
  cardSpan.classList.add("card");
  if (["♦", "♥"].includes(card.suit)) {
    cardSpan.classList.add("red");
  } else {
    cardSpan.classList.add("black");
  }
  cardSpan.dataset.card = JSON.stringify(card);
  return cardSpan;
};

/**
 * Handles the click event on a card.
 * @param {Event} event The click event.
 */
ui.handleCardClick = function (event) {
  const card = JSON.parse(event.target.dataset.card);

  // Check if the clicked card belongs to the current player's hand
  const currentPlayerHand = gameState.playerHands[gameState.currentPlayer];
  if (!handContainsCard(currentPlayerHand, card)) {
    // If the card does not belong to the current player, do nothing
    return;
  }

  const cardIndex = gameState.selectedCards.findIndex((c) => c.value === card.value);

  if (cardIndex > -1) {
    gameState.selectedCards.splice(cardIndex, 1);
    event.target.classList.remove("selected");
  } else {
    gameState.selectedCards.push(card);
    event.target.classList.add("selected");
  }
};

/**
 * Handles an invalid play.
 */
ui.handleInvalidPlay = function () {
  log("Invalid play", gameState.selectedCards);
  ui.displayMessage("Invalid play", "error");
};

/**
 * Handles the pass button click event.
 */
ui.handlePassButtonClick = function () {
  ui.clearMessage();
  const passSuccessful = passTurn();
  if (!passSuccessful) {
    ui.displayMessage("You cannot pass on the first play of a round.", "error");
  }
  ui.render();
};

/**
 * Handles the play button click event.
 */
ui.handlePlayButtonClick = function () {
  ui.clearMessage();
  if (isValidPlay(gameState.selectedCards, gameState.playPile)) {
    playCards();
  } else {
    ui.handleInvalidPlay();
  }
  ui.render();
};

/**
 * Initializes elements in the ui object.
 */
ui.init = function () {
  ui.gameMessages = document.getElementById(ui.id.gameMessages);
  ui.playersHands = document.getElementById(ui.id.playersHands);
  ui.playArea = document.getElementById(ui.id.playArea);
  ui.gameContent = document.getElementById(ui.id.gameContent);
  ui.playButton = document.getElementById(ui.id.playButton);
  ui.passButton = document.getElementById(ui.id.passButton);
  ui.newGameButton = document.getElementById(ui.id.newGameButton);
};

/**
 * Renders the entire game state in the DOM.
 */
ui.render = function () {
  ui.renderPlayArea();
  ui.renderPlayerHands();
  ui.updateButtonStates();
};

/**
 * Renders cards to a target element.
 * @param {Array<object>} card The array of cards.
 * @param {HTMLElement} targetElement The element in which to render.
 * @param {Function} preRender An optional function to run on each card element before rendering.
 */
ui.renderCardsContainer = function (cards, targetElement, preRender = null) {
  const cardsContainer = document.createElement("div");
  cardsContainer.classList.add("cards-container");
  targetElement.appendChild(cardsContainer);

  cards.forEach((card) => {
    const cardSpan = ui.createCardElement(card);
    if (preRender != null) {
      preRender(cardSpan);
    }
    cardsContainer.appendChild(cardSpan);
  });
};

/**
 * Renders the play area in the DOM.
 */
ui.renderPlayArea = function () {
  ui.gameContent.innerHTML = `<h2>Play Area (Round ${gameState.roundNumber})</h2>`;
  ui.renderCardsContainer(gameState.playPile, ui.gameContent);
};

/**
 * Renders a single player's hand in the DOM.
 * @param {number} playerIndex The index of the player.
 * @param {HTMLElement} handDiv The div element to render the hand in.
 */
ui.renderPlayerHand = function (playerIndex, handDiv) {
  let text = `Player ${playerIndex + 1}`;

  if (gameState.gameOver && gameState.playerHands[playerIndex].length === 0) {
    text += " (Winner!)";
  } else if (gameState.currentPlayer === playerIndex) {
    text += " (Your Turn)";
  }
  handDiv.innerHTML = `<h2>${text}</h2>`;

  const gamesWonEl = document.createElement("p");
  gamesWonEl.classList.add("games-won");
  gamesWonEl.textContent = `Games won: ${gameState.gamesWon[playerIndex]}`;
  handDiv.appendChild(gamesWonEl);

  const roundsWonEl = document.createElement("p");
  roundsWonEl.classList.add("rounds-won");
  roundsWonEl.textContent = `Rounds won: ${gameState.roundsWon[playerIndex]}`;
  handDiv.appendChild(roundsWonEl);

  const preRender = function (cardSpan) {
    if (playerIndex === gameState.currentPlayer) {
      cardSpan.addEventListener("click", ui.handleCardClick);
    }
    if (gameState.selectedCards.some((selectedCard) => selectedCard.value === card.value)) {
      cardSpan.classList.add("selected");
    }
  };

  ui.renderCardsContainer(gameState.playerHands[playerIndex], handDiv, preRender);
};

/**
 * Renders all player hands in the DOM.
 */
ui.renderPlayerHands = function () {
  ui.playersHands.innerHTML = ""; // Clear the hands
  gameState.playerHands.forEach((hand, i) => {
    const playerHandDiv = document.createElement("div");
    playerHandDiv.id = `player${i}-hand`;
    playerHandDiv.classList.add("player-hand");
    if (i === gameState.currentPlayer) {
      playerHandDiv.classList.add("current");
    }
    ui.playersHands.appendChild(playerHandDiv);
    ui.renderPlayerHand(i, playerHandDiv);
  });
};

/**
 * Updates the state of the play, pass, and new game buttons.
 */
ui.updateButtonStates = function () {
  if (gameState.gameOver) {
    ui.playButton.disabled = true;
    ui.passButton.disabled = true;
    ui.newGameButton.style.display = "block";
  } else {
    ui.playButton.disabled = false;
    ui.passButton.disabled = false;
    ui.newGameButton.style.display = "none";
  }
};

export default ui;
