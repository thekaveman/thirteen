import { App } from "../src/app/app.js";
import { PLAYER_TYPES } from "../src/app/constants.js";
import { Card } from "../src/app/deck.js";
import { AIPlayer, HumanPlayer } from "../src/app/player/index.js";
import { MockAI, MockDeck, MockGame, MockUI, MockAnalytics } from "./mocks.js";

describe("App", function () {
  let app, game, ai, ui, analytics, container, clock;

  beforeEach(function () {
    this.sandbox = sinon.createSandbox();
    clock = this.sandbox.useFakeTimers();
    game = new MockGame(new MockDeck(), "test-key");
    ai = new MockAI(game);
    ui = new MockUI(game);
    analytics = new MockAnalytics();
    app = new App(game, ui, analytics);

    // Override createPlayers for this test file to inject the mock AI
    game.createPlayers = (ui) => {
      const human = new HumanPlayer(game, 0, ui);
      const aiPlayer = new AIPlayer(game, 1, ai); // Use the mock AI
      return [human, aiPlayer];
    };

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

  afterEach(function () {
    this.sandbox.restore();
    clock.uninstall();
  });

  describe("Initialization", function () {
    it("init() should initialize the game and UI", function () {
      app.init();
      expect(game.findStartingPlayerCalled).to.be.true;
      expect(ui.initCalled).to.be.true;
      expect(ui.startGameButton.handler).to.exist;
    });

    it("init() should use default setTimeout", function () {
      app.init();
      expect(typeof app.setTimeout).to.equal("function");
      expect(app.setTimeout).to.not.be.null;
    });

    it("init() should load a saved game if one exists and is not over", function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = false;
      const setPlayersSpy = this.sandbox.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(game.initCalled).to.be.false;
      expect(setPlayersSpy.called).to.be.false;
    });

    it("init() should start a new game if no saved game exists (false branch of load)", function () {
      game.loadWillSucceed = false;
      const setPlayersSpy = this.sandbox.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if no saved game exists", function () {
      game.loadWillSucceed = false;
      const setPlayersSpy = this.sandbox.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if the saved game is over", function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      const setPlayersSpy = this.sandbox.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if the saved game is over (false branch of gameOver)", function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      const setPlayersSpy = this.sandbox.spy(game, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });

  describe("Factory Function", function () {
    it("should create an App instance with all dependencies", function () {
      const initSpy = sinon.spy(App.prototype, "init");

      const app = App.create({
        stateKey: "test-key",
        DeckClass: MockDeck,
        GameClass: MockGame,
        aiPersona: "random",
        UIClass: MockUI,
        AnalyticsClass: MockAnalytics,
      });

      expect(app).to.be.an.instanceOf(App);
      expect(app.game).to.be.an.instanceOf(MockGame);
      expect(app.ui).to.be.an.instanceOf(MockUI);
      expect(app.analytics).to.be.an.instanceOf(MockAnalytics);
      expect(initSpy.calledOnce).to.be.true;
      expect(initSpy.calledWith("random")).to.be.true;

      initSpy.restore();
    });
  });

  describe("Event Handlers", function () {
    it("attachHandlers() should attach event listeners to UI buttons", function () {
      app.init();
      const playButtonSpy = this.sandbox.spy(ui.playButton, "addEventListener");
      const passButtonSpy = this.sandbox.spy(ui.passButton, "addEventListener");
      const startGameButtonSpy = this.sandbox.spy(ui.startGameButton, "addEventListener");
      const newGameButtonSpy = this.sandbox.spy(ui.newGameButton, "addEventListener");
      const resetButtonSpy = this.sandbox.spy(ui.resetButton, "addEventListener");

      app.attachHandlers();

      expect(playButtonSpy.calledWith("click")).to.be.true;
      expect(passButtonSpy.calledWith("click")).to.be.true;
      expect(startGameButtonSpy.calledWith("click")).to.be.true;
      expect(newGameButtonSpy.calledWith("click")).to.be.true;
      expect(resetButtonSpy.calledWith("click")).to.be.true;
    });

    it("handleStartGameClick() should start the game and trigger the next turn", function () {
      const nextTurnSpy = this.sandbox.spy(app, "nextTurn");
      app.init();
      ui.startGameButton.handler(); // Simulate click
      expect(game.startCalled).to.be.true;
      expect(game.saveCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(nextTurnSpy.called).to.be.true;
      clock.tick(1001); // Advance timers to trigger AI turn if scheduled
    });

    it("handleNewGameClick() should re-initialize the game", function () {
      const initSpy = this.sandbox.spy(app, "init");
      app.init();
      ui.newGameButton.handler(); // Simulate click
      expect(game.initCalled).to.be.true;
      expect(game.saveCalled).to.be.true;
      expect(initSpy.called).to.be.true;
      clock.tick(1001); // Advance timers to trigger AI turn if scheduled
    });

    it("handleResetButtonClick() should clear storage and reset the game", function () {
      app.init();
      const clearStorageSpy = this.sandbox.spy(app, "clearStorage");
      const appInitSpy = this.sandbox.spy(app, "init");
      const analyticsSpy = this.sandbox.spy(analytics, "gameReset");
      ui.resetButton.handler(); // Simulate click
      expect(clearStorageSpy.called).to.be.true;
      expect(game.resetCalled).to.be.true;
      expect(appInitSpy.called).to.be.true;
      expect(analyticsSpy.called).to.be.true;
    });

    it("handleHumanPlay() should call the human player's play handler", function () {
      app.init();
      game.gameState.currentPlayer = 0; // Human
      const humanPlayer = game.gameState.players[0];
      const playSpy = this.sandbox.spy(humanPlayer, "handlePlayButtonClick");
      app.handleHumanPlay();
      expect(playSpy.called).to.be.true;
      clock.tick(1001); // Advance timers to trigger AI turn if scheduled
    });

    it("handleHumanPass() should call the human player's pass handler", function () {
      app.init();
      game.gameState.currentPlayer = 0; // Human
      const humanPlayer = game.gameState.players[0];
      const passSpy = this.sandbox.spy(humanPlayer, "handlePassButtonClick");
      app.handleHumanPass();
      expect(passSpy.called).to.be.true;
      clock.tick(1001); // Advance timers to trigger AI turn if scheduled
    });
  });

  describe("Turn Logic", function () {
    it("nextTurn() should not call handleAITurn for a human player", function () {
      app.init();
      ui.startGameButton.handler();
      game.gameState.currentPlayer = 0; // Human
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("nextTurn() should call handleAITurn for an AI player", function () {
      app.init();
      game.gameState.currentPlayer = 1; // AI
      const setTimeoutSpy = this.sandbox.spy(app, "setTimeout");
      app.nextTurn();
      expect(setTimeoutSpy.calledOnce).to.be.true;
      expect(setTimeoutSpy.getCall(0).args[1]).to.equal(1000);

      // Manually trigger the callback passed to setTimeout
      const callback = setTimeoutSpy.getCall(0).args[0];
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      callback();

      expect(handleAITurnSpy.calledOnce).to.be.true;
    });

    it("nextTurn() should do nothing if the game is over", function () {
      game.gameState.gameOver = true;
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("handleAITurn() should return early if the current player is not an AI", function () {
      const humanPlayer = { type: PLAYER_TYPES.HUMAN };
      game.gameState.currentPlayer = 0; // Human player
      game.gameState.players = [humanPlayer];
      const takeTurnSpy = this.sandbox.spy(ai, "takeTurn");

      app.handleAITurn();

      expect(takeTurnSpy.called).to.be.false;
    });

    it("should play cards when a move is available", function () {
      app.init();
      const aiPlayer = game.gameState.players.find((p) => p.type === PLAYER_TYPES.AI);
      const mockAI = aiPlayer.ai;
      const move = [new Card("3", "♠")];
      mockAI.move = move; // Configure MockAI to return a move
      game.gameState.currentPlayer = 1; // AI
      const playCardsSpy = this.sandbox.spy(game, "playCards");

      app.handleAITurn();

      expect(mockAI.takeTurnCalled).to.be.true;
      expect(playCardsSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("should pass turn when no move is available", function () {
      app.init();
      const aiPlayer = game.gameState.players.find((p) => p.type === PLAYER_TYPES.AI);
      const mockAI = aiPlayer.ai;
      mockAI.move = []; // Configure MockAI to return no move
      game.gameState.currentPlayer = 1; // AI
      const passTurnSpy = this.sandbox.spy(game, "passTurn");

      app.handleAITurn();

      expect(mockAI.takeTurnCalled).to.be.true;
      expect(passTurnSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });
});
