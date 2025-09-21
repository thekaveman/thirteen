import { assert, spyOn } from "./utils.js";
import { Card } from "../src/deck.js";
import { App } from "../src/app.js";
import { Game } from "../src/game.js";
import { TestAI as _TestAI } from "./test_ai.js";

// Mock objects
const mockDeck = {
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

// Mock Game class by extending the actual Game class
class MockGame extends Game {
  constructor() {
    super();
    this.resetCalled = false;
    this.findStartingPlayerCalled = false;
    this.playCardsCalled = false;
    this.passTurnCalled = false;
    this.startCalled = false;
  }

  reset() {
    this.resetCalled = true;
    super.reset();
  }
  findStartingPlayer(hands) {
    this.findStartingPlayerCalled = true;
    return super.findStartingPlayer(hands);
  }
  playCards() {
    this.playCardsCalled = true;
    super.playCards();
  }
  passTurn() {
    this.passTurnCalled = true;
    return super.passTurn();
  }
  start(deck) {
    this.startCalled = true;
    super.start(deck);
  }
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
    };
    this.passButton = {
      addEventListener: (event, handler) => {
        this.passButton.handler = handler;
      },
    };
    this.newGameButton = {
      addEventListener: (event, handler) => {
        this.newGameButton.handler = handler;
      },
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

class MockAI extends _TestAI {
  constructor(game, move = []) {
    super(game, move);
    this.takeTurnCalled = false;
  }
  takeTurn(hand, playPile, currentTurn, allPlayerHands) {
    this.takeTurnCalled = true;
    return super.takeTurn(hand, playPile, currentTurn, allPlayerHands);
  }
}

// Test cases

function test_handleAITurn_playsCardsWhenMoveIsAvailable() {
  const gameInstance = new MockGame();
  // Pass the AI's move directly to the MockAI constructor
  const app = new App(
    mockDeck.createDeck(),
    gameInstance,
    class extends MockAI {
      constructor(game) {
        super(game, [createCard("3", "♠")]); // AI will play 3♠
      }
    },
    MockUI
  );

  // Mock app.nextTurn before app.init is called
  const originalAppNextTurn = app.nextTurn;
  app.nextTurn = () => {}; // Prevent app.init from calling nextTurn

  // Mock setTimeout to immediately call the handler for this test
  app.init((handler, delay) => {
    handler();
  });
  app.game.gameState.currentPlayer = 1; // the AI player
  const aiPlayer = app.game.gameState.players[1];
  const takeTurnSpy = spyOn(aiPlayer.ai, "takeTurn");

  let playCardsCalled = false;
  app.game.playCards = () => {
    playCardsCalled = true;
  };

  // Explicitly call app.handleAITurn
  app.handleAITurn();

  assert(takeTurnSpy.called, "AI takeTurn should be called");
  assert(playCardsCalled, "playCards should be called");
  assert(app.ui.renderCalled, "ui.render should be called");

  // Restore original functions
  app.game.playCards = () => {}; // Reset mock
  app.nextTurn = originalAppNextTurn;
  takeTurnSpy.restore();
}

function test_handleAITurn_passesTurnWhenNoMoveIsAvailable() {
  const gameInstance = new MockGame();
  // Pass the AI's move directly to the MockAI constructor
  const app = new App(
    mockDeck.createDeck(),
    gameInstance,
    class extends MockAI {
      constructor(game) {
        super(game, []); // AI will pass
      }
    },
    MockUI
  );

  // Mock app.nextTurn before app.init is called
  const originalNextTurn = app.nextTurn;
  app.nextTurn = () => {};

  app.init();
  app.game.gameState.currentPlayer = 1;
  app.nextTurn = originalNextTurn;

  const aiPlayer = app.game.gameState.players[1];
  const takeTurnSpy = spyOn(aiPlayer.ai, "takeTurn");

  let passTurnCalled = false;
  app.game.passTurn = () => {
    passTurnCalled = true;
  };

  // Explicitly call app.handleAITurn
  app.handleAITurn();

  assert(takeTurnSpy.called, "AI takeTurn should be called");
  assert(passTurnCalled, "passTurn should be called");
  assert(app.ui.renderCalled, "ui.render should be called");

  // Restore original functions
  app.game.passTurn = () => {};
  takeTurnSpy.restore();
}

function test_handleHumanPlay_callsPlayButtonClickAndNextTurn() {
  const gameInstance = new MockGame();
  const app = new App(mockDeck.createDeck(), gameInstance, MockAI, MockUI);
  app.init();
  app.game.gameState.currentPlayer = 0; // the human player

  const humanPlayer = app.game.gameState.players[0];
  const playSpy = spyOn(humanPlayer, "handlePlayButtonClick");

  app.handleHumanPlay();

  assert(playSpy.called, "handlePlayButtonClick should be called");

  playSpy.restore();
}

function test_handleHumanPass_callsPassButtonClickAndNextTurn() {
  const gameInstance = new MockGame();
  const app = new App(mockDeck.createDeck(), gameInstance, MockAI, MockUI);

  app.init();
  app.game.gameState.currentPlayer = 0; // the human player

  const humanPlayer = app.game.gameState.players[0];
  const passSpy = spyOn(humanPlayer, "handlePassButtonClick");
  const nextTurnSpy = spyOn(app, "nextTurn");

  app.handleHumanPass();

  assert(passSpy.called, "handlePassButtonClick should be called");
  assert(nextTurnSpy.called, "nextTurn should be called");

  passSpy.restore();
  nextTurnSpy.restore();
}

function test_nextTurn_callsHandleAITurnForAIPlayer() {
  const gameInstance = new MockGame();
  const app = new App(
    mockDeck.createDeck(),
    gameInstance,
    class extends MockAI {
      constructor(game) {
        super(game, [createCard("3", "♦")]); // AI will play 3♦
      }
    },
    MockUI
  );

  const handleAITurnSpy = spyOn(app, "handleAITurn");

  // Set up playPile and currentPlay for the AI to respond to
  app.init((handler, delay) => {
    handler();
  });
  const playedCard = createCard("3", "♠");
  app.game.gameState.playPile = [playedCard];
  app.game.gameState.currentPlayer = 1; // Assuming AI is next

  app.nextTurn();

  assert(handleAITurnSpy.called, "handleAITurn should be called");

  handleAITurnSpy.restore();
}

function test_nextTurn_doesNotCallHandleAITurnForHumanPlayer() {
  const gameInstance = new MockGame();
  const app = new App(mockDeck.createDeck(), gameInstance, MockAI, MockUI);
  const handleAITurnSpy = spyOn(app, "handleAITurn");

  app.init();
  app.game.gameState.currentPlayer = 0; // the human player

  app.nextTurn();

  assert(!handleAITurnSpy.called, "handleAITurn should not be called");

  handleAITurnSpy.restore();
}

function test_startGame_initializesGameStateCorrectly() {
  const gameInstance = new MockGame();
  const app = new App(mockDeck.createDeck(), gameInstance, MockAI, MockUI);

  app.init();

  assert(app.game.resetCalled, "game.reset should be called");
  assert(app.game.startCalled, "game.start should be called");
  assert(app.game.gameState.players.length === 2, "init should initialize 2 players");
  assert(app.game.gameState.playerTypes[0] === "human", "First player should be human");
  assert(app.game.gameState.playerTypes[1] === "ai", "Second player should be AI");
  assert(app.game.findStartingPlayerCalled, "findStartingPlayer should be called");
  assert(app.ui.initCalled, "ui.init should be called");
  assert(app.ui.renderCalled, "ui.render should be called");
}

export const appTests = [
  test_handleAITurn_playsCardsWhenMoveIsAvailable,
  test_handleAITurn_passesTurnWhenNoMoveIsAvailable,
  test_handleHumanPlay_callsPlayButtonClickAndNextTurn,
  test_handleHumanPass_callsPassButtonClickAndNextTurn,
  test_nextTurn_callsHandleAITurnForAIPlayer,
  test_nextTurn_doesNotCallHandleAITurnForHumanPlayer,
  test_startGame_initializesGameStateCorrectly,
  test_spyOn_MockAI_takeTurn,
];

function test_spyOn_MockAI_takeTurn() {
  const gameInstance = new MockGame();
  const mockAiInstance = new MockAI(gameInstance);
  const takeTurnSpy = spyOn(mockAiInstance, "takeTurn");

  mockAiInstance.takeTurn([], [], 0, []); // Call the method

  assert(takeTurnSpy.called, "MockAI takeTurn should be called");
  takeTurnSpy.restore();
}
