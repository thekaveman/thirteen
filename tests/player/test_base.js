import { Player } from "../../src/app/player/index.js";
import { MockGame, MockGameClient, MockDeck } from "../mocks.js";

describe("Player", () => {
  it("Constructor should correctly initialize base Player", () => {
    const game = new MockGame(new MockDeck());
    const gameClient = new MockGameClient(game);
    const player = new Player("test", gameClient, 0);
    expect(player.id).to.not.be.null;
    expect(player.type).to.equal("test");
    expect(player.number).to.equal(0);
    expect(player.gameClient.game).to.equal(game);
  });

  it("takeTurn() should throw an exception in the base class", () => {
    const game = new MockGame(new MockDeck());
    const gameClient = new MockGameClient(game);
    const player = new Player("test", gameClient, 0);
    expect(player.takeTurn).to.throw("Subclasses must implement takeTurn");
  });
});
