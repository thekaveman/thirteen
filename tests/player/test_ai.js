import { PLAYER_TYPES } from "../../src/app/constants.js";
import { Card } from "../../src/app/deck.js";
import { AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockGame } from "../mocks.js";

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
