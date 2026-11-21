import { Card, Game } from "../../src/app/game/index.js";
import { HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockDeck, MockUI } from "../mocks.ts";
import { GameClient } from "../../src/app/game/index.js";

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
        new HumanPlayer(new GameClient(game), 0, new MockUI(new GameClient(game))),
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
        new HumanPlayer(new GameClient(game), 0, new MockUI(new GameClient(game))),
        new AIPlayer(new GameClient(game), 1, new MockAI(new GameClient(game), [], "mock")),
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
      const mockAI = new MockAI(new GameClient(game), [new Card("3", "♠")], "random");
      const mockPlayers = [
        new AIPlayer(new GameClient(game), 0, mockAI),
        new HumanPlayer(new GameClient(game), 1, mockUI),
      ];

      game.setPlayers(mockPlayers);
      game.gameState.gameStarted = true;
      game.gameState.playPile = [new Card("K", "♠"), new Card("K", "♦")];
      game.gameState.selectedCards = [new Card("A", "♠")];
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
  });

  describe("Player Passed Tracking", () => {
    beforeEach(() => {
      game.gameState.numPlayers = 3;
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0, new MockUI(new GameClient(game))),
        new HumanPlayer(new GameClient(game), 1, new MockUI(new GameClient(game))),
        new HumanPlayer(new GameClient(game), 2, new MockUI(new GameClient(game))),
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
      game.gameState.players = [
        new HumanPlayer(new GameClient(game), 0, new MockUI(new GameClient(game))),
        new HumanPlayer(new GameClient(game), 1, new MockUI(new GameClient(game))),
      ];
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
  });
});
