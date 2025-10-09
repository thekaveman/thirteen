import { App } from "../src/app/app.js";
import { Card } from "../src/app/game/index.js";
import { AIPlayer, HumanPlayer, PLAYER_TYPES } from "../src/app/player/index.js";
import { MockAI, MockDeck, MockGame, MockUI, MockAnalytics, MockGameClient } from "./mocks.js";

describe("App", function () {
  let app, game, gameClient, ai, ui, analytics, container, clock;

  beforeEach(function () {
    this.sandbox = sinon.createSandbox();
    clock = this.sandbox.useFakeTimers();
    game = new MockGame(new MockDeck(), "test-key");
    gameClient = new MockGameClient(game);
    ai = new MockAI(gameClient, null);
    ui = new MockUI(gameClient);
    analytics = new MockAnalytics();
    app = new App(gameClient, ui, analytics);

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
      expect(game.initCalled).to.be.true;
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
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(game.initCalled).to.be.false;
      expect(setPlayersSpy.called).to.be.true;
    });

    it("init() should start a new game if no saved game exists (false branch of load)", function () {
      game.loadWillSucceed = false;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if no saved game exists", function () {
      game.loadWillSucceed = false;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if the saved game is over", function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("init() should start a new game if the saved game is over (false branch of gameOver)", function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

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
        UIClass: MockUI,
        AnalyticsClass: MockAnalytics,
      });

      expect(app).to.be.an.instanceOf(App);
      expect(app.gameClient.game).to.be.an.instanceOf(MockGame);
      expect(app.ui).to.be.an.instanceOf(MockUI);
      expect(app.analytics).to.be.an.instanceOf(MockAnalytics);
      expect(initSpy.calledOnce).to.be.true;

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

    it("attachHooks() should attach analytics hooks correctly", function () {
      const gameInitSpy = this.sandbox.spy(analytics, "gameInit");
      const gameResetSpy = this.sandbox.spy(analytics, "gameReset");

      app.attachHooks();

      gameClient.init();
      expect(gameInitSpy.called).to.be.true;

      gameClient.reset();
      expect(gameResetSpy.called).to.be.true;
    });

    it("handleAISelection() should be called on dropdown change", function () {
      const handleSpy = this.sandbox.spy(app, "handleAISelection");
      app.init(); // this calls attachHandlers

      // Simulate change event
      ui.aiDropdown.handler();

      expect(handleSpy.called).to.be.true;
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
      gameClient.setCurrentPlayer(0); // Human
      const humanPlayer = gameClient.getPlayers(0);
      const playSpy = this.sandbox.spy(humanPlayer, "handlePlayButtonClick");
      app.handleHumanPlay();
      expect(playSpy.called).to.be.true;
      clock.tick(1001); // Advance timers to trigger AI turn if scheduled
    });

    it("handleHumanPass() should call the human player's pass handler", function () {
      app.init();
      gameClient.setCurrentPlayer(0); // Human
      const humanPlayer = gameClient.getPlayers(0);
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
      gameClient.setCurrentPlayer(0); // Human
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("nextTurn() should call handleAITurn for an AI player", function () {
      app.init();
      gameClient.setCurrentPlayer(1); // AI
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
      gameClient.setCurrentPlayer(0); // Human player
      game.gameState.players = [humanPlayer];
      const takeTurnSpy = this.sandbox.spy(ai, "takeTurn");

      app.handleAITurn();

      expect(takeTurnSpy.called).to.be.false;
    });

    it("handleAITurn() should play cards when a move is available", function () {
      app.init();
      const move = [new Card("3", "♠")];
      const aiPlayer = gameClient.getPlayers(1);
      const takeTurnStub = this.sandbox.stub(aiPlayer.ai, "takeTurn").returns(move);
      gameClient.setCurrentPlayer(1); // AI
      const playCardsSpy = this.sandbox.spy(game, "playCards");

      app.handleAITurn();

      expect(takeTurnStub.called).to.be.true;
      expect(playCardsSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("handleAITurn() should pass turn when no move is available", function () {
      app.init();
      const aiPlayer = gameClient.getPlayers(1);
      const takeTurnStub = this.sandbox.stub(aiPlayer.ai, "takeTurn").returns([]);
      gameClient.setCurrentPlayer(1); // AI
      gameClient.setPlayPile([new Card("10", "♠")]); // Not the first play
      const passTurnSpy = this.sandbox.spy(game, "passTurn");

      app.handleAITurn();

      expect(takeTurnStub.called).to.be.true;
      expect(passTurnSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });
});
