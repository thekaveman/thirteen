import { Card, Game } from "../../src/app/game/index.js";
import { HumanPlayer, AIPlayer, PLAYER_TYPES } from "../../src/app/player/index.js";
import { MockAI, MockDeck, MockUI, MockGameClient } from "../mocks.js";

describe("Game", () => {
  let game;

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
        new HumanPlayer(new MockGameClient(game), 0, new MockUI(new MockGameClient(game))),
        new AIPlayer(new MockGameClient(game), 1, new MockAI(new MockGameClient(game), [], "mock")),
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
        new HumanPlayer(new MockGameClient(game), 0, new MockUI(new MockGameClient(game))),
        new AIPlayer(new MockGameClient(game), 1, new MockAI(new MockGameClient(game), [], "mock")),
      ];
      const originalGamesWon = [2, 1];
      game.gameState.gamesWon = originalGamesWon;

      game.setPlayers(players);

      expect(game.gameState.numPlayers).to.equal(players.length);
      expect(game.gameState.players).to.have.lengthOf(players.length);
      expect(game.gameState.playerHands).to.have.lengthOf(players.length);
      expect(game.gameState.roundsWon).to.have.lengthOf(players.length);
      expect(game.gameState.roundsWon).to.deep.equal([0, 0]);
      expect(game.gameState.gamesWon).to.deep.equal(originalGamesWon);
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
      game.gameState.consecutivePasses = 1;
      game.gameState.roundNumber = 1;
      game.gameState.roundsWon = [0, 0, 0];
      game.gameState.playPile = [new Card("A", "♠")];

      game.passTurn();

      expect(game.gameState.playPile).to.be.empty;
      expect(game.gameState.consecutivePasses).to.equal(0);
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

    it("load() should fail for invalid saved JSON", () => {
      localStorage.setItem(game.stateKey, "invalid json");
      try {
        game.load(new MockUI(new MockGameClient(game)));
      } catch (e) {
        expect(e).to.be.an.instanceOf(SyntaxError);
      }
    });

    it("load() should not load if no saved state exists", () => {
      const loaded = game.load(new MockUI(new MockGameClient(game)));
      expect(loaded.loaded).to.be.false;
    });

    it("load() should not load if no ui is provided", () => {
      game.save();
      const loaded = game.load(null);
      expect(loaded.loaded).to.be.false;
    });

    it("load() should correctly rehydrate game data", () => {
      const mockUI = new MockUI(new MockGameClient(game));
      const mockAI = new MockAI(new MockGameClient(game), [new Card("3", "♠")], "random");
      const mockPlayers = [
        new AIPlayer(new MockGameClient(game), 0, mockAI),
        new HumanPlayer(new MockGameClient(game), 1, mockUI),
      ];

      game.setPlayers(mockPlayers);
      game.gameState.gameStarted = true;
      game.gameState.playPile = [new Card("K", "♠"), new Card("K", "♦")];
      game.gameState.selectedCards = [new Card("A", "♠")];
      game.save();

      const newGame = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
      const loadedGameState = newGame.load(mockUI);

      expect(loadedGameState.loaded).to.be.true;
      expect(newGame.id).to.equal(game.id);
      expect(newGame.stateKey).to.equal(game.stateKey);

      expect(loadedGameState.loadedPlayerTypes).to.deep.equal(game.gameState.playerTypes);
      expect(loadedGameState.loadedPlayerPersonas).to.deep.equal(game.gameState.playerPersonas);

      expect(newGame.gameState.playerHands[0][0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.playPile[0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.selectedCards[0]).to.be.an.instanceOf(Card);

      expect(newGame.gameState.playPile[0].rank).to.equal("K");
      expect(newGame.gameState.playPile[0].suit).to.equal("♠");
      expect(newGame.gameState.selectedCards[0].rank).to.equal("A");
      expect(newGame.gameState.selectedCards[0].suit).to.equal("♠");
    });
  });
});
