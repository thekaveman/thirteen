import { log } from "./utils.js";

export class UI {
  constructor(game) {
    this.game = game;
    this.id = {
      gameMessages: "game-messages",
      playersHands: "players-hands",
      playArea: "play-area",
      gameContent: "game-content",
      playButton: "play-button",
      passButton: "pass-button",
      newGameButton: "new-game-button",
    };
    this.messageTimeout = null;

    // Initialize DOM-related properties to null
    this.gameMessages = null;
    this.playersHands = null;
    this.playArea = null;
    this.gameContent = null;
    this.playButton = null;
    this.passButton = null;
    this.newGameButton = null;
  }

  /**
   * Initializes elements in the ui object.
   * @param {object} game The game instance.
   */
  init(game) {
    this.game = game;
    if (typeof document !== "undefined") {
      this.gameMessages = document.getElementById(this.id.gameMessages);
      this.playersHands = document.getElementById(this.id.playersHands);
      this.playArea = document.getElementById(this.id.playArea);
      this.gameContent = document.getElementById(this.id.gameContent);
      this.playButton = document.getElementById(this.id.playButton);
      this.passButton = document.getElementById(this.id.passButton);
      this.newGameButton = document.getElementById(this.id.newGameButton);
    }
  }

  /**
   * Displays a message to the user.
   * @param {string} message The message to display.
   * @param {string} type The type of message (e.g., "error", "info").
   */
  displayMessage(message, type) {
    log(`displayMessage: ${message}, type: ${type}`);
    if (this.gameMessages) {
      this.gameMessages.textContent = message;
      this.gameMessages.classList.add(type);
      this.gameMessages.classList.add("visible");
      clearTimeout(this.messageTimeout);
      this.messageTimeout = setTimeout(() => {
        this.clearMessage();
      }, 3000); // Clear message after 3 seconds
    }
  }

  /**
   * Clears the displayed message.
   */
  clearMessage() {
    if (this.gameMessages) {
      this.gameMessages.textContent = "";
      this.gameMessages.className = "";
      this.gameMessages.classList.remove("visible");
    }
  }

  /**
   * Creates a card element.
   * @param {object} card The card object.
   * @returns {HTMLElement} The card element.
   */
  createCardElement(card) {
    if (typeof document === "undefined") {
      // Mock for Node.js environment
      return { classList: { add: () => {}, remove: () => {} }, dataset: {}, addEventListener: () => {} };
    }
    const cardSpan = document.createElement("span");
    cardSpan.textContent = `${card.rank}${card.suit}`;
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
   * Renders the entire game state in the DOM.
   */
  render() {
    this.renderPlayArea();
    this.renderPlayerHands();
    this.updateButtonStates();
  }

  /**
   * Renders cards to a target element.
   * @param {Array<object>} card The array of cards.
   * @param {HTMLElement} targetElement The element in which to render.
   * @param {(cardSpan:HTMLElement, card:object) => void} preRender An optional function to run on each card element before rendering.
   */
  renderCardsContainer(cards, targetElement, preRender = null) {
    if (typeof document === "undefined") {
      // Mock for Node.js environment
      return;
    }
    const cardsContainer = document.createElement("div");
    cardsContainer.classList.add("cards-container");
    targetElement.appendChild(cardsContainer);

    cards.forEach((card) => {
      const cardSpan = this.createCardElement(card);
      if (preRender != null) {
        preRender(cardSpan, card);
      }
      cardsContainer.appendChild(cardSpan);
    });
  }

  /**
   * Renders the play area in the DOM.
   */
  renderPlayArea() {
    if (this.gameContent) {
      this.gameContent.innerHTML = `<h2>Play Area (Round ${this.game.gameState.roundNumber})</h2>`;
      this.renderCardsContainer(this.game.gameState.playPile, this.gameContent);
    }
  }

  /**
   * Renders a single player's hand in the DOM.
   * @param {number} playerIndex The index of the player.
   * @param {HTMLElement} handDiv The div element to render the hand in.
   */
  renderPlayerHand(playerIndex, handDiv) {
    let text = `Player ${playerIndex + 1}`;

    if (this.game.gameState.gameOver && this.game.gameState.playerHands[playerIndex].length === 0) {
      this.displayMessage(`${text} wins in ${this.game.gameState.roundNumber} rounds`, "info");
      text += " (Winner!)";
    } else if (this.game.gameState.currentPlayer === playerIndex) {
      text += " (Your Turn)";
    }
    if (handDiv) {
      handDiv.innerHTML = `<h2>${text}</h2>`;
    }

    if (typeof document !== "undefined") {
      const gamesWonEl = document.createElement("p");
      gamesWonEl.classList.add("games-won");
      gamesWonEl.textContent = `Games won: ${this.game.gameState.gamesWon[playerIndex]}`;
      if (handDiv) handDiv.appendChild(gamesWonEl);

      const roundsWonEl = document.createElement("p");
      roundsWonEl.classList.add("rounds-won");
      roundsWonEl.textContent = `Rounds won: ${this.game.gameState.roundsWon[playerIndex]}`;
      if (handDiv) handDiv.appendChild(roundsWonEl);
    }

    const preRender = (cardSpan, card) => {
      const currentPlayer = this.game.gameState.players[playerIndex];
      if (playerIndex === this.game.gameState.currentPlayer && currentPlayer.type === "human") {
        if (cardSpan && cardSpan.addEventListener) {
          cardSpan.addEventListener("click", currentPlayer.handleCardClick.bind(currentPlayer));
        }
      }
      if (this.game.gameState.selectedCards.some((selectedCard) => selectedCard.value === card.value)) {
        if (cardSpan) cardSpan.classList.add("selected");
      }
    };
    const playerHand = this.game.gameState.playerHands[playerIndex];
    this.renderCardsContainer(playerHand, handDiv, preRender);

    if (typeof document !== "undefined") {
      const cardCountEl = document.createElement("p");
      cardCountEl.classList.add("card-count");
      cardCountEl.textContent = `Cards remaining: ${playerHand.length}`;
      if (handDiv) handDiv.appendChild(cardCountEl);
    }
  }

  /**
   * Renders all player hands in the DOM.
   */
  renderPlayerHands() {
    if (this.playersHands) {
      this.playersHands.innerHTML = ""; // Clear the hands
      this.game.gameState.playerHands.forEach((hand, i) => {
        if (typeof document !== "undefined") {
          const playerHandDiv = document.createElement("div");
          playerHandDiv.id = `player-hand-${i}`;
          playerHandDiv.classList.add("player-hand");
          if (i === this.game.gameState.currentPlayer) {
            playerHandDiv.classList.add("current");
          }
          this.playersHands.appendChild(playerHandDiv);
          this.renderPlayerHand(i, playerHandDiv);
        }
      });
    }
  }

  /**
   * Updates the state of the play, pass, and new game buttons.
   */
  updateButtonStates() {
    if (this.game.gameState.gameOver) {
      if (this.playButton) this.playButton.disabled = true;
      if (this.passButton) this.passButton.disabled = true;
      if (this.newGameButton) this.newGameButton.style.display = "block";
    } else {
      if (this.playButton) this.playButton.disabled = false;
      if (this.passButton) this.passButton.disabled = false;
      if (this.newGameButton) this.newGameButton.style.display = "none";
    }
  }

  /**
   * Updates the 'selected' class on all card DOM elements in the current player's hand
   * based on the game's selectedCards.
   */
  renderSelectedCards() {
    if (typeof document === "undefined") {
      return;
    }
    const currentPlayerHandDiv = document.getElementById(`player-hand-${this.game.gameState.currentPlayer}`);
    if (!currentPlayerHandDiv) {
      return;
    }

    const cardElements = currentPlayerHandDiv.querySelectorAll(".card");
    cardElements.forEach((cardEl) => {
      const card = JSON.parse(cardEl.dataset.card);
      const isSelected = this.game.gameState.selectedCards.some(
        (selectedCard) => selectedCard.rank === card.rank && selectedCard.suit === card.suit
      );

      if (isSelected) {
        cardEl.classList.add("selected");
      } else {
        cardEl.classList.remove("selected");
      }
    });
  }
}

export default UI;
