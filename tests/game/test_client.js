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

  describe("Actions", () => {
    beforeEach(() => {
      const players = [
        new HumanPlayer(gameClient, 0, new MockUI(gameClient)),
        new AIPlayer(gameClient, 1, new MockAI(gameClient, [], "random")),
      ];
      gameClient.setPlayers(players);
    });

    it("clearSelectedCards() should empty the selectedCards array", () => {
      gameClient.game.gameState.selectedCards = [new Card("A", "♠")];
      gameClient.clearSelectedCards();
      expect(gameClient.game.gameState.selectedCards).to.be.an("array").that.is.empty;
    });

    it("init() should call game.init", () => {
      const spy = sinon.spy(game, "init");
      gameClient.init();
      expect(spy).to.have.been.calledOnce;
    });

    it("isValidPlay() should call game.rules.isValidPlay", () => {
      const spy = sinon.spy(game.rules, "isValidPlay");
      const cards = [new Card("A", "♠")];
      gameClient.isValidPlay(cards);
      expect(spy).to.have.been.calledOnce;
    });

    it("load() should call game.load", () => {
      const spy = sinon.spy(game, "load");
      const ui = new MockUI(game);
      gameClient.load(ui);
      expect(spy).to.have.been.calledWith(ui);
    });

    it("pass() should call game.passTurn", () => {
      const spy = sinon.spy(game, "passTurn");
      game.gameState.playPile = [new Card("3", "♠")];
      gameClient.pass();
      expect(spy).to.have.been.calledOnce;
    });

    it("play() should call game.playCards", () => {
      const spy = sinon.spy(gameClient.game, "playCards");
      const move = [new Card("3", "♠")];
      gameClient.play(move);
      sinon.assert.calledOnce(spy);
    });

    it("reset() should call game.reset", () => {
      const spy = sinon.spy(game, "reset");
      gameClient.reset();
      expect(spy).to.have.been.calledOnce;
    });

    it("setAIPersona() should update the persona for an AI player", () => {
      const players = [
        new HumanPlayer(gameClient, 0, new MockUI(gameClient)),
        new AIPlayer(gameClient, 1, new MockAI(gameClient, [], "mock")),
      ];
      gameClient.setPlayers(players);
      gameClient.setAIPersona(1, "new_persona");
      expect(gameClient.game.gameState.playerPersonas[1]).to.equal("new_persona");
    });

    it("setAIPersona() should not update the persona for a human player", () => {
      const players = [
        new HumanPlayer(gameClient, 0, new MockUI(gameClient)),
        new AIPlayer(gameClient, 1, new MockAI(gameClient, [], "mock")),
      ];
      gameClient.setPlayers(players);
      gameClient.setAIPersona(0, "new_persona");
      expect(gameClient.game.gameState.playerPersonas[0]).to.not.equal("new_persona");
    });

    it("setPlayerHand() should replace a player's hand", () => {
      const players = [new HumanPlayer(gameClient, 0, new MockUI(gameClient))];
      gameClient.setPlayers(players);
      const newHand = [new Card("A", "♠"), new Card("K", "♣")];
      gameClient.setPlayerHand(0, newHand);
      expect(gameClient.game.gameState.playerHands[0]).to.deep.equal(newHand);
    });

    it("setPlayPile() should replace the play pile", () => {
      const newPlayPile = [new Card("A", "♠"), new Card("K", "♣")];
      gameClient.setPlayPile(newPlayPile);
      expect(gameClient.game.gameState.playPile).to.deep.equal(newPlayPile);
    });

    it("setPlayers() should call game.setPlayers", () => {
      const spy = sinon.spy(game, "setPlayers");
      const players = [new HumanPlayer(game, 0, new MockUI(game))];
      gameClient.setPlayers(players);
      expect(spy).to.have.been.calledWith(players);
    });

    it("start() should call game.start", () => {
      const spy = sinon.spy(game, "start");
      gameClient.start();
      expect(spy).to.have.been.calledOnce;
    });

    it("toggleCardSelection() should add a card to selectedCards", () => {
      const card = new Card("A", "♠");
      gameClient.toggleCardSelection(card);
      expect(gameClient.game.gameState.selectedCards).to.deep.include(card);
    });

    it("toggleCardSelection() should remove a card from selectedCards", () => {
      const card = new Card("A", "♠");
      gameClient.game.gameState.selectedCards = [card];
      gameClient.toggleCardSelection(card);
      expect(gameClient.game.gameState.selectedCards).to.not.deep.include(card);
    });

    it("toggleCardSelection() should sort the cards after adding one", () => {
      const card1 = new Card("A", "♠");
      const card2 = new Card("3", "♦");
      gameClient.game.gameState.selectedCards = [card1];
      gameClient.toggleCardSelection(card2);
      expect(gameClient.game.gameState.selectedCards[0].value).to.equal(card2.value);
      expect(gameClient.game.gameState.selectedCards[1].value).to.equal(card1.value);
    });
  });
});
