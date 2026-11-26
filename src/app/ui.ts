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
  cancelButton: string;
  resetButton: string;
  aiSelection: string;
  aiDropdown: string;
  aiDescription: string;
  addAIPlayerButton: string;
  removeAIPlayerButton: string;
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
  cancelButton: HTMLElement | null;
  resetButton: HTMLElement | null;
  aiSelection: HTMLElement | null;
  aiDropdown: HTMLSelectElement | null;
  aiDescription: HTMLElement | null;
  addAIPlayerButton: HTMLElement | null;
  removeAIPlayerButton: HTMLElement | null;

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
      cancelButton: "cancel-button",
      resetButton: "reset-button",
      aiSelection: "ai-selection",
      aiDropdown: "ai-dropdown",
      aiDescription: "ai-description",
      addAIPlayerButton: "add-ai-player-button",
      removeAIPlayerButton: "remove-ai-player-button",
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
    this.cancelButton = null;
    this.resetButton = null;
    this.aiSelection = null;
    this.aiDropdown = null;
    this.aiDescription = null;
    this.addAIPlayerButton = null;
    this.removeAIPlayerButton = null;
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
      this.cancelButton = document.getElementById(this.id.cancelButton);
      this.resetButton = document.getElementById(this.id.resetButton);
      this.aiSelection = document.createElement("div");
      this.aiSelection.id = this.id.aiSelection;
      this.aiDropdown = document.createElement("select");
      this.aiDropdown.id = this.id.aiDropdown;
      this.aiDescription = document.createElement("p");
      this.aiDescription.id = this.id.aiDescription;
      this.addAIPlayerButton = document.getElementById(this.id.addAIPlayerButton);
      this.removeAIPlayerButton = document.getElementById(this.id.removeAIPlayerButton);

      // Add event listeners that emit events
      if (this.playButton) this.playButton.addEventListener("click", () => this.emit("playClicked", undefined));
      if (this.passButton) this.passButton.addEventListener("click", () => this.emit("passClicked", undefined));
      if (this.newGameButton) this.newGameButton.addEventListener("click", () => this.emit("newGameClicked", undefined));
      if (this.resetButton) this.resetButton.addEventListener("click", () => this.emit("resetClicked", undefined));
      if (this.startGameButton) this.startGameButton.addEventListener("click", () => this.emit("startClicked", undefined));
      if (this.cancelButton) this.cancelButton.addEventListener("click", () => this.emit("cancelClicked", undefined));
      if (this.resetButton) this.resetButton.addEventListener("click", () => this.emit("resetClicked", undefined));
      if (this.addAIPlayerButton)
        this.addAIPlayerButton.addEventListener("click", () => this.emit("addAIPlayerClicked", undefined));
      if (this.removeAIPlayerButton)
        this.removeAIPlayerButton.addEventListener("click", () => this.emit("removeAIPlayerClicked", undefined));
    }
    // Footer version is static — render it as soon as UI is initialized
    this.updateFooterVersion();
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
   * Returns true if the given combination type is being played as a bomb
   * (i.e., the play pile contains a single 2, or a bomb of the same type).
   * @param combinationType The combination type.
   * @param playPile Optional play pile to determine context.
   * @returns True if played as a bomb.
   */
  getIsBomb(combinationType: string, playPile?: Card[]): boolean {
    // Consecutive pairs is always a bomb
    if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS) {
      return true;
    }
    // Four-of-a-kind is a bomb only when played against a single 2
    if (combinationType === COMBINATION_TYPES.FOUR_OF_A_KIND) {
      if (playPile && playPile.length === 1 && playPile[0].rank === "2") {
        return true;
      }
      return false;
    }
    return false;
  }

  /**
   * Returns a character-based indicator for the given combination type.
   * @param combinationType The combination type (e.g., COMBINATION_TYPES.SINGLE).
   * @param playPile Optional play pile to determine bomb context.
   * @returns The character indicator.
   */
  getCombinationTypeIndicator(combinationType: string, playPile?: Card[]): string {
    switch (combinationType) {
      case COMBINATION_TYPES.SINGLE:
        return "\uD83C\uDCCF";
      case COMBINATION_TYPES.PAIR:
        return "\uD83C\uDCCF\u200D\uD83C\uDCCF";
      case COMBINATION_TYPES.TRIPLE:
        return "\uD83C\uDCCF\u200D\uD83C\uDCCF\u200D\uD83C\uDCCF";
      case COMBINATION_TYPES.STRAIGHT:
        return "\uD83E\uDE9C";
      case COMBINATION_TYPES.FOUR_OF_A_KIND:
        return this.getIsBomb(combinationType, playPile) ? "\uD83D\uDCA3" : "\uD83C\uDCCF\u200D\uD83C\uDCCF\u200D\uD83C\uDCCF\u200D\uD83C\uDCCF";
      case COMBINATION_TYPES.CONSECUTIVE_PAIRS:
        return "\uD83D\uDCA3"; // Bomb indicator for Consecutive Pairs
      default:
        return "\uD83D\uDFE2"; // Default for an open play pile
    }
  }

  /**
   * Renders the play area in the DOM.
   */
  renderPlayArea(): void {
    if (this.gameContent) {
      const combinationType = this.gameClient.getPlayPileCombinationType();
      const playPile = this.gameClient.getPlayPile();
      // For straights, show the card count next to the ladder emoji
      let indicator = this.getCombinationTypeIndicator(combinationType, playPile);
      if (combinationType === COMBINATION_TYPES.STRAIGHT && playPile.length > 0) {
        indicator = `${indicator} <span class="straight-count">(${playPile.length})</span>`;
      }
      this.gameContent.innerHTML = `<h2>Play Area (Round ${this.gameClient.getRoundNumber()}) <span class="combination-type">${indicator}</span></h2>`;
      this.renderCardsContainer(playPile, this.gameContent);
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
      return {
        classList: { add: () => {}, remove: () => {} },
        dataset: {},
        addEventListener: () => {},
      } as unknown as HTMLElement;
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
    this.updateFooterVersion();
  }

  /**
   * Updates the version number in the footer.
   */
  updateFooterVersion(): void {
    if (typeof document === "undefined") return;
    const versionSpan = document.querySelector(".game-footer .version") as HTMLElement | null;
    if (versionSpan) {
      versionSpan.textContent = `v${this.gameClient.game?.gameState?.version ?? "0.0.0"}`;
    }
  }

  /**
   * Creates and renders the AI persona dropdown for a specific AI player slot.
   * Each call creates a unique dropdown for that slot.
   * @param playerIndex The index of the AI player.
   * @param parentElement The element to append the dropdown to.
   */
  renderAIPlayerSlot(playerIndex: number, parentElement: HTMLElement): void {
    if (typeof document === "undefined") {
      return;
    }

    // Use unique IDs for this specific slot
    const slotPrefix = `ai-slot-${playerIndex}`;
    const dropdownId = `${slotPrefix}-dropdown`;
    const labelId = `${slotPrefix}-label`;
    const descriptionId = `${slotPrefix}-description`;

    // Remove existing slot UI if re-rendering
    const existingSlot = parentElement.querySelector(`[id="${dropdownId}"]`)?.parentElement;
    if (existingSlot) existingSlot.remove();

    const wrapper = document.createElement("div");
    wrapper.id = `${slotPrefix}-wrapper`;
    wrapper.classList.add("ai-selector");

    const label = document.createElement("label");
    label.htmlFor = dropdownId;
    label.id = labelId;
    label.textContent = `Select AI ${playerIndex + 1}:`;
    wrapper.appendChild(label);

    const dropdown = document.createElement("select");
    dropdown.id = dropdownId;
    dropdown.dataset.playerIndex = String(playerIndex);

    for (const [key, persona] of Object.entries(AI_PERSONAS)) {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${persona.icon} ${persona.friendly_name}`;
      dropdown.appendChild(option);
    }

    // Register the change event listener on this specific dropdown
    dropdown.addEventListener("change", () => {
      this.emit("aiChanged", { persona: dropdown.value, playerIndex: playerIndex });
    });

    wrapper.appendChild(dropdown);

    const description = document.createElement("p");
    description.id = descriptionId;
    wrapper.appendChild(description);

    parentElement.appendChild(wrapper);

    // Set initial selection based on game state
    const currentAIPersona = this.gameClient.getAIPersona(playerIndex - 1);
    if (typeof currentAIPersona === "string" && currentAIPersona) {
      dropdown.value = currentAIPersona;
      description.textContent = AI_PERSONAS[currentAIPersona]?.description ?? "";
    } else {
      dropdown.value = AI_PERSONAS.random.name;
      description.textContent = AI_PERSONAS.random.description;
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
    }

    let h2 = handDiv.querySelector("h2") as HTMLElement | null;
    if (!h2) {
      h2 = document.createElement("h2");
      handDiv.prepend(h2);
    }
    h2.textContent = text;

    let gamesCounterEl = handDiv.querySelector(".games-counter") as HTMLElement | null;
    if (!gamesCounterEl) {
      gamesCounterEl = document.createElement("p");
      gamesCounterEl.classList.add("games-counter");
      handDiv.appendChild(gamesCounterEl);
    }
    const gamesWon = this.gameClient.getGamesWon(playerIndex) as number;
    const gamesPlayed = this.gameClient.getGamesPlayed(playerIndex) as number;
    gamesCounterEl.textContent = `Won/Played: ${gamesWon}/${gamesPlayed}`;

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

    // Render passed badge for passed players
    const playerPassed = this.gameClient.game?.gameState?.playerPassed?.[playerIndex];
    if (this.gameClient.isGameStarted() && !this.gameClient.isGameOver() && playerPassed) {
      let passedBadge = handDiv.querySelector(".passed-badge") as HTMLElement | null;
      if (!passedBadge) {
        passedBadge = document.createElement("span");
        passedBadge.classList.add("passed-badge");
        passedBadge.textContent = "Passed";
        handDiv.appendChild(passedBadge);
      }
    } else {
      // Remove passed badge if player hasn't passed
      const passedBadge = handDiv.querySelector(".passed-badge");
      if (passedBadge) {
        passedBadge.remove();
      }
    }

    let cardCountEl = handDiv.querySelector(".card-count") as HTMLElement | null;
    if (!cardCountEl) {
      cardCountEl = document.createElement("p");
      cardCountEl.classList.add("card-count");
      handDiv.appendChild(cardCountEl);
    }
    cardCountEl.textContent = `Cards: ${playerHand.length}/13`;
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
          // Only highlight current player if they haven't passed
          const playerPassed = this.gameClient.game?.gameState?.playerPassed?.[i];
          const isCurrentPlayer = i === this.gameClient.getCurrentPlayerIndex();
          if (isCurrentPlayer && this.gameClient.isGameStarted() && !playerPassed) {
            playerHandDiv.classList.add("current");
          } else {
            playerHandDiv.classList.remove("current");
          }

          // Game-over: highlight game winner (last player to play) with green
          if (this.gameClient.isGameOver()) {
            const lastToPlay = this.gameClient.game?.gameState?.lastPlayerToPlay;
            if (i === lastToPlay) {
              playerHandDiv.classList.add("round-winner");
            } else {
              playerHandDiv.classList.remove("round-winner");
            }
          } else {
            playerHandDiv.classList.remove("round-winner");
          }

          this.renderPlayerHand(i, playerHandDiv);

          // Render AI persona dropdown for each AI player slot before game starts
          if (player.type === PLAYER_TYPES.AI && !this.gameClient.isGameStarted() && !this.gameClient.isGameOver()) {
            this.renderAIPlayerSlot(i, playerHandDiv);
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
   * Sets the display style of a button element if it exists.
   * @param button The button element to update.
   * @param display The display value to set.
   */
  #setButtonDisplay(button: HTMLElement | null, display: string): void {
    if (button) button.style.display = display;
  }

  /**
   * Updates the state of the play, pass, cancel, reset, and AI management buttons.
   */
  updateButtonStates(): void {
    const currentPlayer = this.gameClient.getCurrentPlayer() as Player | undefined;
    if (!currentPlayer) return;
    const isHumanPlayerTurn = currentPlayer.type === PLAYER_TYPES.HUMAN;
    const numAIPlayers = this.gameClient.getNumAIPlayers();

    if (this.gameClient.isGameOver()) {
      this.#setButtonDisplay(this.playButton, "none");
      this.#setButtonDisplay(this.passButton, "none");
      this.#setButtonDisplay(this.cancelButton, "none");
      this.#setButtonDisplay(this.newGameButton, "block");
      this.#setButtonDisplay(this.startGameButton, "none");
      this.#setButtonDisplay(this.addAIPlayerButton, "none");
      this.#setButtonDisplay(this.removeAIPlayerButton, "none");
      if (this.resetButton) {
        this.#setButtonDisplay(this.resetButton, "block");
        (this.resetButton as HTMLButtonElement).disabled = false;
      }
    } else if (!this.gameClient.isGameStarted()) {
      this.#setButtonDisplay(this.playButton, "none");
      this.#setButtonDisplay(this.passButton, "none");
      this.#setButtonDisplay(this.cancelButton, "none");
      this.#setButtonDisplay(this.newGameButton, "none");
      this.#setButtonDisplay(this.startGameButton, "block");
      this.#setButtonDisplay(this.addAIPlayerButton, "block");
      this.#setButtonDisplay(this.removeAIPlayerButton, "block");
      if (this.resetButton) {
        this.#setButtonDisplay(this.resetButton, "block");
        (this.resetButton as HTMLButtonElement).disabled = false;
      }
      // Enable/disable add/remove buttons based on AI count
      if (this.addAIPlayerButton) {
        (this.addAIPlayerButton as HTMLButtonElement).disabled = numAIPlayers >= 3;
      }
      if (this.removeAIPlayerButton) {
        (this.removeAIPlayerButton as HTMLButtonElement).disabled = numAIPlayers <= 1;
      }
    } else {
      if (this.playButton) {
        this.#setButtonDisplay(this.playButton, "block");
        (this.playButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
      if (this.passButton) {
        this.#setButtonDisplay(this.passButton, "block");
        (this.passButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
      if (this.cancelButton) {
        this.#setButtonDisplay(this.cancelButton, "block");
        (this.cancelButton as HTMLButtonElement).disabled = !isHumanPlayerTurn;
      }
      this.#setButtonDisplay(this.newGameButton, "none");
      this.#setButtonDisplay(this.startGameButton, "none");
      this.#setButtonDisplay(this.addAIPlayerButton, "none");
      this.#setButtonDisplay(this.removeAIPlayerButton, "none");
      this.#setButtonDisplay(this.resetButton, "none");
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
