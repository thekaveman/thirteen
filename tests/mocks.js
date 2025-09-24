import { AI } from "../src/app/ai.js";
import { Card } from "../src/app/deck.js";
import { Game } from "../src/app/game.js";

export class MockAI extends AI {
  constructor(game, move) {
    super(game);
    this.move = move;
    this.takeTurnCalled = false;
  }

  takeTurn(hand, playPile, currentTurn, playerHands) {
    this.takeTurnCalled = true;
    return this.move;
  }
}

export const MockDeck = {
  cards: [
    new Card("3", "♠"),
    new Card("4", "♦"),
    new Card("5", "♣"),
    new Card("6", "♥"),
    new Card("7", "♠"),
    new Card("8", "♦"),
    new Card("9", "♣"),
    new Card("10", "♥"),
    new Card("J", "♠"),
    new Card("Q", "♦"),
    new Card("K", "♣"),
    new Card("A", "♥"),
    new Card("2", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("5", "♥"),
    new Card("6", "♠"),
    new Card("7", "♦"),
    new Card("8", "♣"),
    new Card("9", "♥"),
    new Card("10", "♠"),
    new Card("J", "♦"),
    new Card("Q", "♣"),
    new Card("K", "♥"),
    new Card("A", "♠"),
    new Card("2", "♦"),
  ],
  deal: () => [
    [
      new Card("3", "♠"),
      new Card("4", "♦"),
      new Card("5", "♣"),
      new Card("6", "♥"),
      new Card("7", "♠"),
      new Card("8", "♦"),
      new Card("9", "♣"),
      new Card("10", "♥"),
      new Card("J", "♠"),
      new Card("Q", "♦"),
      new Card("K", "♣"),
      new Card("A", "♥"),
      new Card("2", "♠"),
    ],
    [
      new Card("3", "♦"),
      new Card("4", "♣"),
      new Card("5", "♥"),
      new Card("6", "♠"),
      new Card("7", "♦"),
      new Card("8", "♣"),
      new Card("9", "♥"),
      new Card("10", "♠"),
      new Card("J", "♦"),
      new Card("Q", "♣"),
      new Card("K", "♥"),
      new Card("A", "♠"),
      new Card("2", "♦"),
    ],
  ],
  shuffle: () => {},
};

export class MockGame extends Game {
  constructor(deck, stateKey) {
    super(deck, stateKey);
    this.findStartingPlayerCalled = false;
    this.loadCalled = false;
    this.playCardsCalled = false;
    this.passTurnCalled = false;
    this.resetCalled = false;
    this.saveCalled = false;
    this.startCalled = false;

    // For testing load scenarios
    this.loadWillSucceed = false;
    this.gameOverOnLoad = false;
  }

  findStartingPlayer(hands) {
    this.findStartingPlayerCalled = true;
    return super.findStartingPlayer(hands);
  }
  load() {
    this.loadCalled = true;
    if (this.loadWillSucceed) {
      this.gameState.gameOver = this.gameOverOnLoad;
      return true;
    }
    return false;
  }
  playCards() {
    this.playCardsCalled = true;
    super.playCards();
  }
  passTurn() {
    this.passTurnCalled = true;
    return super.passTurn();
  }
  reset() {
    this.resetCalled = true;
    super.reset();
  }
  save() {
    this.saveCalled = true;
    super.save();
  }
  start() {
    this.startCalled = true;
    super.start();
  }
}

export class MockLocalStorage {
  constructor() {}

  clear() {}
  getItem(key) {
    return null;
  }
  setItem(key, value) {}
  removeItem(key) {}
}

export class MockUI {
  constructor(game) {
    this.game = game;
    this.initCalled = false;
    this.renderCalled = false;
    this.playButton = {
      addEventListener: (event, handler) => {
        this.playButton.handler = handler;
      },
      style: { display: "" },
    };
    this.passButton = {
      addEventListener: (event, handler) => {
        this.passButton.handler = handler;
      },
      style: { display: "" },
    };
    this.newGameButton = {
      addEventListener: (event, handler) => {
        this.newGameButton.handler = handler;
      },
      style: { display: "" },
    };
    this.startGameButton = {
      addEventListener: (event, handler) => {
        this.startGameButton.handler = handler;
      },
      style: { display: "" },
    };
    this.gameMessages = { textContent: "", classList: { add: () => {}, remove: () => {} } };
    this.playersHands = { innerHTML: "", appendChild: () => {} };
    this.playArea = { innerHTML: "", appendChild: () => {} };
    this.gameContent = { innerHTML: "", appendChild: () => {} };
  }
  init(game) {
    this.game = game;
    this.initCalled = true;
  }
  render() {
    this.renderCalled = true;
  }
  displayMessage(message) {
    this.gameMessages.textContent = message;
  }
  clearMessage() {}
  createCardElement() {
    return { classList: { add: () => {}, remove: () => {} }, dataset: {}, addEventListener: () => {} };
  }
  renderCardsContainer() {}
  renderPlayArea() {}
  renderPlayerHand() {}
  renderPlayerHands() {}
  updateButtonStates() {}
  renderSelectedCards() {}
}
