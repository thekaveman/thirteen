import { App } from "../src/app/app.js";
import { PLAYER_TYPES } from "../src/app/constants.js";
import { Card } from "../src/app/deck.js";
import { MockAI, MockDeck, MockGame, MockUI, MockAnalytics } from "./mocks.js";

describe("App", () => {
  let app, game, ai, ui, analytics, container;

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    ai = new MockAI(game);
    ui = new MockUI(game);
    analytics = new MockAnalytics();
    app = new App(game, ai, ui, analytics);

    // Mock UI elements
    container = document.createElement("div");
    for (const [key, value] of Object.entries(ui.id)) {
      const el = document.createElement("div");
      el.id = value;
      // Add mock addEventListener and style for buttons
      if (key.includes("Button")) {
        el.addEventListener = (event, handler) => {
          el.handler = handler;
        };
        el.style = {};
      }
      container.appendChild(el);
    }
    document.body.appendChild(container);
  });

  after(() => {});

  describe("Initialization", () => {
    it("init() should initialize the game and UI", () => {
      app.init();
      expect(game.findStartingPlayerCalled).to.be.true;
      expect(ui.initCalled).to.be.true;
      expect(ui.startGameButton.handler).to.exist;
    });

    it("init() should load a saved game if one exists and is not over", () => {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = false;
      const setPlayersSpy = sinon.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(game.initCalled).to.be.false;
      expect(setPlayersSpy.called).to.be.false;
    });

    it("init() should start a new game if no saved game exists", () => {
      game.loadWillSucceed = false;
      const setPlayersSpy = sinon.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if the saved game is over", () => {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      const setPlayersSpy = sinon.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });

  describe("Factory Function", () => {
    it("should create an App instance with all dependencies", () => {
      const initSpy = sinon.spy(App.prototype, "init");

      const app = App.create("test-key", MockDeck, MockGame, MockAI, MockUI, MockAnalytics);

      expect(app).to.be.an.instanceOf(App);
      expect(app.game).to.be.an.instanceOf(MockGame);
      expect(app.ai).to.be.an.instanceOf(MockAI);
      expect(app.ui).to.be.an.instanceOf(MockUI);
      expect(app.analytics).to.be.an.instanceOf(MockAnalytics);
      expect(initSpy.calledOnce).to.be.true;

      initSpy.restore();
    });
  });

  describe("Event Handlers", () => {
    beforeEach(() => {
      app.init();
    });

    it("attachHandlers() should attach event listeners to UI buttons", () => {
      const playButtonSpy = sinon.spy(ui.playButton, "addEventListener");
      const passButtonSpy = sinon.spy(ui.passButton, "addEventListener");
      const startGameButtonSpy = sinon.spy(ui.startGameButton, "addEventListener");
      const newGameButtonSpy = sinon.spy(ui.newGameButton, "addEventListener");
      const resetButtonSpy = sinon.spy(ui.resetButton, "addEventListener");

      app.attachHandlers();

      expect(playButtonSpy.calledWith("click")).to.be.true;
      expect(passButtonSpy.calledWith("click")).to.be.true;
      expect(startGameButtonSpy.calledWith("click")).to.be.true;
      expect(newGameButtonSpy.calledWith("click")).to.be.true;
      expect(resetButtonSpy.calledWith("click")).to.be.true;
    });

    it("handleStartGameClick() should start the game and trigger the next turn", () => {
      const nextTurnSpy = sinon.spy(app, "nextTurn");
      ui.startGameButton.handler(); // Simulate click
      expect(game.startCalled).to.be.true;
      expect(game.saveCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(nextTurnSpy.called).to.be.true;
    });

    it("handleNewGameClick() should re-initialize the game", () => {
      const initSpy = sinon.spy(app, "init");
      ui.newGameButton.handler(); // Simulate click
      expect(game.initCalled).to.be.true;
      expect(game.saveCalled).to.be.true;
      expect(initSpy.called).to.be.true;
      initSpy.restore();
    });

    it("handleResetButtonClick() should clear storage and reset the game", () => {
      const clearStorageSpy = sinon.spy(app, "clearStorage");
      const appInitSpy = sinon.spy(app, "init");
      const analyticsSpy = sinon.spy(analytics, "gameReset");
      ui.resetButton.handler(); // Simulate click
      expect(clearStorageSpy.called).to.be.true;
      expect(game.resetCalled).to.be.true;
      expect(appInitSpy.called).to.be.true;
      expect(analyticsSpy.called).to.be.true;
      appInitSpy.restore();
    });
    it("handleHumanPlay() should call the human player's play handler", () => {
      game.gameState.currentPlayer = 0; // Human
      const humanPlayer = game.gameState.players[0];
      const playSpy = sinon.spy(humanPlayer, "handlePlayButtonClick");
      app.handleHumanPlay();
      expect(playSpy.called).to.be.true;
    });

    it("handleHumanPass() should call the human player's pass handler", () => {
      game.gameState.currentPlayer = 0; // Human
      const humanPlayer = game.gameState.players[0];
      const passSpy = sinon.spy(humanPlayer, "handlePassButtonClick");
      app.handleHumanPass();
      expect(passSpy.called).to.be.true;
    });
  });

  describe("Turn Logic", () => {
    beforeEach(() => {
      app.init();
      ui.startGameButton.handler();
    });

    it("nextTurn() should not call handleAITurn for a human player", () => {
      game.gameState.currentPlayer = 0; // Human
      const handleAITurnSpy = sinon.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("nextTurn() should call handleAITurn for an AI player", () => {
      game.gameState.currentPlayer = 1; // AI
      const handleAITurnSpy = sinon.spy(app, "handleAITurn");
      app.nextTurn();
      sinon.clock.tick(1001); // Advance timers past the 1000ms delay
      expect(handleAITurnSpy.called).to.be.true;
    });
    it("nextTurn() should do nothing if the game is over", () => {
      game.gameState.gameOver = true;
      const handleAITurnSpy = sinon.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("handleAITurn() should return early if the current player is not an AI", () => {
      game.gameState.currentPlayer = 0; // Human player
      const humanPlayer = game.gameState.players[0];
      humanPlayer.type = PLAYER_TYPES.HUMAN; // Ensure type is human
      const takeTurnSpy = sinon.spy(ai, "takeTurn");

      app.handleAITurn();

      expect(takeTurnSpy.called).to.be.false;
    });

    it("handleAITurn() should play cards when a move is available", () => {
      const move = [new Card("3", "♠")];
      ai.move = move; // Configure MockAI to return a move
      game.gameState.currentPlayer = 1; // AI
      const playCardsSpy = sinon.spy(game, "playCards");

      app.handleAITurn();

      expect(ai.takeTurnCalled).to.be.true;
      expect(playCardsSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("handleAITurn() should pass turn when no move is available", () => {
      ai.move = []; // Configure MockAI to return no move
      game.gameState.currentPlayer = 1; // AI
      const passTurnSpy = sinon.spy(game, "passTurn");

      app.handleAITurn();

      expect(ai.takeTurnCalled).to.be.true;
      expect(passTurnSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });
});
