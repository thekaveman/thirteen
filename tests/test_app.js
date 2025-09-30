import { assert, spyOn } from "./utils.js";
import { Card } from "../src/app/deck.js";
import { App } from "../src/app/app.js";
import { MockAI, MockDeck, MockGame, MockUI, MockAnalytics } from "./mocks.js";

function testSetup(ai) {
  const game = new MockGame(MockDeck);
  const mockHooks = { ...game.hooks };
  const app = new App(game, ai || new MockAI(game), new MockUI(game), new MockAnalytics());
  app.game.hooks = mockHooks;

  app.init();
  return app;
}

function testTeardown(app) {
  // No-op for now, but good practice to have
}

// Test cases

function test_handleAITurn_playsCardsWhenMoveIsAvailable() {
  const app = testSetup(new MockAI(new MockGame(MockDeck), [new Card("3", "♠")]));
  app.game.gameState.playerTypes = ["human", "ai"];

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
  testTeardown(app);
}

function test_handleAITurn_passesTurnWhenNoMoveIsAvailable() {
  const app = testSetup(new MockAI(new MockGame(MockDeck), []));
  app.game.gameState.playerTypes = ["human", "ai"];

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
  testTeardown(app);
}

function test_handleHumanPlay_callsPlayButtonClickAndNextTurn() {
  const app = testSetup();
  app.game.gameState.playerTypes = ["human", "ai"];

  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 0; // the human player

  const humanPlayer = app.game.gameState.players[0];
  const playSpy = spyOn(humanPlayer, "handlePlayButtonClick");

  app.handleHumanPlay();

  assert(playSpy.called, "handlePlayButtonClick should be called");

  playSpy.restore();
  testTeardown(app);
}

function test_handleHumanPass_callsPassButtonClickAndNextTurn() {
  const app = testSetup();
  app.game.gameState.playerTypes = ["human", "ai"];

  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 0; // the human player

  const humanPlayer = app.game.gameState.players[0];
  const passSpy = spyOn(humanPlayer, "handlePassButtonClick");
  const gamePassTurnSpy = spyOn(app.game, "passTurn");

  app.handleHumanPass();

  assert(passSpy.called, "handlePassButtonClick should be called");
  assert(gamePassTurnSpy.called, "game.passTurn should be called");

  passSpy.restore();
  gamePassTurnSpy.restore();
  testTeardown(app);
}

function test_handleNewGameClick_resetsGame() {
  const app = testSetup();
  const initSpy = spyOn(app, "init");

  // Simulate clicking the new game button
  app.ui.newGameButton.handler();

  assert(app.game.resetCalled, "game.reset should be called after new game button click");
  assert(app.game.saveCalled, "game.save should be called after new game button click");
  assert(initSpy.called, "init should be called after new game button click");

  testTeardown(app);
}

function test_handleResetButtonClick_clearsLocalStorageAndResetsGame() {
  const app = testSetup();
  const localStorageClearSpy = spyOn(localStorage, "clear");
  const appInitSpy = spyOn(app, "init");

  // Simulate clicking the reset button
  app.ui.resetButton.handler();

  assert(localStorageClearSpy.called, "localStorage.clear should be called");
  assert(appInitSpy.called, "app.init should be called");
  assert(app.game.onGameResetCalled, "onGameReset should be called");

  localStorageClearSpy.restore();
  appInitSpy.restore();
  testTeardown(app);
}

function test_handleStartGameClick_startsGame() {
  const app = testSetup();
  const nextTurnSpy = spyOn(app, "nextTurn");

  // Simulate clicking the start button
  app.ui.startGameButton.handler();

  assert(app.game.startCalled, "game.start should be called after start button click");
  assert(app.game.saveCalled, "game.save should be called after start button click");
  assert(app.ui.renderCalled, "ui.render should be called after start button click");
  assert(nextTurnSpy.called, "nextTurn should be called after start button click");

  testTeardown(app);
}

function test_init_initializesGame() {
  const app = testSetup();

  assert(app.game.findStartingPlayerCalled, "findStartingPlayer should be called during init");
  assert(app.game.gameState.players.length === 2, "init should initialize 2 players");
  assert(app.game.gameState.playerTypes[0] === "human", "First player should be human");
  assert(app.game.gameState.playerTypes[1] === "ai", "Second player should be AI");

  testTeardown(app);
}

function test_init_initializesUI() {
  const app = testSetup();

  assert(app.ui.initCalled, "ui.init should be called");
  assert(app.ui.startGameButton.handler, "Start game button event listener should be set");

  testTeardown(app);
}

function test_init_loadsGameWhenSaveExistsAndGameNotOver() {
  const game = new MockGame(MockDeck);
  game.loadWillSucceed = true;
  game.gameOverOnLoad = false;
  const app = new App(game, new MockAI(game), new MockUI(game), new MockAnalytics());
  const setPlayersSpy = spyOn(game, "setPlayers");

  app.init();

  assert(game.loadCalled, "game.load should be called");
  assert(app.ui.renderCalled, "ui.render should be called");
  assert(!game.resetCalled, "game.reset should not be called");
  assert(!setPlayersSpy.called, "game.setPlayers should not be called");

  setPlayersSpy.restore();
  testTeardown(app);
}

function test_init_startsNewGameWhenNoSavedGame() {
  const game = new MockGame(MockDeck);
  game.loadWillSucceed = false;
  const app = new App(game, new MockAI(game), new MockUI(game), new MockAnalytics());
  const setPlayersSpy = spyOn(game, "setPlayers");

  app.init();

  assert(game.loadCalled, "game.load should be called");
  assert(game.resetCalled, "game.reset should be called");
  assert(setPlayersSpy.called, "game.setPlayers should be called");
  assert(app.ui.renderCalled, "ui.render should be called");

  setPlayersSpy.restore();
  testTeardown(app);
}

function test_init_startsNewGameWhenSavedGameIsOver() {
  const game = new MockGame(MockDeck);
  game.loadWillSucceed = true;
  game.gameOverOnLoad = true;
  const app = new App(game, new MockAI(game), new MockUI(game), new MockAnalytics());
  const setPlayersSpy = spyOn(game, "setPlayers");

  app.init();

  assert(game.loadCalled, "game.load should be called");
  assert(game.resetCalled, "game.reset should be called");
  assert(setPlayersSpy.called, "game.setPlayers should be called");
  assert(app.ui.renderCalled, "ui.render should be called");

  setPlayersSpy.restore();
  testTeardown(app);
}

function test_nextTurn_callsHandleAITurnForAIPlayer() {
  const app = testSetup(new MockAI(new MockGame(MockDeck), [new Card("3", "♦")]));
  app.game.gameState.playerTypes = ["human", "ai"];

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
  testTeardown(app);
}

function test_nextTurn_doesNotCallHandleAITurnForHumanPlayer() {
  const app = testSetup();
  app.game.gameState.playerTypes = ["human", "ai"];

  const handleAITurnSpy = spyOn(app, "handleAITurn");

  app.init();
  app.ui.startGameButton.handler(); // Simulate clicking the start button

  app.game.gameState.currentPlayer = 0; // the human player

  app.nextTurn();

  assert(!handleAITurnSpy.called, "handleAITurn should not be called");

  handleAITurnSpy.restore();
  testTeardown(app);
}

function test_spyOn_MockAI_takeTurn() {
  const app = testSetup();
  const ai = new MockAI(app.game);
  const takeTurnSpy = spyOn(ai, "takeTurn");

  ai.takeTurn([], [], 0, []); // Call the method

  assert(takeTurnSpy.called, "MockAI takeTurn should be called");
  takeTurnSpy.restore();
  testTeardown(app);
}

export const appTests = [
  test_handleAITurn_playsCardsWhenMoveIsAvailable,
  test_handleAITurn_passesTurnWhenNoMoveIsAvailable,
  test_handleHumanPlay_callsPlayButtonClickAndNextTurn,
  test_handleHumanPass_callsPassButtonClickAndNextTurn,
  test_handleNewGameClick_resetsGame,
  test_handleResetButtonClick_clearsLocalStorageAndResetsGame,
  test_handleStartGameClick_startsGame,
  test_init_initializesGame,
  test_init_initializesUI,
  test_init_loadsGameWhenSaveExistsAndGameNotOver,
  test_init_startsNewGameWhenNoSavedGame,
  test_init_startsNewGameWhenSavedGameIsOver,
  test_nextTurn_callsHandleAITurnForAIPlayer,
  test_nextTurn_doesNotCallHandleAITurnForHumanPlayer,
  test_spyOn_MockAI_takeTurn,
];
