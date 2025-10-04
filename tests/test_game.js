import { Card } from "../src/app/deck.js";
import { Game } from "../src/app/game.js";
import { MockDeck, MockAI, MockUI, MockPlayer, MockLocalStorage } from "./mocks.js";
import { HumanPlayer, AIPlayer } from "../src/app/player/index.js";
import { COMBINATION_TYPES, PLAYER_TYPES } from "../src/app/constants.js";

describe("Game", () => {
  let game;

  beforeEach(() => {
    localStorage.clear();
    game = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Constructor and Initial State", () => {
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
  });

  describe("Player Management", () => {
    it("createPlayers() should create players with correct types and IDs", () => {
      game.gameState.playerTypes = [PLAYER_TYPES.HUMAN, PLAYER_TYPES.AI];
      game.gameState.playerPersonas = [null, "random"];
      game.gameState.players = [{ id: "one" }, { id: "two" }];
      const players = game.createPlayers(new MockUI(game));
      expect(players).to.have.lengthOf(2);
      expect(players[0].type).to.equal(PLAYER_TYPES.HUMAN);
      expect(players[0].id).to.equal("one");
      expect(players[1].type).to.equal(PLAYER_TYPES.AI);
      expect(players[1].id).to.equal("two");
    });

    it("setPlayers() should initialize players and associated game state", () => {
      const players = [{ type: PLAYER_TYPES.HUMAN }, { type: PLAYER_TYPES.AI }];
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

  describe("Game Setup", () => {
    it("findStartingPlayer() should find the player with the lowest card", () => {
      const hands = [
        [new Card("A", "♠"), new Card("K", "♣")],
        [new Card("3", "♦"), new Card("4", "♠")],
      ];
      const startingPlayer = game.findStartingPlayer(hands);
      expect(startingPlayer).to.equal(1);
    });

    it("findStartingPlayer() should select the last player if multiple have the same lowest card", () => {
      const hands = [
        [new Card("3", "♦"), new Card("K", "♣")],
        [new Card("3", "♠"), new Card("4", "♠")],
      ];
      const startingPlayer = game.findStartingPlayer(hands);
      expect(startingPlayer).to.equal(1);
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
      const players = [new MockPlayer("Human 1", [], true), new MockPlayer("AI 1", [], false)];
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

  describe("Card Combination Logic", () => {
    it("getCombinationType() should identify all valid combination types", () => {
      expect(game.getCombinationType([new Card("A", "♠")])).to.equal(COMBINATION_TYPES.SINGLE);
      expect(game.getCombinationType([new Card("A", "♠"), new Card("A", "♦")])).to.equal(COMBINATION_TYPES.PAIR);
      expect(game.getCombinationType([new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")])).to.equal(
        COMBINATION_TYPES.TRIPLE,
      );
      expect(game.getCombinationType([new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦"), new Card("A", "♥")])).to.equal(
        COMBINATION_TYPES.FOUR_OF_A_KIND,
      );
      expect(game.getCombinationType([new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")])).to.equal(
        COMBINATION_TYPES.STRAIGHT,
      );
      const consecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      expect(game.getCombinationType(consecutivePairs)).to.equal(COMBINATION_TYPES.CONSECUTIVE_PAIRS);
      expect(game.getCombinationType([new Card("K", "♠"), new Card("A", "♠")])).to.equal(COMBINATION_TYPES.INVALID);
    });

    it("isSingle() should correctly identify a single", () => {
      expect(game.isSingle([new Card("A", "♠")])).to.be.true;
      expect(game.isSingle([new Card("A", "♠"), new Card("K", "♠")])).to.be.false;
    });

    it("isPair() should correctly identify a pair", () => {
      expect(game.isPair([new Card("A", "♠"), new Card("A", "♦")])).to.be.true;
      expect(game.isPair([new Card("A", "♠"), new Card("K", "♠")])).to.be.false;
    });

    it("isTriple() should correctly identify a triple", () => {
      expect(game.isTriple([new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣")])).to.be.true;
      expect(game.isTriple([new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠")])).to.be.false;
    });

    it("isFourOfAKind() should correctly identify a four-of-a-kind", () => {
      expect(game.isFourOfAKind([new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")])).to.be.true;
      expect(game.isFourOfAKind([new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠"), new Card("J", "♠")])).to.be.false;
    });

    it("isStraight() should correctly identify straights", () => {
      expect(game.isStraight([new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")])).to.be.true;
      expect(game.isStraight([new Card("3", "♠"), new Card("5", "♦"), new Card("6", "♣")])).to.be.false;
      expect(game.isStraight([new Card("K", "♠"), new Card("A", "♦"), new Card("2", "♣")])).to.be.false;
    });

    it("isConsecutivePairs() should correctly identify consecutive pairs", () => {
      const validPairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const invalidPairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("5", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const nonConsecutive = [new Card("3", "♠"), new Card("3", "♦"), new Card("5", "♣"), new Card("5", "♥")];
      const withTwos = [new Card("A", "♠"), new Card("A", "♦"), new Card("2", "♣"), new Card("2", "♥")];
      expect(game.isConsecutivePairs(validPairs)).to.be.true;
      expect(game.isConsecutivePairs(invalidPairs)).to.be.false;
      expect(game.isConsecutivePairs(nonConsecutive)).to.be.false;
      expect(game.isConsecutivePairs(withTwos)).to.be.false;
    });

    it("isBombForSingleTwo() should identify correct bombs for a single two", () => {
      const fourOfAKind = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
      const threeConsecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const invalidBomb = [new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠")];
      expect(game.isBombForSingleTwo(fourOfAKind)).to.be.true;
      expect(game.isBombForSingleTwo(threeConsecutivePairs)).to.be.true;
      expect(game.isBombForSingleTwo(invalidBomb)).to.be.false;
    });

    it("isBombForPairOfTwos() should identify correct bombs for a pair of twos", () => {
      const fourConsecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
        new Card("6", "♣"),
        new Card("6", "♦"),
      ];
      const invalidBomb = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
      expect(game.isBombForPairOfTwos(fourConsecutivePairs)).to.be.true;
      expect(game.isBombForPairOfTwos(invalidBomb)).to.be.false;
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
      let loaded = false;
      try {
        loaded = game.load(new MockUI(game));
      } catch (e) {
        expect(e).to.be.an.instanceOf(SyntaxError);
      }
      expect(loaded).to.be.false;
    });

    it("load() should correctly rehydrate game data", () => {
      const mockUI = new MockUI(game);

      game.gameState.playerTypes = [PLAYER_TYPES.AI, PLAYER_TYPES.HUMAN];
      game.gameState.playerPersonas = ["random", null];
      game.setPlayers(game.createPlayers(mockUI));
      game.gameState.gameStarted = true;
      game.gameState.playPile = [new Card("K", "♠"), new Card("K", "♦")];
      game.gameState.selectedCards = [new Card("A", "♠")];
      game.save();

      const newGame = new Game(new MockDeck(), `${Game.STATE_KEY}-tests`);
      const loaded = newGame.load(mockUI);

      expect(loaded).to.be.true;
      expect(newGame.id).to.equal(game.id);
      expect(newGame.stateKey).to.equal(game.stateKey);

      expect(newGame.gameState.players[0]).to.be.an.instanceOf(AIPlayer);
      expect(newGame.gameState.players[1]).to.be.an.instanceOf(HumanPlayer);
      expect(newGame.gameState.players[0].takeTurn).to.be.a("function");
      expect(newGame.gameState.players[1].handlePlayButtonClick).to.be.a("function");

      expect(newGame.gameState.playerHands[0][0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.playPile[0]).to.be.an.instanceOf(Card);
      expect(newGame.gameState.selectedCards[0]).to.be.an.instanceOf(Card);

      expect(newGame.gameState.playPile[0].rank).to.equal("K");
      expect(newGame.gameState.playPile[0].suit).to.equal("♠");
      expect(newGame.gameState.selectedCards[0].rank).to.equal("A");
      expect(newGame.gameState.selectedCards[0].suit).to.equal("♠");
    });
  });

  describe("Play Validation", () => {
    it("should not allow playing cards that are not in the player's hand", () => {
      const playerHand = [new Card("3", "♠")];
      const selectedCards = [new Card("4", "♦")];
      const isValid = game.isValidPlay(selectedCards, [], playerHand, 1, [playerHand]);
      expect(isValid).to.be.false;
    });

    it("should require the lowest card to be played on the first turn", () => {
      const allPlayerHands = [[new Card("4", "♠")], [new Card("3", "♦")]];
      const playerHand = allPlayerHands[0];
      const selectedCards = [new Card("4", "♠")];
      const isValid = game.isValidPlay(selectedCards, [], playerHand, 0, allPlayerHands);
      expect(isValid).to.be.false;
    });

    it("should allow any valid combination on an empty pile (after first turn)", () => {
      const playerHand = [new Card("5", "♠")];
      const isValid = game.isValidPlay([new Card("5", "♠")], [], playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require the same combination type as the play pile", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦")];
      const playPile = [new Card("4", "♠")];
      const isValid = game.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.false;
    });

    it("should require a higher-value card for singles", () => {
      const playerHand = [new Card("5", "♠")];
      const playPile = [new Card("4", "♠")];
      const isValid = game.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value pair", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦")];
      const playPile = [new Card("4", "♠"), new Card("4", "♦")];
      const isValid = game.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value triple", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦"), new Card("5", "♣")];
      const playPile = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")];
      const isValid = game.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value straight", () => {
      const playerHand = [new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")];
      const playPile = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
      const isValid = game.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    describe("Bomb Logic", () => {
      it("should allow a four-of-a-kind to beat a single 2", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("2", "♠")];
        const isValid = game.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should allow three consecutive pairs to beat a single 2", () => {
        const bomb = [
          new Card("3", "♠"),
          new Card("3", "♦"),
          new Card("4", "♣"),
          new Card("4", "♥"),
          new Card("5", "♠"),
          new Card("5", "♦"),
        ];
        const playPile = [new Card("2", "♠")];
        const isValid = game.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should allow four consecutive pairs to beat a pair of 2s", () => {
        const bomb = [
          new Card("3", "♠"),
          new Card("3", "♦"),
          new Card("4", "♣"),
          new Card("4", "♥"),
          new Card("5", "♠"),
          new Card("5", "♦"),
          new Card("6", "♣"),
          new Card("6", "♦"),
        ];
        const playPile = [new Card("2", "♠"), new Card("2", "♦")];
        const isValid = game.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should not allow a bomb on a non-2 card", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("K", "♠")];
        const isValid = game.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.false;
      });

      it("should not allow a four-of-a-kind to bomb a pair of 2s", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("2", "♠"), new Card("2", "♦")];
        const isValid = game.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.false;
      });
    });
  });
});
