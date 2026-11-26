import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { AI_PERSONAS } from "../../src/app/ai/personas.js";
import { Card, Game } from "../../src/app/game/index.js";
import { HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockDeck, MockUI } from "../mocks.ts";
import { GameClient } from "../../src/app/game/index.js";

describe("Game", () => {
  let game: Game;

  beforeEach(() => {
    localStorage.clear();
    game = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Game Setup", () => {
    it("should initialize with correct default game state", () => {
      expect(game.gameState.numPlayers).to.equal(0);
      expect(game.gameState.playerHands).to.be.an("array").that.is.empty;
      expect(game.gameState.playPile).to.be.an("array").that.is.empty;
      expect(game.gameState.currentPlayer).to.equal(0);
      expect(game.gameState.currentTurn).to.equal(0);
      expect(game.gameState.selectedCards).to.be.an("array").that.is.empty;
      expect(game.gameState.consecutivePasses).to.equal(0);
      expect(game.gameState.lastPlayerToPlay).to.equal(-1);
      expect(game.gameState.roundNumber).to.equal(1);
      expect(game.gameState.roundsWon).to.be.an("array").that.is.empty;
      expect(game.gameState.gameOver).to.be.false;
    });

    it("init() should reset the game state for a new round", () => {
      const originalGameId = game.id;
      const originalGamesWon = [1, 1];
      game.gameState.numPlayers = 2;
      game.gameState.playerHands = [[], [new Card("A", "♠")]];
      game.gameState.playPile = [new Card("7", "♠")];
      game.gameState.currentPlayer = 1;
      game.gameState.currentTurn = 5;
      game.gameState.selectedCards = [new Card("A", "♠")];
      game.gameState.consecutivePasses = 1;
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.roundNumber = 2;
      game.gameState.roundsWon = [1, 0];
      game.gameState.gamesWon = originalGamesWon;
      game.gameState.gameStarted = true;
      game.gameState.gameOver = true;

      game.init();

      expect(game.gameState.playerHands).to.have.lengthOf(game.gameState.numPlayers);
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.currentPlayer).to.equal(0);
      expect(game.gameState.currentTurn).to.equal(0);
      expect(game.gameState.selectedCards).to.be.empty;
      expect(game.gameState.consecutivePasses).to.equal(0);
      expect(game.gameState.lastPlayerToPlay).to.equal(-1);
      expect(game.gameState.roundNumber).to.equal(1);
      expect(game.gameState.roundsWon).to.deep.equal([0, 0]);
      expect(game.gameState.gamesWon).to.deep.equal(originalGamesWon);
      expect(game.id).to.equal(originalGameId);
      expect(game.gameState.gameStarted).to.be.false;
      expect(game.gameState.gameOver).to.be.false;
    });

    it("start() should initialize the game state for starting", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];
      game.setPlayers(players);
      game.start();

      expect(game.gameState.gameStarted).to.be.true;
      expect(game.gameState.currentPlayer).to.be.oneOf([0, 1]);
      expect(game.gameState.lastPlayerToPlay).to.equal(game.gameState.currentPlayer);
    });

    it("reset() should completely reset the game", () => {
      const originalGameId = game.id;
      game.gameState.numPlayers = 2;
      game.gameState.gamesWon = [1, 2];

      game.reset();

      expect(game.id).to.not.equal(originalGameId);
      expect(game.gameState.gamesWon).to.deep.equal([0, 0]);
      expect(game.gameState.roundNumber).to.equal(1); // Check that init() was called
    });
  });

  describe("Player Management", () => {
    it("setPlayers() should initialize players and associated game state", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];
      const originalGamesWon = [2, 1];
      game.gameState.gamesWon = originalGamesWon;

      game.setPlayers(players);

      expect(game.gameState.numPlayers).to.equal(players.length);
      expect(game.gameState.players).to.have.lengthOf(players.length);
      expect(game.gameState.playerTypes).to.deep.equal(["human", "ai"]);
      expect(game.gameState.numAIPlayers).to.equal(1);
      expect(game.gameState.aiPersonas).to.have.lengthOf(1);
      expect(game.gameState.roundsWon).to.have.lengthOf(players.length);
      expect(game.gameState.roundsWon).to.deep.equal([0, 0]);
      expect(game.gameState.gamesWon).to.deep.equal(originalGamesWon);
    });

    it("setPlayers() with skipDeal should not re-deal or reset game state", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];

      // Pre-set game state to simulate a fully restored saved state
      game.gameState.numPlayers = 2;
      game.gameState.playerHands = [
        [new Card("A", "♠"), new Card("K", "♠")],
        [new Card("Q", "♠"), new Card("J", "♠")],
      ];
      game.gameState.playPile = [new Card("3", "♠")];
      game.gameState.roundsWon = [1, 0];
      game.gameState.playerPassed = [false, true];
      game.gameState.currentPlayer = 1;
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.consecutivePasses = 1;

      game.setPlayers(players, { skipDeal: true });

      // Player metadata should be set
      expect(game.gameState.numPlayers).to.equal(2);
      expect(game.gameState.playerTypes).to.deep.equal(["human", "ai"]);
      expect(game.gameState.numAIPlayers).to.equal(1);
      expect(game.gameState.aiPersonas).to.have.lengthOf(1);

      // Hands should be preserved (not re-dealt)
      expect(game.gameState.playerHands[0][0].rank).to.equal("A");
      expect(game.gameState.playerHands[0][0].suit).to.equal("♠");
      expect(game.gameState.playerHands[1][0].rank).to.equal("Q");
      expect(game.gameState.playerHands[1][0].suit).to.equal("♠");

      // Restored game state fields should NOT be overwritten
      expect(game.gameState.roundsWon).to.deep.equal([1, 0]);
      expect(game.gameState.playerPassed).to.deep.equal([false, true]);
      expect(game.gameState.currentPlayer).to.equal(1);
      expect(game.gameState.lastPlayerToPlay).to.equal(0);
      expect(game.gameState.consecutivePasses).to.equal(1);
      // playPile should be preserved (not touched)
      expect(game.gameState.playPile).to.have.lengthOf(1);
    });

    it("start() should deal cards and find starting player", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];

      game.setPlayers(players);
      game.start();

      // Should have dealt cards (13 each for 2 players from the MockDeck)
      expect(game.gameState.playerHands[0]).to.have.lengthOf(13);
      expect(game.gameState.playerHands[1]).to.have.lengthOf(13);
      expect(game.gameState.currentPlayer).to.be.a("number");
      expect(game.gameState.lastPlayerToPlay).to.equal(game.gameState.currentPlayer);
      expect(game.gameState.gameStarted).to.be.true;
    });

    it("load() should reset localStorage if version is outdated", async () => {
      // Save a state with an old version
      const oldState = {
        id: "test-id",
        deck: { cards: [] },
        gameState: { version: "0.0.0", numPlayers: 2, numAIPlayers: 0, players: [], playerHands: [], playerTurns: [], playPile: [], currentPlayer: 0, currentTurn: 0, selectedCards: [], consecutivePasses: 0, lastPlayerToPlay: -1, roundNumber: 1, roundsWon: [], gamesWon: [], gamesPlayed: [], aiPersonas: [], gameOver: false, gameStarted: false, playerTypes: [], playerPassed: [], roundEnded: false },
        stateKey: `${Game.STATE_KEY}-tests`,
      };
      localStorage.setItem(`${Game.STATE_KEY}-tests`, JSON.stringify(oldState));

      const loadResult = await game.load(new MockUI());

      expect(loadResult.loaded).to.be.false;
      expect(localStorage.getItem(`${Game.STATE_KEY}-tests`)).to.be.null;
    });

    it("load() should succeed when version matches", async () => {
      // Save a state with the current version
      const state = {
        id: "test-id",
        deck: { cards: [] },
        gameState: { ...game.gameState, version: Game.VERSION, players: [], playerHands: [], playPile: [], selectedCards: [], roundsWon: [], gamesWon: [], gamesPlayed: [] },
        stateKey: `${Game.STATE_KEY}-tests`,
      };
      localStorage.setItem(`${Game.STATE_KEY}-tests`, JSON.stringify(state));

      const loadResult = await game.load(new MockUI());

      expect(loadResult.loaded).to.be.true;
    });

    it("load() should reset localStorage if no version field exists", async () => {
      // Save a state without a version field (completely old save)
      const oldState = {
        id: "test-id",
        deck: { cards: [] },
        gameState: { numPlayers: 2, numAIPlayers: 0, players: [], playerHands: [], playerTurns: [], playPile: [], currentPlayer: 0, currentTurn: 0, selectedCards: [], consecutivePasses: 0, lastPlayerToPlay: -1, roundNumber: 1, roundsWon: [], gamesWon: [], gamesPlayed: [], aiPersonas: [], gameOver: false, gameStarted: false, playerTypes: [], playerPassed: [], roundEnded: false },
        stateKey: `${Game.STATE_KEY}-tests`,
      };
      localStorage.setItem(`${Game.STATE_KEY}-tests`, JSON.stringify(oldState));

      const loadResult = await game.load(new MockUI());

      expect(loadResult.loaded).to.be.false;
      expect(localStorage.getItem(`${Game.STATE_KEY}-tests`)).to.be.null;
    });
  });

  describe("Gameplay Logic", () => {
    it("nextPlayer() should cycle through players", () => {
      game.gameState.numPlayers = 2;
      game.gameState.currentPlayer = 0;
      game.nextPlayer();
      expect(game.gameState.currentPlayer).to.equal(1);
      game.nextPlayer();
      expect(game.gameState.currentPlayer).to.equal(0);
    });

    it("passTurn() should not be allowed on the first play of a round", () => {
      game.gameState.playPile = [];
      const originalState = { ...game.gameState };
      const passSuccessful = game.passTurn();
      expect(passSuccessful).to.be.false;
      expect(game.gameState.currentPlayer).to.equal(originalState.currentPlayer);
      expect(game.gameState.consecutivePasses).to.equal(originalState.consecutivePasses);
    });

    it("passTurn() should increment passes and switch player", () => {
      game.gameState.numPlayers = 3;
      game.gameState.currentPlayer = 0;
      game.gameState.consecutivePasses = 0;
      game.gameState.playPile = [new Card("3", "♠")];
      game.gameState.selectedCards = [new Card("A", "♠")];

      const passSuccessful = game.passTurn();

      expect(passSuccessful).to.be.true;
      expect(game.gameState.currentPlayer).to.equal(1);
      expect(game.gameState.selectedCards).to.be.empty;
      expect(game.gameState.consecutivePasses).to.equal(1);
    });

    it("passTurn() should end the round when all other players have passed", () => {
      game.gameState.numPlayers = 3;
      game.gameState.currentPlayer = 2;
      game.gameState.lastPlayerToPlay = 1;
      game.gameState.consecutivePasses = 0;
      game.gameState.roundNumber = 1;
      game.gameState.roundsWon = [0, 0, 0];
      game.gameState.playPile = [new Card("A", "♠")];
      // Player 0 already passed, player 2 (current) is now passing
      game.gameState.playerPassed = [true, false, false];

      game.passTurn();

      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.currentPlayer).to.equal(1);
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.roundsWon[1]).to.equal(1);
    });

    it("playCards() should update game state correctly", () => {
      game.gameState.currentPlayer = 0;
      game.gameState.numPlayers = 2;
      const cardToPlay = new Card("4", "♠");
      game.gameState.playerHands = [[cardToPlay, new Card("5", "♠")], []];
      game.gameState.selectedCards = [cardToPlay];
      game.gameState.playPile = [];
      game.gameState.currentTurn = 1;
      game.gameState.consecutivePasses = 1;

      game.playCards();

      expect(game.gameState.playerHands[0]).to.have.lengthOf(1);
      expect(game.gameState.playPile).to.have.lengthOf(1);
      expect(game.gameState.playPile[0].value).to.equal(Card.getValue("4", "♠"));
      expect(game.gameState.selectedCards).to.be.empty;
      expect(game.gameState.currentPlayer).to.equal(1);
      expect(game.gameState.consecutivePasses).to.equal(0);
      expect(game.gameState.lastPlayerToPlay).to.equal(0);
      expect(game.gameState.gameOver).to.be.false;
    });

    it("playCards() should end the game when a player plays their last card", () => {
      game.gameState.currentPlayer = 0;
      game.gameState.numPlayers = 2;
      const cardToPlay = new Card("4", "♠");
      game.gameState.playerHands = [[cardToPlay], []];
      game.gameState.selectedCards = [cardToPlay];
      game.gameState.gamesWon = [0, 0];

      game.playCards();

      expect(game.gameState.gameOver).to.be.true;
      expect(game.gameState.gamesWon[0]).to.equal(1);
    });

    it("win() should update game state correctly", () => {
      game.gameState.numPlayers = 2;
      game.gameState.currentPlayer = 0;
      game.gameState.gamesWon = [0, 0];
      game.gameState.roundsWon = [0, 0];
      game.gameState.playPile = [new Card("A", "♠")];
      game.gameState.gameStarted = true;

      game.win();

      expect(game.gameState.gameOver).to.be.true;
      expect(game.gameState.gameStarted).to.be.false;
      expect(game.gameState.gamesWon[0]).to.equal(1);
      expect(game.gameState.roundsWon[0]).to.equal(1);
      expect(game.gameState.playPile).to.have.lengthOf(1);
    });
  });

  describe("Save and Load", () => {
    it("save() should save the game state to localStorage", () => {
      game.save();
      const savedGame = localStorage.getItem(game.stateKey);
      expect(savedGame).to.exist;
      const parsedGame = JSON.parse(savedGame);
      expect(parsedGame.id).to.equal(game.id);
      expect(parsedGame.stateKey).to.equal(game.stateKey);
    });

    it("load() should fail for invalid saved JSON", async () => {
      localStorage.setItem(game.stateKey, "invalid json");
      try {
        await game.load(new MockUI(new GameClient(game)));
      } catch (e) {
        expect(e).to.be.an.instanceOf(SyntaxError);
      }
    });

    it("load() should not load if no saved state exists", async () => {
      const loaded = await game.load(new MockUI(new GameClient(game)));
      expect(loaded.loaded).to.be.false;
    });

    it("load() should not load if no ui is provided", async () => {
      game.save();
      const loaded = await game.load(null);
      expect(loaded.loaded).to.be.false;
    });

    it("load() should correctly rehydrate game data", async () => {
      const mockUI = new MockUI(new GameClient(game));
      const mockAI = new MockAI(new GameClient(game), [new Card("3", "♠")], AI_PERSONAS.random.name);
      const mockPlayers = [new AIPlayer(new GameClient(game), 0, mockAI), new HumanPlayer(new GameClient(game), 1)];

      game.setPlayers(mockPlayers);
      // setPlayers() doesn't deal cards; manually set up playerHands for the test
      game.gameState.numPlayers = 2;
      game.gameState.playerHands = [
        [new Card("K", "♠"), new Card("Q", "♠")],
        [new Card("J", "♠"), new Card("10", "♠")],
      ];
      game.gameState.playPile = [new Card("K", "♠"), new Card("K", "♦")];
      game.gameState.selectedCards = [new Card("A", "♠")];
      game.gameState.playerTypes = ["ai", "human"];
      game.save();

      const newGame = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
      const loadedGameState = await newGame.load(mockUI);

      expect(loadedGameState.loaded).to.be.true;
      expect(newGame.id).to.equal(game.id);
      expect(newGame.stateKey).to.equal(game.stateKey);

      expect(loadedGameState.loadedPlayerTypes).to.deep.equal(game.gameState.playerTypes);

      expect(newGame.gameState.playerHands[0][0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.playPile[0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.selectedCards[0]).to.be.an.instanceOf(Card);

      expect(newGame.gameState.playPile[0].rank).to.equal("K");
      expect(newGame.gameState.playPile[0].suit).to.equal("♠");
      expect(newGame.gameState.selectedCards[0].rank).to.equal("A");
      expect(newGame.gameState.selectedCards[0].suit).to.equal("♠");
    });

    it("load() should preserve both player hands and playPile (full mid-game reload simulation)", async () => {
      const mockUI = new MockUI(new GameClient(game));
      const mockAI = new MockAI(new GameClient(game), [new Card("3", "♠")], AI_PERSONAS.random.name);
      const mockPlayers = [new AIPlayer(new GameClient(game), 0, mockAI), new HumanPlayer(new GameClient(game), 1)];

      game.setPlayers(mockPlayers);
      game.gameState.gameStarted = true;

      // Simulate mid-game: player 0 has 5 cards, player 1 has 8 cards, playPile has 2 cards
      game.gameState.playerHands[0] = [new Card("K", "♠"), new Card("Q", "♦"), new Card("J", "♣"), new Card("10", "♥"), new Card("9", "♠")];
      game.gameState.playerHands[1] = [new Card("A", "♠"), new Card("2", "♦"), new Card("3", "♥"), new Card("4", "♣"), new Card("5", "♠"), new Card("6", "♦"), new Card("7", "♥"), new Card("8", "♣")];
      game.gameState.playPile = [new Card("3", "♠"), new Card("3", "♦")];
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.currentPlayer = 1;
      game.gameState.consecutivePasses = 0;
      game.gameState.roundNumber = 2;
      game.save();

      // Simulate loading from a fresh game instance (like a browser refresh)
      const newGame = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
      const loadedGameState = await newGame.load(mockUI);

      expect(loadedGameState.loaded).to.be.true;

      // Both hands should be preserved exactly
      expect(newGame.gameState.playerHands[0]).to.have.lengthOf(5);
      expect(newGame.gameState.playerHands[0][0].rank).to.equal("K");
      expect(newGame.gameState.playerHands[1]).to.have.lengthOf(8);
      expect(newGame.gameState.playerHands[1][0].rank).to.equal("A");

      // PlayPile should also be preserved
      expect(newGame.gameState.playPile).to.have.lengthOf(2);
      expect(newGame.gameState.playPile[0].rank).to.equal("3");
      expect(newGame.gameState.playPile[0].suit).to.equal("♠");

      // Other state should be preserved too
      expect(newGame.gameState.currentPlayer).to.equal(1);
      expect(newGame.gameState.lastPlayerToPlay).to.equal(0);
      expect(newGame.gameState.roundNumber).to.equal(2);
      expect(newGame.gameState.gameStarted).to.be.true;
    });

    it("load() should initialize playerPassed if missing (backward compat)", async () => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.gameState.playerPassed = [true, false, false];
      game.save();

      // Manually remove playerPassed from saved state to simulate old save format
      const saved = localStorage.getItem(game.stateKey);
      const parsed = JSON.parse(saved);
      delete parsed.gameState.playerPassed;
      localStorage.setItem(game.stateKey, JSON.stringify(parsed));

      const newGame = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
      const loaded = await newGame.load(new MockUI(new GameClient(newGame)));
      expect(loaded.loaded).to.be.true;
      expect(newGame.gameState.playerPassed).to.deep.equal([false, false, false]);
    });
  });

  describe("Player Passed Tracking", () => {
    beforeEach(() => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
    });

    it("should initialize playerPassed array in init()", () => {
      game.init();

      expect(game.gameState.playerPassed).to.be.an("array").that.has.lengthOf(3);
      expect(game.gameState.playerPassed).to.deep.equal([false, false, false]);
    });

    it("should reset playerPassed array on init() call for a new round", () => {
      game.init();
      game.gameState.playerPassed = [true, true, true];

      game.init();

      expect(game.gameState.playerPassed).to.deep.equal([false, false, false]);
    });

    it("should mark player as passed when passTurn() is called", () => {
      game.init();
      game.gameState.currentPlayer = 1;
      game.gameState.playPile = [new Card("3", "♠")];

      game.passTurn();

      expect(game.gameState.playerPassed[1]).to.be.true;
    });

    it("should not be possible to play cards after passing", () => {
      game.init();
      // Mark player 0 as passed, then advance to them
      game.gameState.playerPassed = [true, false, false];
      game.gameState.currentPlayer = 0;
      game.gameState.lastPlayerToPlay = 1;
      game.gameState.playPile = [new Card("K", "♠")];

      const cardToPlay = new Card("4", "♠");
      game.gameState.playerHands = [[cardToPlay], [], []];
      game.gameState.selectedCards = [cardToPlay];

      game.playCards();

      // Cards should NOT have been played (state unchanged)
      expect(game.gameState.playerHands[0]).to.have.lengthOf(1);
      expect(game.gameState.selectedCards).to.have.lengthOf(1);
    });

    it("should end the round when all non-passed players except lastPlayerToPlay have passed", () => {
      game.init();
      game.gameState.currentPlayer = 2;
      game.gameState.lastPlayerToPlay = 1;
      game.gameState.roundNumber = 1;
      game.gameState.roundsWon = [0, 0, 0];
      game.gameState.playPile = [new Card("A", "♠")];
      // Player 0 has passed, player 2 is about to pass
      game.gameState.playerPassed = [true, false, false];

      game.passTurn();

      // Player 2 passed, so all non-last players (0 and 2) have passed
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.roundsWon[1]).to.equal(1);
      expect(game.gameState.currentPlayer).to.equal(1);
    });

    it("should NOT end the round when a non-passed player other than lastPlayerToPlay remains", () => {
      game.init();
      game.gameState.currentPlayer = 1;
      game.gameState.lastPlayerToPlay = 2;
      game.gameState.roundNumber = 1;
      game.gameState.playPile = [new Card("A", "♠")];
      // No one has passed yet
      game.gameState.playerPassed = [false, false, false];

      game.passTurn();

      // Player 1 passed, but player 0 has NOT passed
      // All non-last players (0 and 1): player 0 hasn't passed → round continues
      expect(game.gameState.playPile).to.not.be.empty;
      expect(game.gameState.roundNumber).to.equal(1);
      // Next active player after 1 is 2 (lastPlayerToPlay, not passed)
      expect(game.gameState.currentPlayer).to.equal(2);
    });

    it("should end the round after playCards() when all other players have passed", () => {
      game.init();
      game.gameState.currentPlayer = 0;
      game.gameState.lastPlayerToPlay = 1;
      game.gameState.roundNumber = 1;
      game.gameState.roundsWon = [0, 0, 0];
      game.gameState.playPile = [new Card("A", "♠")];
      // Players 1 and 2 have passed, player 0 has not
      game.gameState.playerPassed = [false, true, true];

      const cardToPlay = new Card("4", "♠");
      // Player has 2 cards, plays 1 (not their last card, so no win)
      game.gameState.playerHands = [[cardToPlay, new Card("5", "♠")], [], []];
      game.gameState.selectedCards = [cardToPlay];

      game.playCards();

      // Player 0 plays, becomes lastPlayerToPlay
      // Non-last players (1 and 2) have both passed → round ends
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.roundsWon[0]).to.equal(1);
      expect(game.gameState.currentPlayer).to.equal(0);
    });

    it("nextRound() should clear all playerPassed values", () => {
      game.init();
      game.gameState.currentPlayer = 0;
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.roundNumber = 1;
      game.gameState.playerPassed = [true, false, true];
      game.gameState.playPile = [new Card("A", "♠")];

      game.nextRound();

      expect(game.gameState.playerPassed).to.deep.equal([false, false, false]);
      expect(game.gameState.playPile).to.be.empty;
    });

    it("should work correctly with 2 players (1+1 mode)", () => {
      game.gameState.numPlayers = 2;
      game.gameState.players = [new HumanPlayer(new GameClient(game), 0), new HumanPlayer(new GameClient(game), 1)];
      game.init();

      // Player 0 starts and plays
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.currentPlayer = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // Player 1 passes
      game.gameState.currentPlayer = 1;
      game.gameState.playerPassed = [false, true];

      game.passTurn();

      // Round should end (all other players except lastPlayerToPlay have passed)
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.currentPlayer).to.equal(0);
      expect(game.gameState.playerPassed).to.deep.equal([false, false]);
    });

    it("should end round with 3 players: P1 plays, P2 passes, P3 passes", () => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.init();

      // P1 (index 0) plays first
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.currentPlayer = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // P2 (index 1) passes
      game.gameState.currentPlayer = 1;
      game.gameState.playerPassed = [false, true, false];
      game.passTurn();
      expect(game.gameState.roundNumber).to.equal(1); // Round not ended yet, P3 still active

      // P3 (index 2) passes → round ends
      game.gameState.currentPlayer = 2;
      game.passTurn();

      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.roundsWon[0]).to.equal(1);
      expect(game.gameState.currentPlayer).to.equal(0);
    });

    it("should end round with 4 players: all pass after first play", () => {
      game.gameState.numPlayers = 4;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
        new HumanPlayer(new GameClient(game), 3),
      ];
      game.init();

      // P1 plays first
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // P2, P3, P4 all pass
      game.gameState.playerPassed = [false, true, true, true];
      game.gameState.currentPlayer = 3;
      game.passTurn();

      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
      expect(game.gameState.currentPlayer).to.equal(0);
    });

    it("should handle multiple plays in a round", () => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.init();

      // P1 plays → becomes lastPlayerToPlay
      game.gameState.currentPlayer = 0;
      game.gameState.playPile = [];
      game.gameState.selectedCards = [new Card("3", "♠")];
      game.gameState.playerHands = [[new Card("3", "♠"), new Card("4", "♠")], [], []];
      game.playCards();
      expect(game.gameState.lastPlayerToPlay).to.equal(0);
      expect(game.gameState.roundNumber).to.equal(1); // Round still ongoing

      // P2 passes
      game.gameState.currentPlayer = 1;
      game.passTurn();
      expect(game.gameState.playerPassed[1]).to.be.true;

      // P3 plays → becomes lastPlayerToPlay
      game.gameState.currentPlayer = 2;
      game.gameState.selectedCards = [new Card("4", "♠")];
      game.gameState.playerHands = [[new Card("4", "♠")], [], [new Card("4", "♠"), new Card("5", "♠")]];
      game.playCards();
      expect(game.gameState.lastPlayerToPlay).to.equal(2);
      expect(game.gameState.roundNumber).to.equal(1); // Round still ongoing

      // P2 tries to play but has passed → rejected
      game.gameState.currentPlayer = 1;
      const card = new Card("5", "♠");
      game.gameState.selectedCards = [card];
      game.gameState.playerHands = [[], [], [card]];
      game.playCards();
      // Cards should NOT have been played (selectedCards still has the card)
      expect(game.gameState.selectedCards).to.have.lengthOf(1);
    });

    it("should skip passed players in turn order", () => {
      game.gameState.numPlayers = 4;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
        new HumanPlayer(new GameClient(game), 3),
      ];
      game.init();

      // === First phase of round ===
      // P1 plays 3♠ (starting card)
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // P2 passes → turn skips to P3
      game.gameState.currentPlayer = 1;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(2);

      // P3 passes → turn skips to P4
      game.gameState.currentPlayer = 2;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(3);

      // P4 passes → all others passed, round ends
      game.gameState.currentPlayer = 3;
      game.passTurn();
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);

      // === Second phase of new round ===
      // P1 now leads with a new play
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("4", "♠")];
      // Reset passed state for new round
      game.gameState.playerPassed = [false, false, false, false];

      // P2 passes → turn skips to P3
      game.gameState.currentPlayer = 1;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(2);

      // P3 passes → turn skips to P4
      game.gameState.currentPlayer = 2;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(3);

      // P4 passes → round ends
      game.gameState.currentPlayer = 3;
      game.passTurn();
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(3);
    });

    it("should skip multiple consecutive passed players and end round when all have passed", () => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.init();

      // P1 plays the first card
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // P2 passes (playerPassed[1] is set to true by passTurn)
      game.gameState.currentPlayer = 1;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(2);

      // P3 passes (playerPassed[2] is set to true by passTurn)
      game.gameState.currentPlayer = 2;
      game.passTurn();
      // Both P2 and P3 have passed, round should end
      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.roundNumber).to.equal(2);
    });

    it("should cycle through passed players and end round when lastPlayerToPlay is reached", () => {
      game.gameState.numPlayers = 4;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
        new HumanPlayer(new GameClient(game), 3),
      ];
      game.init();

      // P1 plays the first card
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("3", "♠")];

      // P4 has passed; P2 and P3 have not
      game.gameState.playerPassed = [false, false, false, true];

      // P3 passes → shouldEndRound() returns FALSE (P2 hasn't passed)
      // nextPlayer = 3 (passed) → while loop body executes (line 242-243)
      // nextPlayer = 0 (lastPlayerToPlay) → while loop exits
      // shouldEndRound() returns FALSE (P2 hasn't passed) → skip if block
      // currentPlayer = 0
      game.gameState.currentPlayer = 2;
      game.passTurn();
      expect(game.gameState.currentPlayer).to.equal(0);
    });
  });

  describe("gamesWon multi-player", () => {
    beforeEach(() => {
      game.gameState.numPlayers = 2;
      game.gameState.players = [new HumanPlayer(new GameClient(game), 0), new HumanPlayer(new GameClient(game), 1)];
    });

    it("should preserve gamesWon when setPlayers is called with same player count", () => {
      const originalGamesWon = [3, 2];
      game.gameState.gamesWon = originalGamesWon;

      const players = [new HumanPlayer(new GameClient(game), 0), new HumanPlayer(new GameClient(game), 1)];
      game.setPlayers(players);

      // gamesWon should be preserved (same count)
      expect(game.gameState.gamesWon).to.deep.equal(originalGamesWon);
    });

    it("should preserve gamesWon for existing players when adding a player", () => {
      game.gameState.gamesWon = [3, 2];
      game.gameState.numPlayers = 2;

      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.setPlayers(players);

      // Existing player wins preserved, new player starts at 0
      expect(game.gameState.gamesWon).to.deep.equal([3, 2, 0]);
    });

    it("should truncate gamesWon when removing a player", () => {
      game.gameState.gamesWon = [3, 2, 1];
      game.gameState.numPlayers = 3;

      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
      ];
      game.setPlayers(players);

      // Truncate to remove the last player's wins
      expect(game.gameState.gamesWon).to.deep.equal([3, 2]);
    });

    it("should initialize gamesWon with correct size for 4 players", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
        new HumanPlayer(new GameClient(game), 3),
      ];
      game.setPlayers(players);

      expect(game.gameState.gamesWon).to.have.lengthOf(4);
      expect(game.gameState.gamesWon).to.deep.equal([0, 0, 0, 0]);
    });
  });

  describe("gamesPlayed", () => {
    it("should increment gamesPlayed for all players when a game ends", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
      ];
      game.setPlayers(players);
      game.start();
      game.win();

      expect(game.gameState.gamesPlayed).to.deep.equal([1, 1]);
    });

    it("should preserve gamesPlayed across new games", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
      ];
      game.setPlayers(players);
      game.start();
      game.win();
      game.init(); // Simulate new game
      game.start();
      game.win();

      // gamesPlayed should be preserved (not reset by init)
      expect(game.gameState.gamesPlayed).to.deep.equal([2, 2]);
    });

    it("should increment gamesPlayed for all players on each completed game", () => {
      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.setPlayers(players);

      // Complete 3 games: start -> win -> init -> start -> win -> init -> start -> win
      game.start();
      game.win();
      game.init();
      game.start();
      game.win();
      game.init();
      game.start();
      game.win();

      // All 3 players increment on each of the 3 completed games
      expect(game.gameState.gamesPlayed).to.deep.equal([3, 3, 3]);
    });

    it("should preserve gamesPlayed when adding a player", () => {
      game.gameState.gamesPlayed = [5, 3];

      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
        new HumanPlayer(new GameClient(game), 2),
      ];
      game.setPlayers(players);

      // Existing player wins preserved, new player starts at 0
      expect(game.gameState.gamesPlayed).to.deep.equal([5, 3, 0]);
    });

    it("should truncate gamesPlayed when removing a player", () => {
      game.gameState.gamesPlayed = [5, 3, 1];

      const players = [
        new HumanPlayer(new GameClient(game), 0),
        new HumanPlayer(new GameClient(game), 1),
      ];
      game.setPlayers(players);

      // Truncate to remove the last player's count
      expect(game.gameState.gamesPlayed).to.deep.equal([5, 3]);
    });
  });

  describe("AI configuration", () => {
    beforeEach(() => {
      game.gameState.numPlayers = 2;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], AI_PERSONAS.random.name)),
      ];
    });

    it("should save numAIPlayers and aiPersonas in setPlayers()", () => {
      game.setPlayers(game.gameState.players);

      expect(game.gameState.numAIPlayers).to.equal(1);
      expect(game.gameState.aiPersonas).to.have.lengthOf(1);
      expect(game.gameState.aiPersonas[0]).to.equal(AI_PERSONAS.random.name);
    });

    it("should save multiple AI personas in setPlayers()", () => {
      const aiPlayers = [
        new AIPlayer(new GameClient(game), 0, new MockAI(new GameClient(game), [], AI_PERSONAS.random.name)),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], AI_PERSONAS.aggressive.name)),
        new AIPlayer(new GameClient(game), 2, new MockAI(new GameClient(game), [], AI_PERSONAS.conservative.name)),
      ];
      const players = [new HumanPlayer(new GameClient(game), 0), ...aiPlayers];
      game.setPlayers(players);

      expect(game.gameState.numAIPlayers).to.equal(3);
      expect(game.gameState.aiPersonas).to.deep.equal([AI_PERSONAS.random.name, AI_PERSONAS.aggressive.name, AI_PERSONAS.conservative.name]);
    });
  });

  describe("roundEnded Flag", function () {
    it("should be initialized to false", function () {
      expect(game.gameState.roundEnded).to.be.false;
    });

    it("should be set to true when round ends via play (all others passed)", function () {
      const aiPlayers = [
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];
      const players = [new HumanPlayer(new GameClient(game), 0), ...aiPlayers];
      game.setPlayers(players);
      game.gameState.lastPlayerToPlay = 0;
      // Must set playerPassed AFTER setPlayers() since it resets playerPassed
      game.gameState.playerPassed = [false, true];
      game.gameState.numPlayers = 2;

      game.playCards();

      expect(game.gameState.roundEnded).to.be.true;
    });

    it("should be set to true when round ends via pass (all others passed)", function () {
      const aiPlayers = [
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];
      const players = [new HumanPlayer(new GameClient(game), 0), ...aiPlayers];
      game.setPlayers(players);
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playPile = [new Card("A", "♠")];
      // Player 1 must have passed BEFORE player 0's pass ends the round
      game.gameState.playerPassed[1] = true;

      game.passTurn();

      expect(game.gameState.roundEnded).to.be.true;
    });

    it("should be set to true when a player wins the game (plays last card)", function () {
      const aiPlayers = [
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
      ];
      const players = [new HumanPlayer(new GameClient(game), 0), ...aiPlayers];
      game.setPlayers(players);
      game.gameState.lastPlayerToPlay = 0;
      game.gameState.playerHands = [[], []]; // Both players have 0 cards
      game.gameState.selectedCards = [];

      game.playCards();

      expect(game.gameState.roundEnded).to.be.true;
      expect(game.gameState.gameOver).to.be.true;
    });

    it("should be reset to false when init() is called", function () {
      game.gameState.roundEnded = true;
      game.init();
      expect(game.gameState.roundEnded).to.be.false;
    });
  });
});
