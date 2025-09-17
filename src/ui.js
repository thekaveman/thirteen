import { gameState } from "./game.js";
import { log } from "./utils.js";
import humanPlayer from "./ui-human.js";

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
  ui.gameMessages.textContent = message;
  ui.gameMessages.classList.add(type);
  ui.gameMessages.classList.add("visible");
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
  ui.gameMessages.classList.remove("visible");
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
 * @param {(cardSpan:HTMLElement, card:object) => void} preRender An optional function to run on each card element before rendering.
 */
ui.renderCardsContainer = function (cards, targetElement, preRender = null) {
  const cardsContainer = document.createElement("div");
  cardsContainer.classList.add("cards-container");
  targetElement.appendChild(cardsContainer);

  cards.forEach((card) => {
    const cardSpan = ui.createCardElement(card);
    if (preRender != null) {
      preRender(cardSpan, card);
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
    ui.displayMessage(`${text} wins in ${gameState.roundNumber} rounds`, "info");
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

  const preRender = function (cardSpan, card) {
    if (playerIndex === gameState.currentPlayer) {
      cardSpan.addEventListener("click", humanPlayer.handleCardClick);
    }
    if (gameState.selectedCards.some((selectedCard) => selectedCard.value === card.value)) {
      cardSpan.classList.add("selected");
    }
  };
  const playerHand = gameState.playerHands[playerIndex];
  ui.renderCardsContainer(playerHand, handDiv, preRender);

  const cardCountEl = document.createElement("p");
  cardCountEl.classList.add("card-count");
  cardCountEl.textContent = `Cards remaining: ${playerHand.length}`;
  handDiv.appendChild(cardCountEl);
};

/**
 * Renders all player hands in the DOM.
 */
ui.renderPlayerHands = function () {
  ui.playersHands.innerHTML = ""; // Clear the hands
  gameState.playerHands.forEach((hand, i) => {
    const playerHandDiv = document.createElement("div");
    playerHandDiv.id = `player-hand-${i}`;
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

/**
 * Updates the 'selected' class on all card DOM elements in the current player's hand
 * based on the gameState.selectedCards array.
 */
ui.renderSelectedCards = function () {
  const currentPlayerHandDiv = document.getElementById(`player-hand-${gameState.currentPlayer}`);
  if (!currentPlayerHandDiv) {
    return;
  }

  const cardElements = currentPlayerHandDiv.querySelectorAll(".card");
  cardElements.forEach((cardEl) => {
    const card = JSON.parse(cardEl.dataset.card);
    const isSelected = gameState.selectedCards.some(
      (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
    );

    if (isSelected) {
      cardEl.classList.add("selected");
    } else {
      cardEl.classList.remove("selected");
    }
  });
};

export default ui;
