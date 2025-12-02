import { Card, GameClient } from "../../src/app/game/index.js";
import { HumanPlayer, PLAYER_TYPES } from "../../src/app/player/index.js";
import { MockUI, MockGame, MockGameClient, MockDeck } from "../mocks.js";

describe("HumanPlayer", () => {
  let game, gameClient, ui, humanPlayer;

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    gameClient = new MockGameClient(game);
    ui = new MockUI(gameClient);
    humanPlayer = new HumanPlayer(gameClient, 0);
  });

  it("Constructor should correctly initialize HumanPlayer", () => {
    const player = new HumanPlayer(gameClient, 0);
    expect(player.type).to.equal(PLAYER_TYPES.HUMAN);
  });

  it("takeTurn() should return null", () => {
    const move = humanPlayer.takeTurn();
    expect(move).to.be.null;
  });

  describe("Event Handlers", () => {
    it("handlePlayButtonClick() should call game.playCards on valid play", () => {
      const cardToPlay = new Card("A", "♠");
      gameClient.setCurrentPlayer(0);
      gameClient.setPlayerHands([[cardToPlay]]);
      game.gameState.selectedCards = [cardToPlay];
      gameClient.setPlayPile([new Card("3", "♠")]); // Valid play

      humanPlayer.handlePlayButtonClick();

      expect(game.playCardsCalled).to.be.true;
    });

    it("handlePassButtonClick() should call game.passTurn", () => {
      gameClient.setPlayPile([new Card("3", "♠")]); // Not first turn
      humanPlayer.handlePassButtonClick();
      expect(game.passTurnCalled).to.be.true;
    });
  });
});
