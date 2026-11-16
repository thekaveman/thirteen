import { Card } from "../../src/app/game/index.js";
import { AIPlayer, PLAYER_TYPES } from "../../src/app/player/index.js";
import { MockAI, MockGame, MockDeck } from "../mocks.ts";
import { GameClient } from "../../src/app/game/index.js";

describe("AIPlayer", () => {
  it("Constructor should correctly initialize AIPlayer", () => {
    const game = new MockGame(new MockDeck());
    const gameClient = new GameClient(game);
    const ai = new MockAI(gameClient);
    const aiPlayer = new AIPlayer(gameClient, 1, ai);
    expect(aiPlayer.type).to.equal(PLAYER_TYPES.AI);
    expect(aiPlayer.ai).to.equal(ai);
  });

  it("data() should return correct data", () => {
    const game = new MockGame(new MockDeck());
    const gameClient = new GameClient(game);
    const ai = new MockAI(gameClient);
    const player = new AIPlayer(gameClient, 1, ai);
    const playerData = player.data();

    expect(playerData.id).to.equal(player.id);
    expect(playerData.type).to.equal(PLAYER_TYPES.AI);
    expect(playerData.number).to.equal(1);
    expect(playerData.ai.id).to.equal(ai.id);
  });

  it("takeTurn() should return the move from the AI", () => {
    const game = new MockGame(new MockDeck());
    const gameClient = new GameClient(game);
    gameClient.setCurrentPlayer(0);
    gameClient.setPlayerHands([[]]);
    const move = [new Card("5", "♦")];
    const ai = new MockAI(gameClient, move);
    const player = new AIPlayer(gameClient, 0, ai);
    const selectedMove = player.takeTurn();
    expect(selectedMove).to.equal(move);
  });
});
