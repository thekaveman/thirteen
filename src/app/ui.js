import { AI_PERSONAS } from "./ai/personas.js";
import { Card, Game, COMBINATION_TYPES } from "./game/index.js";
import { PLAYER_TYPES } from "./player/index.js";
import { log } from "./utils.js";

export class UI {
  /**
   * Initialize a new UI instance.
   * @param {Game} game The Game instance for this UI.
   */
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
      startGameButton: "start-game-button",
      resetButton: "reset-button",
      aiSelection: "ai-selection",
      aiDropdown: "ai-dropdown",
      aiDescription: "ai-description",
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
    this.startGameButton = null;
    this.resetButton = null;
    this.aiSelection = null;
    this.aiDropdown = null;
    this.aiDescription = null;
  }

  /**
   * Initializes elements in the ui object.
   * @param {Game} game The game instance.
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
      this.startGameButton = document.getElementById(this.id.startGameButton);
      this.resetButton = document.getElementById(this.id.resetButton);
      this.aiSelection = document.createElement("div");
      this.aiSelection.id = this.id.aiSelection;
      this.aiDropdown = document.createElement("select");
      this.aiDropdown.id = this.id.aiDropdown;
      this.aiDescription = document.createElement("p");
      this.aiDescription.id = this.id.aiDescription;
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
   * Returns a character-based indicator for the given combination type.
   * @param {string} combinationType The combination type (e.g., COMBINATION_TYPES.SINGLE).
   * @returns {string} The character indicator.
   */
  getCombinationTypeIndicator(combinationType) {
    switch (combinationType) {
      case COMBINATION_TYPES.SINGLE:
        return "🃏";
      case COMBINATION_TYPES.PAIR:
        return "🃏🃏";
      case COMBINATION_TYPES.TRIPLE:
        return "🃏🃏🃏";
      case COMBINATION_TYPES.STRAIGHT:
        return "🪜";
      case COMBINATION_TYPES.FOUR_OF_A_KIND:
        return "💣"; // Bomb indicator for Four of a Kind
      case COMBINATION_TYPES.CONSECUTIVE_PAIRS:
        return "💣"; // Bomb indicator for Consecutive Pairs
      default:
        return "🟢"; // Default for an open play pile
    }
  }

  /**
   * Creates a card element.
   * @param {Card} card The card object.
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
   * Creates and renders the AI selection UI.
   * @param {HTMLElement} parentElement The element to append the UI to.
   */
  renderAISelection(parentElement) {
    if (typeof document === "undefined" || !parentElement) {
      return;
    }
    this.aiSelection.innerHTML = "";
    this.aiDropdown.innerHTML = "";
    this.aiDescription.innerHTML = "";

    const label = document.createElement("label");
    label.htmlFor = this.id.aiDropdown;
    label.textContent = "Select AI opponent:";
    this.aiSelection.appendChild(label);

    for (const [key, persona] of Object.entries(AI_PERSONAS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${persona.icon} ${persona.friendly_name}`;
      this.aiDropdown.appendChild(option);
    }

    // Add event listener for changes
    this.aiDropdown.onchange = (event) => {
      const selectedPersonaKey = event.target.value;
      this.game.gameState.playerPersonas[1] = selectedPersonaKey;
      if (this.game.players && this.game.players[1]) {
        this.game.players[1].ai.persona = selectedPersonaKey;
      }
      this.updateAIDescription(selectedPersonaKey);
      const playerHandDiv = document.getElementById("player-hand-1");
      const h2 = playerHandDiv.querySelector("h2");
      h2.textContent = `Player 2 (${AI_PERSONAS[selectedPersonaKey].icon} ${AI_PERSONAS[selectedPersonaKey].friendly_name})`;
    };

    this.aiSelection.appendChild(this.aiDropdown);
    this.aiSelection.appendChild(this.aiDescription);
    parentElement.appendChild(this.aiSelection);

    // Set initial selection based on game state
    const currentAIPersona = this.game.gameState.playerPersonas[1];
    if (currentAIPersona) {
      this.aiDropdown.value = currentAIPersona;
      this.updateAIDescription(currentAIPersona);
    } else {
      // Default option if none is set
      this.aiDropdown.value = "random";
      this.updateAIDescription("random");
    }
  }

  /**
   * Renders cards to a target element.
   * @param {Array<Card>} cards The array of cards.
   * @param {HTMLElement} targetElement The element in which to render.
   * @param {(cardSpan:HTMLElement, card:Card) => void} preRender An optional function to run on each card element before rendering.
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
      const combinationType = this.game.rules.getCombinationType(this.game.gameState.playPile);
      const indicator = this.getCombinationTypeIndicator(combinationType);
      this.gameContent.innerHTML = `<h2>Play Area (Round ${this.game.gameState.roundNumber}) <span class="combination-type">${indicator}</span></h2>`;
      this.renderCardsContainer(this.game.gameState.playPile, this.gameContent);
    }
  }

  /**
   * Renders a single player's hand in the DOM.
   * @param {number} playerIndex The index of the player.
   * @param {HTMLElement} handDiv The div element to render the hand in.
   */
  renderPlayerHand(playerIndex, handDiv) {
    const player = this.game.gameState.players[playerIndex];
    let text = `Player ${playerIndex + 1}`;

    if (player.type === PLAYER_TYPES.AI) {
      const persona = player.ai.persona;
      text += persona ? ` (${AI_PERSONAS[persona].icon} ${AI_PERSONAS[persona].friendly_name})` : " (AI)";
    }

    if (this.game.gameState.gameOver && this.game.gameState.playerHands[playerIndex].length === 0) {
      this.displayMessage(`${text} wins in ${this.game.gameState.roundNumber} rounds`, "info");
      text += " (Winner!)";
    } else if (this.game.gameState.currentPlayer === playerIndex) {
      text += " (Your Turn)";
    }
    if (handDiv) {
      const h2 = document.createElement("h2");
      h2.textContent = text;
      handDiv.appendChild(h2);
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
      if (playerIndex === this.game.gameState.currentPlayer && currentPlayer.type === PLAYER_TYPES.HUMAN) {
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
          playerHandDiv.classList.add(this.game.gameState.players[i].type);
          if (i === this.game.gameState.currentPlayer) {
            playerHandDiv.classList.add("current");
          }
          this.playersHands.appendChild(playerHandDiv);
          this.renderPlayerHand(i, playerHandDiv);

          // If it's an AI player and game hasn't started or ended, render persona selection
          if (
            this.game.gameState.players[i].type === PLAYER_TYPES.AI &&
            !this.game.gameState.gameStarted &&
            !this.game.gameState.gameOver
          ) {
            this.renderAISelection(playerHandDiv);
          }
        }
      });
    }
  }

  /**
   * Updates the description for the selected AI.
   */
  updateAIDescription(personaKey) {
    if (this.aiDescription) {
      const persona = AI_PERSONAS[personaKey];
      this.aiDescription.textContent = persona ? persona.description : "";
    }
  }

  /**
   * Updates the state of the play, pass, and new game buttons.
   */
  updateButtonStates() {
    const isHumanPlayerTurn = this.game.gameState.players[this.game.gameState.currentPlayer]?.type === PLAYER_TYPES.HUMAN;

    if (this.game.gameState.gameOver) {
      if (this.playButton) this.playButton.style.display = "none";
      if (this.passButton) this.passButton.style.display = "none";
      if (this.newGameButton) this.newGameButton.style.display = "block";
      if (this.startGameButton) this.startGameButton.style.display = "none";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        this.resetButton.disabled = false;
      }
    } else if (!this.game.gameState.gameStarted) {
      // Game has not started yet, show start button
      if (this.playButton) this.playButton.style.display = "none";
      if (this.passButton) this.passButton.style.display = "none";
      if (this.newGameButton) this.newGameButton.style.display = "none";
      if (this.startGameButton) this.startGameButton.style.display = "block";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        this.resetButton.disabled = false;
      }
    } else {
      // Game is in progress
      if (this.playButton) {
        this.playButton.style.display = "block";
        this.playButton.disabled = !isHumanPlayerTurn;
      }
      if (this.passButton) {
        this.passButton.style.display = "block";
        this.passButton.disabled = !isHumanPlayerTurn;
      }
      if (this.newGameButton) this.newGameButton.style.display = "none";
      if (this.startGameButton) this.startGameButton.style.display = "none";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        this.resetButton.disabled = !isHumanPlayerTurn;
      }
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
      const card = Card.parse(cardEl.dataset.card);
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
