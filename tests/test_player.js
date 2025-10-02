import { PLAYER_TYPES } from "../src/app/constants.js";
import { Card } from "../src/app/deck.js";
import { HumanPlayer, AIPlayer } from "../src/app/player.js";
import { MockAI, MockUI, MockGame } from "./mocks.js";

describe("Player", () => {
  before(() => {
    if (typeof window === "undefined") {
      // Running in Node.js, set up JSDOM
      const { JSDOM } = require("jsdom"); // Use require for conditional import
      const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
      global.window = dom.window;
      global.document = dom.window.document;
    }
  });
  describe("Player Constructor", () => {
    it("should correctly initialize HumanPlayer", () => {
      const game = new MockGame();
      const humanPlayer = new HumanPlayer(game, 0, new MockUI());
      expect(humanPlayer.type).to.equal(PLAYER_TYPES.HUMAN);
      expect(humanPlayer.ui).to.not.be.null;
    });

    it("should correctly initialize AIPlayer", () => {
      const game = new MockGame();
      const ai = new MockAI();
      const aiPlayer = new AIPlayer(game, 1, ai);
      expect(aiPlayer.type).to.equal(PLAYER_TYPES.AI);
      expect(aiPlayer.ai).to.equal(ai);
    });
  });

  describe("AIPlayer", () => {
    it("data() should return correct data", () => {
      const game = new MockGame();
      const ai = new MockAI(game);
      const player = new AIPlayer(game, 1, ai);
      const playerData = player.data();

      expect(playerData.id).to.equal(player.id);
      expect(playerData.type).to.equal(PLAYER_TYPES.AI);
      expect(playerData.number).to.equal(1);
      expect(playerData.ai.id).to.equal(ai.id);
    });

    it("takeTurn() should return the move from the AI", () => {
      const game = new MockGame();
      game.gameState.currentPlayer = 0;
      game.gameState.playerHands = [[]];
      const move = [new Card("5", "♦")];
      const ai = new MockAI(game, move);
      const player = new AIPlayer(game, 0, ai);
      const selectedMove = player.takeTurn();
      expect(selectedMove).to.equal(move);
    });
  });

  describe("HumanPlayer", () => {
    let game, ui, humanPlayer;

    beforeEach(() => {
      game = new MockGame();
      ui = new MockUI();
      humanPlayer = new HumanPlayer(game, 0, ui);
    });

    it("takeTurn() should return null", () => {
      const move = humanPlayer.takeTurn();
      expect(move).to.be.null;
    });

    describe("Event Handlers", () => {
      it("handleCardClick() should select and deselect a card", () => {
        const card = new Card("A", "♠");
        game.gameState.currentPlayer = 0;
        game.gameState.playerHands = [[card], []];
        game.gameState.selectedCards = [];

        const cardElement = document.createElement("div");
        cardElement.dataset.card = JSON.stringify(card);
        const event = { target: cardElement };

        humanPlayer.handleCardClick(event);
        expect(game.gameState.selectedCards).to.have.lengthOf(1);
        expect(game.gameState.selectedCards[0].value).to.equal(card.value);

        humanPlayer.handleCardClick(event);
        expect(game.gameState.selectedCards).to.be.empty;
      });

      it("handleCardClick() should not select cards of another player", () => {
        game.gameState.currentPlayer = 0;
        game.gameState.playerHands = [[new Card("3", "♠")], [new Card("4", "♦")]];
        game.gameState.selectedCards = [];

        const otherPlayerCardElement = document.createElement("div");
        otherPlayerCardElement.dataset.card = JSON.stringify(game.gameState.playerHands[1][0]);
        const event = { target: otherPlayerCardElement };

        humanPlayer.handleCardClick(event);

        expect(game.gameState.selectedCards).to.be.empty;
        expect(otherPlayerCardElement.classList.contains("selected")).to.be.false;
      });

      it("handlePlayButtonClick() should show a message on invalid play", () => {
        const cardToPlay = new Card("3", "♠");
        game.gameState.currentPlayer = 0;
        game.gameState.playerHands = [[cardToPlay]];
        game.gameState.selectedCards = [cardToPlay];
        game.gameState.playPile = [new Card("A", "♠")]; // Invalid play

        humanPlayer.handlePlayButtonClick();

        expect(ui.gameMessages.textContent).to.equal("Invalid play");
      });

      it("handlePlayButtonClick() should call game.playCards on valid play", () => {
        const cardToPlay = new Card("A", "♠");
        game.gameState.currentPlayer = 0;
        game.gameState.playerHands = [[cardToPlay]];
        game.gameState.selectedCards = [cardToPlay];
        game.gameState.playPile = [new Card("3", "♠")]; // Valid play

        humanPlayer.handlePlayButtonClick();

        expect(game.playCardsCalled).to.be.true;
      });

      it("handlePassButtonClick() should call game.passTurn", () => {
        game.gameState.playPile = [new Card("3", "♠")]; // Not first turn
        humanPlayer.handlePassButtonClick();
        expect(game.passTurnCalled).to.be.true;
      });
    });
  });
});
