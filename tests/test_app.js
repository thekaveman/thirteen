import { assert, spyOn } from "./utils.js";
import { Card } from "../src/deck.js";
import { App } from "../src/app.js";
import { MockDeck, MockGame, MockUI, MockAI } from "./mocks.js";

// Test cases

function test_handleAITurn_playsCardsWhenMoveIsAvailable() {
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(
    MockDeck,
    game,
    new MockAI(game, [new Card("3", "♠")]), // AI will play 3♠
    new MockUI(game)
  );

  // Mock app.nextTurn before app.init is called
  const originalAppNextTurn = app.nextTurn;
  app.nextTurn = () => {}; // Prevent app.init from calling nextTurn

  // Mock setTimeout to immediately call the handler for this test
  app.init((handler, delay) => {
    handler();
  });
  app.ui.startGameButton.handler(); // Simulate clicking the start button

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
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(
    MockDeck,
    game,
    new MockAI(game, []), // AI will pass
    new MockUI(game)
  );

  // Mock app.nextTurn before app.init is called
  const originalNextTurn = app.nextTurn;
  app.nextTurn = () => {};

  let passTurnCalled = false;
  app.game.passTurn = () => {
    passTurnCalled = true;
  };

  // Mock setTimeout to prevent immediate execution of nextTurn during init
  app.init((handler, delay) => {});
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 1; // Set current player to AI
  app.nextTurn = originalNextTurn; // Restore nextTurn

  const aiPlayer = app.game.gameState.players[1];
  const takeTurnSpy = spyOn(aiPlayer.ai, "takeTurn");

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
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(MockDeck, game, new MockAI(game), new MockUI(game));
  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 0; // the human player

  const humanPlayer = app.game.gameState.players[0];
  const playSpy = spyOn(humanPlayer, "handlePlayButtonClick");

  app.handleHumanPlay();

  assert(playSpy.called, "handlePlayButtonClick should be called");

  playSpy.restore();
}

function test_handleHumanPass_callsPassButtonClickAndNextTurn() {
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(MockDeck, game, new MockAI(game), new MockUI(game));
  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

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

function test_init_initializesGameStateCorrectly() {
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(MockDeck, game, new MockAI(game), new MockUI(game));

  app.init();

  assert(app.ui.initCalled, "ui.init should be called");
  assert(app.ui.startGameButton.handler, "Start game button event listener should be set");

  // Simulate clicking the start button
  app.ui.startGameButton.handler();

  assert(app.game.resetCalled, "game.reset should be called after start button click");
  assert(app.game.startCalled, "game.start should be called after start button click");
  assert(app.game.gameState.players.length === 2, "init should initialize 2 players after start button click");
  assert(app.game.gameState.playerTypes[0] === "human", "First player should be human after start button click");
  assert(app.game.gameState.playerTypes[1] === "ai", "Second player should be AI after start button click");
  assert(app.game.findStartingPlayerCalled, "findStartingPlayer should be called after start button click");
  assert(app.ui.renderCalled, "ui.render should be called after start button click");
}

function test_nextTurn_callsHandleAITurnForAIPlayer() {
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(MockDeck, game, new MockAI(game, [new Card("3", "♦")]), new MockUI(game));
  const handleAITurnSpy = spyOn(app, "handleAITurn");

  // Set up playPile and currentPlay for the AI to respond to
  app.init((handler, delay) => {
    handler();
  });
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  const playedCard = new Card("3", "♠");
  app.game.gameState.playPile = [playedCard];
  app.game.gameState.currentPlayer = 1; // Assuming AI is next

  app.nextTurn();

  assert(handleAITurnSpy.called, "handleAITurn should be called");

  handleAITurnSpy.restore();
}

function test_nextTurn_doesNotCallHandleAITurnForHumanPlayer() {
  const game = new MockGame();
  game.gameState.playerTypes = ["human", "ai"];

  const app = new App(MockDeck, game, new MockAI(game), new MockUI(game));
  const handleAITurnSpy = spyOn(app, "handleAITurn");

  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 0; // the human player

  app.nextTurn();

  assert(!handleAITurnSpy.called, "handleAITurn should not be called");

  handleAITurnSpy.restore();
}

function test_spyOn_MockAI_takeTurn() {
  const game = new MockGame();
  const ai = new MockAI(game);
  const takeTurnSpy = spyOn(ai, "takeTurn");

  ai.takeTurn([], [], 0, []); // Call the method

  assert(takeTurnSpy.called, "MockAI takeTurn should be called");
  takeTurnSpy.restore();
}

export const appTests = [
  test_handleAITurn_playsCardsWhenMoveIsAvailable,
  test_handleAITurn_passesTurnWhenNoMoveIsAvailable,
  test_handleHumanPlay_callsPlayButtonClickAndNextTurn,
  test_handleHumanPass_callsPassButtonClickAndNextTurn,
  test_init_initializesGameStateCorrectly,
  test_nextTurn_callsHandleAITurnForAIPlayer,
  test_nextTurn_doesNotCallHandleAITurnForHumanPlayer,
  test_spyOn_MockAI_takeTurn,
];
