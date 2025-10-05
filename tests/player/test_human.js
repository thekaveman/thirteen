import { PLAYER_TYPES } from "../../src/app/constants.js";
import { Card } from "../../src/app/deck.js";
import { HumanPlayer } from "../../src/app/player/index.js";
import { MockUI, MockGame } from "../mocks.js";

describe("HumanPlayer", () => {
  let game, ui, humanPlayer;

  beforeEach(() => {
    game = new MockGame();
    ui = new MockUI();
    humanPlayer = new HumanPlayer(game, 0, ui);
  });

  it("Constructor should correctly initialize HumanPlayer", () => {
    const player = new HumanPlayer(game, 0, ui);
    expect(player.type).to.equal(PLAYER_TYPES.HUMAN);
    expect(player.ui).to.equal(ui);
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
