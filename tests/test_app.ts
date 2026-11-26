import { expect } from "chai";
import { AI_PERSONAS } from "../src/app/ai/personas.js";
import { afterEach, beforeEach, describe } from "mocha";
import * as sinon from "sinon";
import { App } from "../src/app/app.js";
import { Card } from "../src/app/game/index.js";
import { PLAYER_TYPES } from "../src/app/player/index.js";
import { MockAI, MockDeck, MockGame, MockUI, MockAnalytics } from "./mocks.ts";
import { GameClient } from "../src/app/game/index.js";

describe("App", function () {
  let app: App, game: MockGame, gameClient: GameClient, ai: MockAI, ui: MockUI, analytics: MockAnalytics, container, clock;

  beforeEach(function () {
    this.sandbox = sinon.createSandbox();
    clock = this.sandbox.useFakeTimers();
    game = new MockGame(new MockDeck(), "test-key");
    gameClient = new GameClient(game);
    ai = new MockAI(gameClient, null);
    ui = new MockUI(gameClient);
    analytics = new MockAnalytics();

    // Default: no saved game
    game.loadWillSucceed = false;

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
    it("init() should initialize the game and UI", async function () {
      await app.init();
      expect(game.initCalled).to.be.true;
      expect(ui.initCalled).to.be.true;
    });

    it("init() should use default setTimeout", async function () {
      await app.init();
      expect(typeof app.setTimeout).to.equal("function");
      expect(app.setTimeout).to.not.be.null;
    });

    it("init() should load a saved game if one exists and is not over", async function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = false;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      await app.init();

      expect(game.loadCalled).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(game.initCalled).to.be.false;
      expect(setPlayersSpy.called).to.be.true;
    });

    it("init() should restore AI configuration from saved game state", async function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = false;

      // Pre-set AI configuration on the game state so getNumAIPlayers/getAIPersonas
      // return the expected values when init() calls them
      game.gameState.numAIPlayers = 2;
      game.gameState.aiPersonas = [AI_PERSONAS.aggressive.name, AI_PERSONAS.conservative.name];

      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      await app.init();

      expect(game.loadCalled).to.be.true;
      expect(app.numAIPlayers).to.equal(2);
      expect(app.aiPlayers.length).to.equal(2);
      expect(setPlayersSpy.called).to.be.true;
      // Verify setPlayers was called with human + 2 AI players
      const callArgs = setPlayersSpy.firstCall.args[0];
      expect(callArgs).to.have.lengthOf(3);
      expect(callArgs[0].type).to.equal("human");
      expect(callArgs[1].type).to.equal("ai");
      expect(callArgs[2].type).to.equal("ai");
    });

    it("init() should create default AI configuration when no saved game exists", async function () {
      game.loadWillSucceed = false;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      await app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(app.numAIPlayers).to.equal(1);
      expect(app.aiPlayers.length).to.equal(1);
      expect(setPlayersSpy.called).to.be.true;
      // Verify setPlayers was called with human + 1 AI player
      const callArgs = setPlayersSpy.firstCall.args[0];
      expect(callArgs).to.have.lengthOf(2);
      expect(callArgs[0].type).to.equal("human");
      expect(callArgs[1].type).to.equal("ai");
    });

    it("init() should start a new game if the saved game is over", async function () {
      game.loadWillSucceed = true;
      game.gameOverOnLoad = true;
      game.gameState.numAIPlayers = 2;
      game.gameState.aiPersonas = [AI_PERSONAS.aggressive.name, AI_PERSONAS.conservative.name];
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      await app.init();

      expect(game.loadCalled).to.be.true;
      expect(game.initCalled).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
      expect(app.numAIPlayers).to.equal(2);
      expect(app.aiPlayers.length).to.equal(2);
    });
  });

  describe("Factory Function", function () {
    it("should create an App instance with all dependencies", async function () {
      const initSpy = sinon.spy(App.prototype, "init");

      const app = await App.create({
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

  describe("AI Player Management", function () {
    it("addAIPlayer() should create a new AI player and increment numAIPlayers", async function () {
      await app.addAIPlayer();

      expect(app.aiPlayers.length).to.equal(1);
      expect(app.numAIPlayers).to.equal(2); // started at 1
    });

    it("addAIPlayer() should create multiple AI players with incrementing indices", async function () {
      await app.addAIPlayer();
      await app.addAIPlayer();

      expect(app.aiPlayers.length).to.equal(2);
      expect(app.numAIPlayers).to.equal(3); // started at 1, added 2
    });

    it("removeAIPlayer() should remove the last AI player and decrement numAIPlayers", async function () {
      await app.addAIPlayer();
      expect(app.aiPlayers.length).to.equal(1);
      expect(app.numAIPlayers).to.equal(2);

      app.removeAIPlayer();

      expect(app.aiPlayers.length).to.equal(0);
      expect(app.numAIPlayers).to.equal(1);
    });

    it("removeAIPlayer() should do nothing when no AI players exist", function () {
      app.removeAIPlayer();

      expect(app.aiPlayers.length).to.equal(0);
      expect(app.numAIPlayers).to.equal(1); // unchanged
    });
  });

  describe("Event Handlers", function () {
    it("attachHooks() should attach analytics hooks correctly", function () {
      const gameInitSpy = this.sandbox.spy(analytics, "gameInit");
      const gameResetSpy = this.sandbox.spy(analytics, "gameReset");

      app.attachHooks();

      gameClient.init();
      expect(gameInitSpy.called).to.be.true;

      gameClient.reset();
      expect(gameResetSpy.called).to.be.true;
    });

    it("handleAISelection() should update persona and call setPlayers when humanPlayer and AI players exist", async function () {
      await app.init();

      const setAIPersonaSpy = this.sandbox.spy(gameClient, "setAIPersona");
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      ui.emit("aiChanged", { persona: AI_PERSONAS.aggressive.name, playerIndex: 1 });

      expect(app.selectedAI).to.equal(AI_PERSONAS.aggressive.name);
      expect(setAIPersonaSpy.calledWith(1, AI_PERSONAS.aggressive.name)).to.be.true;
      expect(setPlayersSpy.called).to.be.true;
      // setPlayers should include human + AI player
      const players = setPlayersSpy.firstCall.args[0];
      expect(players).to.have.lengthOf(2);
      expect(players[0].type).to.equal("human");
      expect(players[1].type).to.equal("ai");
    });

    it("handleAISelection() should not call setAIPersona when no AI players exist", async function () {
      await app.init();

      // Remove AI players
      app.aiPlayers = [];
      app.numAIPlayers = 0;

      const setAIPersonaSpy = this.sandbox.spy(gameClient, "setAIPersona");
      app.handleAISelection(AI_PERSONAS.aggressive.name);

      expect(setAIPersonaSpy.called).to.be.false;
    });

    it("handleAISelection() should not call setPlayers when humanPlayer is null", function () {
      app.humanPlayer = null;
      app.aiPlayers = [{ type: "ai" }];

      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");
      app.handleAISelection(AI_PERSONAS.aggressive.name);

      expect(setPlayersSpy.called).to.be.false;
    });

    it("handleStartGameClick() should call start() with human + all AI players", async function () {
      await app.init();

      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");
      const nextTurnSpy = this.sandbox.spy(app, "nextTurn");

      ui.emit("startClicked");

      // setPlayers should NOT be called here (it was called during init())
      expect(setPlayersSpy.called).to.be.false;
      expect(game.startCalled).to.be.true;
      expect(nextTurnSpy.called).to.be.true;
      clock.tick(1001);
    });

    it("handleStartGameClick() should return early if no human player exists", async function () {
      await app.init();

      // Override getFirstHumanPlayer to return undefined
      gameClient.getFirstHumanPlayer = () => undefined;
      const setPlayersSpy = this.sandbox.spy(gameClient, "setPlayers");

      app.handleStartGameClick();

      expect(setPlayersSpy.called).to.be.false;
      expect(game.startCalled).to.be.false;
    });

    it("handleNewGameClick() should re-initialize the game", async function () {
      await app.init();
      const preGameNumAIPlayers = app.numAIPlayers;
      const preGameAIPlayersLength = app.aiPlayers.length;
      const initSpy = this.sandbox.spy(app, "init");
      ui.emit("newGameClicked");
      expect(game.initCalled).to.be.true;
      expect(game.saveCalled).to.be.true;
      expect(initSpy.called).to.be.true;
      clock.tick(1001);
      expect(app.numAIPlayers).to.equal(preGameNumAIPlayers);
      expect(app.aiPlayers.length).to.equal(preGameAIPlayersLength);
    });

    it("handleResetButtonClick() should clear storage and reset the game", async function () {
      await app.init();
      const clearStorageSpy = this.sandbox.spy(app, "clearStorage");
      const appInitSpy = this.sandbox.spy(app, "init");
      const analyticsSpy = this.sandbox.spy(analytics, "gameReset");
      ui.emit("resetClicked");
      expect(clearStorageSpy.called).to.be.true;
      expect(game.resetCalled).to.be.true;
      expect(appInitSpy.called).to.be.true;
      expect(analyticsSpy.called).to.be.true;
    });

    it("handleCancelClick() should clear selected cards", async function () {
      await app.init();
      gameClient.setCurrentPlayer(0); // Human
      const selectedCards = [new Card("3", "♠"), new Card("4", "♦")];
      gameClient.toggleCardSelection(selectedCards[0]);
      gameClient.toggleCardSelection(selectedCards[1]);
      const clearSelectedSpy = this.sandbox.spy(gameClient, "clearSelectedCards");
      const renderSelectedSpy = this.sandbox.spy(ui, "renderSelectedCards");

      ui.emit("cancelClicked");

      expect(clearSelectedSpy.called).to.be.true;
      expect(renderSelectedSpy.called).to.be.true;
      expect(gameClient.getSelectedCards()).to.have.lengthOf(0);
    });

    it("handleHumanPlay() should call game.playCards on valid play", async function () {
      await app.init();
      gameClient.setCurrentPlayer(0); // Human
      const playSpy = this.sandbox.spy(game, "playCards");
      const selectedCards = [new Card("3", "♠")];
      gameClient.toggleCardSelection(selectedCards[0]);
      this.sandbox.stub(gameClient, "isValidPlay").returns(true);

      app.handleHumanPlay();

      expect(playSpy.called).to.be.true;
    });

    it("handleHumanPlay() should show a message on invalid play", async function () {
      await app.init();
      gameClient.setCurrentPlayer(0); // Human
      const playSpy = this.sandbox.spy(game, "playCards");
      const displayMessageSpy = this.sandbox.spy(ui, "displayMessage");
      const selectedCards = [new Card("3", "♠")];
      gameClient.toggleCardSelection(selectedCards[0]);
      this.sandbox.stub(gameClient, "isValidPlay").returns(false);

      app.handleHumanPlay();

      expect(playSpy.called).to.be.false;
      expect(displayMessageSpy.calledWith("Invalid play", "error")).to.be.true;
    });

    it("handleHumanPass() should call game.passTurn", async function () {
      await app.init();
      gameClient.setCurrentPlayer(0); // Human
      const passStub = this.sandbox.stub(game, "passTurn").returns(true);

      app.handleHumanPass();

      expect(passStub.called).to.be.true;
    });

    it("handleHumanPass() should show a message on invalid pass", async function () {
      await app.init();
      gameClient.setCurrentPlayer(0); // Human
      const displayMessageSpy = this.sandbox.spy(ui, "displayMessage");
      const passStub = this.sandbox.stub(game, "passTurn").returns(false);

      app.handleHumanPass();

      expect(passStub.called).to.be.true;
      expect(displayMessageSpy.calledWith("You cannot pass on the first play of a round.", "error")).to.be.true;
    });

    it("handleCardClick() should toggle card selection", async function () {
      await app.init();
      const card = new Card("3", "♠");
      const toggleSpy = this.sandbox.spy(gameClient, "toggleCardSelection");
      const renderSpy = this.sandbox.spy(ui, "renderSelectedCards");

      app.handleCardClick(card);

      expect(toggleSpy.calledWith(card)).to.be.true;
      expect(renderSpy.called).to.be.true;
    });
  });

  describe("Turn Logic", function () {
    it("nextTurn() should not call handleAITurn for a human player", async function () {
      await app.init();
      ui.emit("startClicked");
      gameClient.setCurrentPlayer(0); // Human
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      app.nextTurn();
      expect(handleAITurnSpy.called).to.be.false;
    });

    it("nextTurn() should call handleAITurn for an AI player", async function () {
      await app.init();
      gameClient.setCurrentPlayer(1); // AI
      // Stub takeTurn since init() doesn't deal cards
      const aiPlayer = gameClient.getPlayers(1);
      this.sandbox.stub(aiPlayer.ai, "takeTurn").returns([]);
      // Stub setTimeoutFn directly since the mock game doesn't have setTimeout
      const setTimeoutFnStub = this.sandbox.stub(app, "setTimeout").callsFake((fn) => setTimeout(fn, 2000) as any);
      app.nextTurn();
      expect(setTimeoutFnStub.calledOnce).to.be.true;
      expect(setTimeoutFnStub.getCall(0).args[1]).to.equal(2000);

      // Manually trigger the callback passed to setTimeout
      const callback = setTimeoutFnStub.getCall(0).args[0];
      const handleAITurnSpy = this.sandbox.spy(app, "handleAITurn");
      callback();

      expect(handleAITurnSpy.calledOnce).to.be.true;
    });

    it("nextTurn() should do nothing if the game is over", async function () {
      await app.init();
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

    it("handleAITurn() should play cards when a move is available", async function () {
      await app.init();
      const move = [new Card("3", "♠")];
      const aiPlayer = gameClient.getPlayers(1);
      // Stub takeTurn since init() doesn't deal cards
      this.sandbox.stub(aiPlayer.ai, "takeTurn").returns(move);
      gameClient.setCurrentPlayer(1); // AI
      // Stub playCards to avoid undefined playerHands error from init()'s sparse array
      const playCardsStub = this.sandbox.stub(game, "playCards");

      app.handleAITurn();

      expect(playCardsStub.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });

    it("handleAITurn() should pass turn when no move is available", async function () {
      await app.init();
      const aiPlayer = gameClient.getPlayers(1);
      // Stub takeTurn since init() doesn't deal cards
      this.sandbox.stub(aiPlayer.ai, "takeTurn").returns([]);
      gameClient.setCurrentPlayer(1); // AI
      gameClient.setPlayPile([new Card("10", "♠")]); // Not the first play
      const passTurnSpy = this.sandbox.spy(game, "passTurn");

      app.handleAITurn();

      expect(passTurnSpy.called).to.be.true;
      expect(ui.renderCalled).to.be.true;
    });
  });

  describe("Round Winner Highlight", function () {
    beforeEach(function () {
      // Create real player-hand-X elements since MockUI.renderPlayerHands() is a no-op
      const playersHandsEl = document.createElement("div");
      playersHandsEl.id = ui.id.playersHands;
      document.body.appendChild(playersHandsEl);
      ui.playersHands = playersHandsEl;

      for (let i = 0; i < 3; i++) {
        const handDiv = document.createElement("div");
        handDiv.id = `player-hand-${i}`;
        handDiv.classList.add("player-hand");
        playersHandsEl.appendChild(handDiv);
      }
    });

    it("highlightRoundWinner() should not highlight when round has not ended", async function () {
      await app.init();
      app.highlightRoundWinner();
      expect(app.lastRoundWinnerIndex).to.equal(null);
    });

    it("highlightRoundWinner() should highlight the last player to play when round ends", async function () {
      await app.init();
      // Simulate round ending: player 1 is last to play, others have passed
      game.gameState.lastPlayerToPlay = 1;
      game.gameState.playerPassed = [true, false, true];
      game.gameState.numPlayers = 3;
      game.gameState.roundEnded = true;

      ui.renderPlayerHands();
      app.highlightRoundWinner();

      expect(app.lastRoundWinnerIndex).to.equal(1);
      const handDiv = document.getElementById("player-hand-1");
      expect(handDiv!.classList.contains("round-winner")).to.be.true;
    });

    it("highlightRoundWinner() should clear previous round winner and highlight new one", async function () {
      await app.init();
      ui.renderPlayerHands();

      // First round: player 0 won
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();
      expect(app.lastRoundWinnerIndex).to.equal(0);
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;

      // Second round: player 2 won
      game.gameState.lastPlayerToPlay = 2;
      game.gameState.playerPassed = [true, true, false];
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();
      expect(app.lastRoundWinnerIndex).to.equal(2);
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.false;
      expect(document.getElementById("player-hand-2")!.classList.contains("round-winner")).to.be.true;
    });

    it("highlightRoundWinner() should not clear roundEnded flag", async function () {
      await app.init();
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();

      expect(game.gameState.roundEnded).to.be.false; // cleared after first use
    });

    it("clearRoundWinnerHighlight() should remove green when the winner plays", async function () {
      await app.init();
      ui.renderPlayerHands();
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;

      // Winner plays their first card in next round
      app.clearRoundWinnerHighlight();
      expect(app.lastRoundWinnerIndex).to.equal(null);
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.false;
    });

    it("clearRoundWinnerHighlight() should NOT clear when game is over (game winner stays green)", async function () {
      await app.init();
      ui.renderPlayerHands();
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.roundEnded = true;
      game.gameState.gameOver = true;

      app.highlightRoundWinner();
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;

      // Game over: clearRoundWinnerHighlight should NOT remove the green
      app.clearRoundWinnerHighlight();
      expect(app.lastRoundWinnerIndex).to.equal(0); // not cleared
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;
    });

    it("handleHumanPlay() should keep game winner green when game is over", async function () {
      await app.init();
      ui.renderPlayerHands();
      // Simulate game over
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.gameOver = true;
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;
    });

    it("handleHumanPass() should keep game winner green when game is over", async function () {
      await app.init();
      ui.renderPlayerHands();
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerPassed = [false, true, true];
      game.gameState.numPlayers = 3;
      game.gameState.gameOver = true;
      game.gameState.roundEnded = true;

      app.highlightRoundWinner();
      expect(document.getElementById("player-hand-0")!.classList.contains("round-winner")).to.be.true;
    });

    it("nextTurn() should skip passed AI players quickly (200ms instead of 2000ms)", async function () {
      await app.init();
      const aiPlayer = gameClient.getPlayers(1);
      this.sandbox.stub(aiPlayer.ai, "takeTurn").returns([]);
      const setTimeoutFnStub = this.sandbox.stub(app, "setTimeout").callsFake((fn) => setTimeout(fn, 1000) as any);

      // Make the current player (AI at index 1) have passed
      game.gameState.currentPlayer = 1;
      game.gameState.playerPassed = [false, true, false];
      game.gameState.gameStarted = true;

      app.nextTurn();
      expect(setTimeoutFnStub.calledOnce).to.be.true;
      expect(setTimeoutFnStub.getCall(0).args[1]).to.equal(200); // 200ms for passed player
    });
  });

  describe("Resignation", function () {
    beforeEach(function () {
      game.loadWillSucceed = false;
      gameClient.setCurrentPlayer(0); // Human
    });

    it("handleResignClick() should set resignConfirming to true on first click", async function () {
      await app.init();
      game.gameState.resignConfirming = false;

      app.handleResignClick();

      expect(game.gameState.resignConfirming).to.be.true;
    });

    it("handleResignClick() should call game.resign() when confirming", async function () {
      await app.init();
      game.gameState.resignConfirming = true;
      game.gameState.gamesPlayed = [0, 0];
      game.gameState.gamesWon = [0, 0];
      game.gameState.gamesResigned = [0, 0];
      const resignSpy = this.sandbox.spy(game, "resign");

      app.handleResignClick();

      expect(resignSpy.calledWith(0)).to.be.true;
      expect(game.gameState.resignConfirming).to.be.false;
      expect(game.gameState.gameOver).to.be.true;
      expect(game.gameState.resigned).to.be.true;
    });

    it("handleResignClick() during confirmation should trigger analytics gameResigned event", async function () {
      await app.init();
      game.gameState.resignConfirming = true;
      game.gameState.gamesPlayed = [0, 0];
      game.gameState.gamesWon = [0, 0];
      game.gameState.gamesResigned = [0, 0];
      const analyticsSpy = this.sandbox.spy(analytics, "gameResigned");

      app.handleResignClick();

      expect(analyticsSpy.called).to.be.true;
    });

    it("handleCancelClick() during resignation confirmation should cancel without clearing cards", async function () {
      await app.init();
      game.gameState.resignConfirming = true;
      const selectedCards = [new Card("3", "♠"), new Card("4", "♦")];
      gameClient.toggleCardSelection(selectedCards[0]);
      gameClient.toggleCardSelection(selectedCards[1]);
      const clearSelectedSpy = this.sandbox.spy(gameClient, "clearSelectedCards");
      const resignSpy = this.sandbox.spy(game, "resign");

      ui.emit("cancelClicked");

      expect(game.gameState.resignConfirming).to.be.false;
      expect(clearSelectedSpy.called).to.be.false;
      expect(resignSpy.called).to.be.false;
      // Cards should still be selected
      expect(gameClient.getSelectedCards()).to.have.lengthOf(2);
    });

    it("handleCancelClick() normally should still clear selected cards", async function () {
      await app.init();
      game.gameState.resignConfirming = false;
      const selectedCards = [new Card("3", "♠"), new Card("4", "♦")];
      gameClient.toggleCardSelection(selectedCards[0]);
      gameClient.toggleCardSelection(selectedCards[1]);
      const clearSelectedSpy = this.sandbox.spy(gameClient, "clearSelectedCards");
      const renderSelectedSpy = this.sandbox.spy(ui, "renderSelectedCards");

      ui.emit("cancelClicked");

      expect(clearSelectedSpy.called).to.be.true;
      expect(renderSelectedSpy.called).to.be.true;
      expect(gameClient.getSelectedCards()).to.have.lengthOf(0);
    });

    it("gameResigned should track gamesResigned count on resignation", async function () {
      await app.init();
      game.gameState.resignConfirming = true;
      game.gameState.gamesResigned = [0, 0];
      game.gameState.gamesPlayed = [0, 0];
      game.gameState.gamesWon = [0, 0];

      app.handleResignClick();

      expect(game.gameState.gamesResigned[0]).to.equal(1);
    });
  });
});
