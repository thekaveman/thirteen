import { AI } from "../src/app/ai/index.js";
import { Card, Game, GameClient } from "../src/app/game/index.js";
import { Player } from "../src/app/player/index.js";
import { UI } from "../src/app/ui.js";

export class MockAmplitude {
  constructor() {
    this.events = [];
    this.error = new Error("Test analytics error");
    this.identifiedPlayer = null;
    this.Identify = class {
      constructor() {
        this._properties = {};
      }
      setOnce(key, value) {
        if (!this._properties.hasOwnProperty(key)) {
          this._properties[key] = value;
        }
        return this;
      }
      set(key, value) {
        this._properties[key] = value;
        return this;
      }
      add(key, value) {
        if (!this._properties.hasOwnProperty(key)) {
          this._properties[key] = 0;
        }
        this._properties[key] += value;
        return this;
      }
    };
  }

  track(eventType, payload) {
    this.events.push({ eventType, payload });
  }

  identify(player) {
    this.identifiedPlayer = player;
  }
}

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
  constructor(game, move, persona = null) {
    super(game, "mock", persona);
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
    if (this.move !== undefined) {
      return this.move;
    }

    // If the play pile is empty, the AI must play a card.
    // For testing purposes, we'll make it play its lowest card.
    if (playPile.length === 0) {
      if (hand.length > 0) {
        return [hand[0]]; // Play the lowest card
      }
      return []; // No cards to play, effectively a pass (shouldn't happen in valid game start)
    }

    // Otherwise, simulate a pass for default behavior in tests
    return [];
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

export class MockGameClient extends GameClient {
  constructor(game) {
    super(game);
  }
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

    // Create a GameClient instance for this MockGame
    this.gameClient = new GameClient(this);

    this.hooks = {
      onGameInit: (gameClient) => {
        this.onGameInitCalled = true;
      },
      onGameReset: (gameClient) => {
        this.onGameResetCalled = true;
      },
      onGameStarted: (gameClient) => {
        this.onGameStartedCalled = true;
      },
      onGameWon: (gameClient) => {
        this.onGameWonCalled = true;
      },
      onPlayerMoved: (gameClient) => {
        this.onPlayerMovedCalled = true;
      },
      onPlayerPassed: (gameClient) => {
        this.onPlayerPassedCalled = true;
      },
      onRoundPlayed: (gameClient) => {
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
      return { loaded: true, gameOver: this.gameOverOnLoad, loadedPlayerPersonas: [null, "random"] };
    }
    return { loaded: false };
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
  constructor(name, hand, isHuman = false, persona = null) {
    super(name, hand, isHuman);
    this.persona = isHuman ? null : persona; // Set persona to null if it's a human player
  }

  data() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      isHuman: this.isHuman,
      persona: this.persona,
    };
  }

  handleCardClick(event) {}
}

export class MockUI {
  constructor(game) {
    this.game = game;
    this.id = new UI(game).id;
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
    this.aiDropdown = {
      addEventListener: (event, handler) => {
        this.aiDropdown.handler = handler;
      },
      value: "random",
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
