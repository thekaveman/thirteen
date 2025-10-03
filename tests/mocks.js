import { AI } from "../src/app/ai/index.js";
import { Card } from "../src/app/deck.js";
import { Game } from "../src/app/game.js";
import { Player } from "../src/app/player/index.js";

export class MockAnalytics {
  constructor() {
    this.events = [];
  }

  gameInit(game) {
    this.events.push({ eventType: "game_initialized", game });
  }

  gameReset(game) {
    this.events.push({ eventType: "game_reset", game });
  }

  gameStarted(game) {
    this.events.push({ eventType: "game_started", game });
  }

  gameWon(game) {
    this.events.push({ eventType: "game_won", game });
  }

  roundPlayed(game) {
    this.events.push({ eventType: "round_played", game });
  }

  playerMoved(game) {
    this.events.push({ eventType: "player_moved", game });
  }

  playerPassed(game) {
    this.events.push({ eventType: "player_passed", game });
  }
}

export class MockAI extends AI {
  constructor(game, move) {
    super(game);
    this.move = move;
    this.takeTurnCalled = false;
  }

  data() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      isHuman: this.isHuman,
    };
  }

  takeTurn(hand, playPile, currentTurn, playerHands) {
    this.takeTurnCalled = true;
    return this.move;
  }
}

export class MockDeck {
  constructor() {
    this.cards = [
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
    ];
  }

  deal() {
    return [
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
    ];
  }

  shuffle() {}
}

export class MockGame extends Game {
  constructor(deck, stateKey) {
    super(deck, stateKey);
    this.findStartingPlayerCalled = false;
    this.loadCalled = false;
    this.playCardsCalled = false;
    this.passTurnCalled = false;
    this.initCalled = false;
    this.resetCalled = false;
    this.saveCalled = false;
    this.startCalled = false;

    this.onGameInitCalled = false;
    this.onGameResetCalled = false;
    this.onGameStartedCalled = false;
    this.onGameWonCalled = false;
    this.onPlayerMovedCalled = false;
    this.onPlayerPassedCalled = false;
    this.onRoundPlayedCalled = false;

    this.hooks = {
      onGameInit: (game) => {
        this.onGameInitCalled = true;
      },
      onGameReset: (game) => {
        this.onGameResetCalled = true;
      },
      onGameStarted: (game) => {
        this.onGameStartedCalled = true;
      },
      onGameWon: (game) => {
        this.onGameWonCalled = true;
      },
      onPlayerMoved: (game) => {
        this.onPlayerMovedCalled = true;
      },
      onPlayerPassed: (game) => {
        this.onPlayerPassedCalled = true;
      },
      onRoundPlayed: (game) => {
        this.onRoundPlayedCalled = true;
      },
    };

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
  init() {
    this.initCalled = true;
    super.init();
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
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = value;
  }
  removeItem(key) {
    delete this.store[key];
  }
}

export class MockPlayer extends Player {
  constructor(name, hand, isHuman = false) {
    super(name, hand, isHuman);
  }

  data() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      isHuman: this.isHuman,
    };
  }

  handleCardClick(event) {}
}

export class MockUI {
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
    };
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
    this.resetButton = {
      addEventListener: (event, handler) => {
        this.resetButton.handler = handler;
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
