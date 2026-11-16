import type { GameClient } from "./game/client.js";
import type { Card } from "./game/deck.js";
import { AI_PERSONAS } from "./ai/personas.js";
import { Card as CardClass, COMBINATION_TYPES } from "./game/index.js";
import { PLAYER_TYPES } from "./player/index.js";
import type { Player } from "./player/base.js";
import type { AIPlayer } from "./player/ai.js";
import { log } from "./utils.js";

export interface UIId {
  gameMessages: string;
  playersHands: string;
  playArea: string;
  gameContent: string;
  playButton: string;
  passButton: string;
  newGameButton: string;
  startGameButton: string;
  resetButton: string;
  aiSelection: string;
  aiDropdown: string;
  aiDescription: string;
}

type EventListener = (_data: unknown) => void;

type PreRenderCallback = (_cardSpan: HTMLElement, _card: Card) => void;

export class UI {
  gameClient: GameClient;
  id: UIId;
  messageTimeout: ReturnType<typeof setTimeout> | null;
  _listeners: Record<string, EventListener[]>;

  // DOM element references
  gameMessages: HTMLElement | null;
  playersHands: HTMLElement | null;
  playArea: HTMLElement | null;
  gameContent: HTMLElement | null;
  playButton: HTMLElement | null;
  passButton: HTMLElement | null;
  newGameButton: HTMLElement | null;
  startGameButton: HTMLElement | null;
  resetButton: HTMLElement | null;
  aiSelection: HTMLElement | null;
  aiDropdown: HTMLSelectElement | null;
  aiDescription: HTMLElement | null;

  /**
   * Initialize a new UI instance.
   * @param gameClient The GameClient instance for this UI.
   */
  constructor(gameClient: GameClient) {
    this.gameClient = gameClient;
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
    this._listeners = {};

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

  on(eventName: string, listener: EventListener): void {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this._listeners[eventName].push(listener);
  }

  emit(eventName: string, data: unknown): void {
    if (this._listeners[eventName]) {
      this._listeners[eventName].forEach((listener) => listener(data));
    }
  }

  /**
   * Initializes elements in the ui object.
   */
  init(): void {
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

      // Add event listeners that emit events
      if (this.playButton) this.playButton.addEventListener("click", () => this.emit("playClicked", undefined));
      if (this.passButton) this.passButton.addEventListener("click", () => this.emit("passClicked", undefined));
      if (this.newGameButton) this.newGameButton.addEventListener("click", () => this.emit("newGameClicked", undefined));
      if (this.resetButton) this.resetButton.addEventListener("click", () => this.emit("resetClicked", undefined));
      if (this.startGameButton) this.startGameButton.addEventListener("click", () => this.emit("startClicked", undefined));
      if (this.aiDropdown)
        this.aiDropdown.addEventListener("change", (event: Event) =>
          this.emit("aiChanged", (event.target as HTMLSelectElement).value),
        );
    }
  }

  /**
   * Displays a message to the user.
   * @param message The message to display.
   * @param type The type of message (e.g., "error", "info").
   */
  displayMessage(message: string, type: string): void {
    log(`displayMessage: ${message}, type: ${type}`);
    if (this.gameMessages) {
      this.gameMessages.textContent = message;
      this.gameMessages.classList.add(type);
      this.gameMessages.classList.add("visible");
      clearTimeout(this.messageTimeout!);
      this.messageTimeout = setTimeout(() => {
        this.clearMessage();
      }, 3000); // Clear message after 3 seconds
    }
  }

  /**
   * Clears the displayed message.
   */
  clearMessage(): void {
    if (this.gameMessages) {
      this.gameMessages.textContent = "";
      this.gameMessages.className = "";
      this.gameMessages.classList.remove("visible");
    }
  }

  /**
   * Returns a character-based indicator for the given combination type.
   * @param combinationType The combination type (e.g., COMBINATION_TYPES.SINGLE).
   * @returns The character indicator.
   */
  getCombinationTypeIndicator(combinationType: string): string {
    switch (combinationType) {
      case COMBINATION_TYPES.SINGLE:
        return "\uD83C\uDCCF";
      case COMBINATION_TYPES.PAIR:
        return "\uD83C\uDCCF\u200D\uD83C\uDCCF";
      case COMBINATION_TYPES.TRIPLE:
        return "\uD83C\uDCCF\u200D\uD83C\uDCCF\u200D\uD83C\uDCCF";
      case COMBINATION_TYPES.STRAIGHT:
        return "\uD83E\uDDDC";
      case COMBINATION_TYPES.FOUR_OF_A_KIND:
        return "\uD83D\uDCA3"; // Bomb indicator for Four of a Kind
      case COMBINATION_TYPES.CONSECUTIVE_PAIRS:
        return "\uD83D\uDCA3"; // Bomb indicator for Consecutive Pairs
      default:
        return "\uD83D\uDFE2"; // Default for an open play pile
    }
  }

  /**
   * Creates a card element.
   * @param card The card object.
   * @returns The card element.
   */
  createCardElement(card: Card): HTMLElement {
    if (typeof document === "undefined") {
      // Mock for Node.js environment
      return { classList: { add: () => {}, remove: () => {} }, dataset: {}, addEventListener: () => {} } as unknown as HTMLElement;
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
  render(): void {
    this.renderPlayArea();
    this.renderPlayerHands();
    this.updateButtonStates();
  }

  /**
   * Creates and renders the AI selection UI.
   * @param parentElement The element to append the UI to.
   */
  renderAISelection(parentElement: HTMLElement): void {
    if (typeof document === "undefined" || !parentElement) {
      return;
    }
    this.aiSelection!.innerHTML = "";
    this.aiDropdown!.innerHTML = "";
    this.aiDescription!.innerHTML = "";

    const label = document.createElement("label");
    label.htmlFor = this.id.aiDropdown;
    label.textContent = "Select AI opponent:";
    this.aiSelection!.appendChild(label);

    for (const [key, persona] of Object.entries(AI_PERSONAS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${persona.icon} ${persona.friendly_name}`;
      this.aiDropdown!.appendChild(option);
    }

    this.aiSelection!.appendChild(this.aiDropdown!);
    this.aiSelection!.appendChild(this.aiDescription!);
    parentElement.appendChild(this.aiSelection!);

    // Set initial selection based on game state
    const currentAIPersona = this.gameClient.getPlayerPersonas(1);
    if (typeof currentAIPersona === "string" && currentAIPersona) {
      this.aiDropdown!.value = currentAIPersona;
      this.updateAIDescription(currentAIPersona);
    } else {
      // Default option if none is set
      this.aiDropdown!.value = "random";
      this.updateAIDescription("random");
    }
  }

  /**
   * Renders cards to a target element.
   * @param cards The array of cards.
   * @param targetElement The element in which to render.
   * @param preRender An optional function to run on each card element before rendering.
   */
  renderCardsContainer(cards: Card[], targetElement: HTMLElement, preRender: PreRenderCallback | null = null): void {
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
  renderPlayArea(): void {
    if (this.gameContent) {
      const combinationType = this.gameClient.getPlayPileCombinationType();
      const indicator = this.getCombinationTypeIndicator(combinationType);
      this.gameContent.innerHTML = `<h2>Play Area (Round ${this.gameClient.getRoundNumber()}) <span class="combination-type">${indicator}</span></h2>`;
      this.renderCardsContainer(this.gameClient.getPlayPile(), this.gameContent);
    }
  }

  /**
   * Renders a single player's hand in the DOM.
   * @param playerIndex The index of the player.
   * @param handDiv The div element to render the hand in.
   */
  renderPlayerHand(playerIndex: number, handDiv: HTMLElement): void {
    const player = this.gameClient.getPlayers(playerIndex) as Player;
    let text = `Player ${playerIndex + 1}`;

    if (player.type === PLAYER_TYPES.AI) {
      const aiPlayer = player as AIPlayer;
      const persona = aiPlayer.ai.persona;
      if (persona && AI_PERSONAS[persona]) {
        text += `: ${AI_PERSONAS[persona].icon} ${AI_PERSONAS[persona].friendly_name} AI`;
      } else {
        text += " (AI)";
      }
    } else if (player.type === PLAYER_TYPES.HUMAN) {
      text += ": 🎮 You";
    }

    if (this.gameClient.isGameOver() && this.gameClient.getPlayerHands(playerIndex).length === 0) {
      this.displayMessage(`${text} - wins in ${this.gameClient.getRoundNumber()} rounds!`, "info");
      text += " (Winner!)";
    } else if (this.gameClient.getCurrentPlayerIndex() === playerIndex) {
      text = `👉 ${text}`;
    }

    let h2 = handDiv.querySelector("h2") as HTMLElement | null;
    if (!h2) {
      h2 = document.createElement("h2");
      handDiv.prepend(h2);
    }
    h2.textContent = text;

    let gamesWonEl = handDiv.querySelector(".games-won") as HTMLElement | null;
    if (!gamesWonEl) {
      gamesWonEl = document.createElement("p");
      gamesWonEl.classList.add("games-won");
      handDiv.appendChild(gamesWonEl);
    }
    gamesWonEl.textContent = `Games won: ${this.gameClient.getGamesWon(playerIndex)}`;

    let roundsWonEl = handDiv.querySelector(".rounds-won") as HTMLElement | null;
    if (!roundsWonEl) {
      roundsWonEl = document.createElement("p");
      roundsWonEl.classList.add("rounds-won");
      handDiv.appendChild(roundsWonEl);
    }
    roundsWonEl.textContent = `Rounds won: ${this.gameClient.getRoundsWon(playerIndex)}`;

    // Clear the cards container before rendering new cards
    let cardsContainer = handDiv.querySelector(".cards-container") as HTMLElement | null;
    if (cardsContainer) {
      cardsContainer.innerHTML = "";
    } else {
      cardsContainer = document.createElement("div");
      cardsContainer.classList.add("cards-container");
      handDiv.appendChild(cardsContainer);
    }

    const preRender = (cardSpan: HTMLElement, card: Card): void => {
      const currentPlayer = this.gameClient.getPlayers(playerIndex) as Player;
      if (playerIndex === this.gameClient.getCurrentPlayerIndex() && currentPlayer.type === PLAYER_TYPES.HUMAN) {
        if (cardSpan && cardSpan.addEventListener) {
          cardSpan.addEventListener("click", () => {
            this.emit("cardClicked", card);
          });
        }
      }
      if (this.gameClient.isCardSelected(card)) {
        if (cardSpan) cardSpan.classList.add("selected");
      }
    };
    const playerHand = this.gameClient.getPlayerHands(playerIndex) as Card[];
    this.renderCardsContainer(playerHand, cardsContainer, preRender);

    const cardCountEl = handDiv.querySelector(".card-count") as HTMLElement | null;
    if (!cardCountEl) {
      const newCardCountEl = document.createElement("p");
      newCardCountEl.classList.add("card-count");
      handDiv.appendChild(newCardCountEl);
      newCardCountEl.textContent = `Cards remaining: ${playerHand.length}`;
    } else {
      cardCountEl.textContent = `Cards remaining: ${playerHand.length}`;
    }
  }

  /**
   * Renders all player hands in the DOM.
   */
  renderPlayerHands(): void {
    if (this.playersHands) {
      const playersHands = this.playersHands;
      playersHands.innerHTML = ""; // Clear the entire container once
      const allHands = this.gameClient.getPlayerHands() as Card[][];
      allHands.forEach((hand, i) => {
        if (typeof document !== "undefined") {
          let playerHandDiv = document.getElementById(`player-hand-${i}`) as HTMLElement | null;
          if (!playerHandDiv) {
            playerHandDiv = document.createElement("div");
            playerHandDiv.id = `player-hand-${i}`;
            playerHandDiv.classList.add("player-hand");
            playersHands.appendChild(playerHandDiv);
          }

          const player = this.gameClient.getPlayers(i) as Player;
          playerHandDiv.classList.add(player.type);
          if (i === this.gameClient.getCurrentPlayerIndex()) {
            playerHandDiv.classList.add("current");
          } else {
            playerHandDiv.classList.remove("current");
          }
          this.renderPlayerHand(i, playerHandDiv);

          // If it's an AI player and game hasn't started or ended, render persona selection
          if (
            player.type === PLAYER_TYPES.AI &&
            !this.gameClient.isGameStarted() &&
            !this.gameClient.isGameOver()
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
  updateAIDescription(personaKey: string): void {
    if (this.aiDescription) {
      const persona = AI_PERSONAS[personaKey];
      this.aiDescription.textContent = persona ? persona.description : "";
    }
  }

  /**
   * Updates the state of the play, pass, and new game buttons.
   */
  updateButtonStates(): void {
    const currentPlayer = this.gameClient.getCurrentPlayer() as Player | undefined;
    if (!currentPlayer) return;
    const isHumanPlayerTurn = currentPlayer.type === PLAYER_TYPES.HUMAN;

    if (this.gameClient.isGameOver()) {
      if (this.playButton) this.playButton.style.display = "none";
      if (this.passButton) this.passButton.style.display = "none";
      if (this.newGameButton) this.newGameButton.style.display = "block";
      if (this.startGameButton) this.startGameButton.style.display = "none";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        (this.resetButton as HTMLButtonElement).disabled = false;
      }
    } else if (!this.gameClient.isGameStarted()) {
      // Game has not started yet, show start button
      if (this.playButton) this.playButton.style.display = "none";
      if (this.passButton) this.passButton.style.display = "none";
      if (this.newGameButton) this.newGameButton.style.display = "none";
      if (this.startGameButton) this.startGameButton.style.display = "block";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        (this.resetButton as HTMLButtonElement).disabled = false;
      }
    } else {
      // Game is in progress
      if (this.playButton) {
        this.playButton.style.display = "block";
        (this.playButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
      if (this.passButton) {
        this.passButton.style.display = "block";
        (this.passButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
      if (this.newGameButton) this.newGameButton.style.display = "none";
      if (this.startGameButton) this.startGameButton.style.display = "none";
      if (this.resetButton) {
        this.resetButton.style.display = "block";
        (this.resetButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
    }
  }

  /**
   * Updates the 'selected' class on all card DOM elements in the current player's hand
   * based on the game's selectedCards.
   */
  renderSelectedCards(): void {
    if (typeof document === "undefined") {
      return;
    }
    const currentPlayerHandDiv = document.getElementById(`player-hand-${this.gameClient.getCurrentPlayerIndex()}`);
    if (!currentPlayerHandDiv) {
      return;
    }

    const cardElements = currentPlayerHandDiv.querySelectorAll(".card");
    cardElements.forEach((cardEl) => {
      const cardData = (cardEl as HTMLElement).dataset.card;
      if (!cardData) return;
      const card = CardClass.parse(cardData);
      const isSelected = this.gameClient.isCardSelected(card);
      if (isSelected) {
        cardEl.classList.add("selected");
      } else {
        cardEl.classList.remove("selected");
      }
    });
  }
}

export default UI;
