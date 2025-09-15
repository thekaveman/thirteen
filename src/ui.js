import { gameState, isValidPlay, passTurn, playCards } from "./game.js";

const ui = {};

/**
 * Creates a card element.
 * @param {object} card The card object.
 * @returns {HTMLElement} The card element.
 */
function createCardElement(card) {
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
}

/**
 * Renders the play area in the DOM.
 * @param {HTMLElement} playAreaDiv The div element for the play area.
 */
function renderPlayArea(playAreaDiv) {
  playAreaDiv.innerHTML = "<h2>Play Area</h2>";
  gameState.playPile.forEach((card) => {
    const cardSpan = createCardElement(card);
    playAreaDiv.appendChild(cardSpan);
  });
}

/**
 * Renders a single player's hand in the DOM.
 * @param {number} playerIndex The index of the player.
 * @param {HTMLElement} handDiv The div element to render the hand in.
 */
function renderPlayerHand(playerIndex, handDiv) {
  let text = `Player ${playerIndex + 1}`;

  if (gameState.currentPlayer === playerIndex) {
    text += " (Your Turn)";
  }
  handDiv.innerHTML = `<h2>${text}</h2>`;
  gameState.playerHands[playerIndex].forEach((card) => {
    const cardSpan = createCardElement(card);
    cardSpan.addEventListener("click", ui.handleCardClick);
    if (gameState.selectedCards.some((selectedCard) => selectedCard.value === card.value)) {
      cardSpan.classList.add("selected");
    }
    handDiv.appendChild(cardSpan);
  });
}

/**
 * Renders all player hands in the DOM.
 * @param {HTMLElement} playersHandsDiv The div element to render the hands in.
 */
function renderPlayerHands(playersHandsDiv) {
  playersHandsDiv.innerHTML = ""; // Clear the hands
  gameState.playerHands.forEach((hand, i) => {
    const playerHandDiv = document.createElement("div");
    playerHandDiv.id = `player${i}-hand`;
    playerHandDiv.classList.add("player-hand");
    playersHandsDiv.appendChild(playerHandDiv);
    renderPlayerHand(i, playerHandDiv);
  });
}

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
  console.warn("Invalid play", gameState.selectedCards);
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

  renderPlayerHands(playersHandsDiv);
  renderPlayArea(playAreaDiv);
};

export default ui;
