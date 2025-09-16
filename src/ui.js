import { gameState, isValidPlay, passTurn, playCards } from "./game.js";
import { log } from "./utils.js";

const ui = {};

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
  alert("Invalid play");
};

/**
 * Handles the pass button click event.
 */
ui.handlePassButtonClick = function () {
  const passSuccessful = passTurn();
  if (!passSuccessful) {
    alert("You cannot pass on the first play of a round.");
  }
  ui.render();
};

/**
 * Handles the play button click event.
 */
ui.handlePlayButtonClick = function () {
  if (isValidPlay(gameState.selectedCards, gameState.playPile)) {
    playCards();
  } else {
    ui.handleInvalidPlay();
  }
  // Re-render the game
  ui.render();
};

/**
 * Renders the entire game state in the DOM.
 */
ui.render = function () {
  const playersHandsDiv = document.getElementById("players-hands");
  const playAreaDiv = document.getElementById("play-area");

  ui.renderPlayerHands(playersHandsDiv);
  ui.renderPlayArea(playAreaDiv);
  ui.updateButtonStates();
};

/**
 * Renders the play area in the DOM.
 * @param {HTMLElement} playAreaDiv The div element for the play area.
 */
ui.renderPlayArea = function (playAreaDiv) {
  playAreaDiv.innerHTML = `<h2>Play Area (Round ${gameState.roundNumber})</h2>`;
  gameState.playPile.forEach((card) => {
    const cardSpan = ui.createCardElement(card);
    playAreaDiv.appendChild(cardSpan);
  });
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

  gameState.playerHands[playerIndex].forEach((card) => {
    const cardSpan = ui.createCardElement(card);
    cardSpan.addEventListener("click", ui.handleCardClick);
    if (gameState.selectedCards.some((selectedCard) => selectedCard.value === card.value)) {
      cardSpan.classList.add("selected");
    }
    handDiv.appendChild(cardSpan);
  });
};

/**
 * Renders all player hands in the DOM.
 * @param {HTMLElement} playersHandsDiv The div element to render the hands in.
 */
ui.renderPlayerHands = function (playersHandsDiv) {
  playersHandsDiv.innerHTML = ""; // Clear the hands
  gameState.playerHands.forEach((hand, i) => {
    const playerHandDiv = document.createElement("div");
    playerHandDiv.id = `player${i}-hand`;
    playerHandDiv.classList.add("player-hand");
    if (i === gameState.currentPlayer) {
      playerHandDiv.classList.add("current");
    }
    playersHandsDiv.appendChild(playerHandDiv);
    ui.renderPlayerHand(i, playerHandDiv);
  });
};

/**
 * Updates the state of the play, pass, and new game buttons.
 */
ui.updateButtonStates = function () {
  const playButton = document.getElementById("play-button");
  const passButton = document.getElementById("pass-button");
  const newGameButton = document.getElementById("new-game-button");

  if (gameState.gameOver) {
    playButton.disabled = true;
    passButton.disabled = true;
    newGameButton.style.display = "block";
  } else {
    playButton.disabled = false;
    passButton.disabled = false;
    newGameButton.style.display = "none";
  }
};

export default ui;
