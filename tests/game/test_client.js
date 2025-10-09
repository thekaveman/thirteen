import { Game } from "../../src/app/game/game.js";
import { GameClient } from "../../src/app/game/client.js";
import { Deck, Card } from "../../src/app/game/deck.js";
import { HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockUI } from "../mocks.js";

describe("GameClient", () => {
  let game;
  let gameClient;

  beforeEach(() => {
    game = new Game(new Deck());
    gameClient = new GameClient(game);
  });

  describe("constructor", () => {
    it("should create a new GameClient instance", () => {
      expect(gameClient).to.be.an.instanceOf(GameClient);
    });

    it("should have a game property", () => {
      expect(gameClient.game).to.equal(game);
    });
  });

  describe("Getters", () => {
    it("getAnalyticsData() should return a comprehensive analytics object", () => {
      const players = [
        new HumanPlayer(gameClient, 0, new MockUI(gameClient)),
        new AIPlayer(gameClient, 1, new MockAI(gameClient, [], "random")),
      ];
      gameClient.setPlayers(players);
      gameClient.game.gameState.gameOver = true;
      const data = gameClient.getAnalyticsData();
      expect(data).to.have.property("id");
      expect(data).to.have.property("ended");
      expect(data).to.have.property("round");
      expect(data).to.have.property("started");
      expect(data).to.have.property("turn");
      expect(data).to.have.property("hands");
      expect(data).to.have.property("players");
      expect(data).to.have.property("combination");
      expect(data).to.have.property("move");
      expect(data).to.have.property("pile");
      expect(data).to.have.property("consecutive_passes");
      expect(data).to.have.property("human_player");
      expect(data).to.have.property("ai_player");
      expect(data).to.have.property("game_rounds");
      expect(data).to.have.property("game_turns");
      expect(data).to.have.property("player_rounds_won");
      expect(data).to.have.property("player_turns");
      expect(data).to.have.property("player_games_won");
    });

    it("getCurrentPlayer() should return the current player", () => {
      const players = [new HumanPlayer(game, 0, new MockUI(game))];
      game.setPlayers(players);
      expect(gameClient.getCurrentPlayer()).to.equal(players[0]);
    });

    it("getCurrentPlayerIndex() should return the current player index", () => {
      game.gameState.currentPlayer = 1;
      expect(gameClient.getCurrentPlayerIndex()).to.equal(1);
    });

    it("getCurrentTurn() should return the current turn number", () => {
      game.gameState.currentTurn = 5;
      expect(gameClient.getCurrentTurn()).to.equal(5);
    });

    it("getFirstAIPlayer() should return the first AI player", () => {
      const players = [
        new HumanPlayer(gameClient, 0, new MockUI(gameClient)),
        new AIPlayer(gameClient, 1, new MockAI(gameClient, [], "mock")),
        new AIPlayer(gameClient, 2, new MockAI(gameClient, [], "mock2")),
      ];
      gameClient.setPlayers(players);
      const aiPlayer = gameClient.getFirstAIPlayer();
      expect(aiPlayer).to.exist;
      expect(aiPlayer.type).to.equal(PLAYER_TYPES.AI);
      expect(aiPlayer.number).to.equal(1);
    });

    it("getFirstHumanPlayer() should return the first human player", () => {
      const players = [
        new AIPlayer(gameClient, 0, new MockAI(gameClient, [], "mock")),
        new HumanPlayer(gameClient, 1, new MockUI(gameClient)),
        new HumanPlayer(gameClient, 2, new MockUI(gameClient)),
      ];
      gameClient.setPlayers(players);
      const humanPlayer = gameClient.getFirstHumanPlayer();
      expect(humanPlayer).to.exist;
      expect(humanPlayer.type).to.equal(PLAYER_TYPES.HUMAN);
      expect(humanPlayer.number).to.equal(1);
    });

    it("getPlayPile() should return the play pile", () => {
      const playPile = [new Card("A", "♠")];
      game.gameState.playPile = playPile;
      expect(gameClient.getPlayPile()).to.equal(playPile);
    });

    it("getPlayerHands() should return the player hands", () => {
      const hands = [[new Card("A", "♠")], [new Card("K", "♠")]];
      game.gameState.playerHands = hands;
      expect(gameClient.getPlayerHands()).to.equal(hands);
    });

    it("getPlayerHand() should return the hand of a specific player", () => {
      const hands = [[new Card("A", "♠")], [new Card("K", "♠")]];
      game.gameState.playerHands = hands;
      expect(gameClient.getPlayerHand(1)).to.equal(hands[1]);
    });

    it("getPlayers() should return the list of players", () => {
      const players = [new HumanPlayer(game, 0, new MockUI(game))];
      game.gameState.players = players;
      expect(gameClient.getPlayers()).to.equal(players);
    });

    it("getSelectedCards() should return the selected cards", () => {
      const selectedCards = [new Card("A", "♠")];
      game.gameState.selectedCards = selectedCards;
      expect(gameClient.getSelectedCards()).to.equal(selectedCards);
    });

    it("isGameOver() should return the game over state", () => {
      game.gameState.gameOver = true;
      expect(gameClient.isGameOver()).to.be.true;
    });

    it("isGameStarted() should return the game started state", () => {
      game.gameState.gameStarted = true;
      expect(gameClient.isGameStarted()).to.be.true;
    });
  });
});
