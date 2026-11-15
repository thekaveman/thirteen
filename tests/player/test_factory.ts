import { Deck, Game, GameClient } from "../../src/app/game/index.js";
import { createPlayer, HumanPlayer, AIPlayer, PLAYER_TYPES } from "../../src/app/player/index.js";

describe("Player Factory", () => {
  let game, gameClient;

  beforeEach(() => {
    const deck = new Deck();
    game = new Game(deck);
    gameClient = new GameClient(game);
  });

  it("should create a HumanPlayer", () => {
    const player = createPlayer({
      type: PLAYER_TYPES.HUMAN,
      gameClient: gameClient,
      number: 0,
      ui: {},
    });
    expect(player).to.be.an.instanceOf(HumanPlayer);
    expect(player.type).to.equal(PLAYER_TYPES.HUMAN);
    expect(player.number).to.equal(0);
  });

  it("should create an AIPlayer with a valid persona", () => {
    const player = createPlayer({
      type: PLAYER_TYPES.AI,
      persona: "random",
      gameClient: gameClient,
      number: 1,
    });
    expect(player).to.be.an.instanceOf(AIPlayer);
    expect(player.type).to.equal(PLAYER_TYPES.AI);
    expect(player.ai.type).to.equal("random");
    expect(player.number).to.equal(1);
  });

  it("should throw an error for an unknown AI persona", () => {
    expect(() =>
      createPlayer({
        type: PLAYER_TYPES.AI,
        persona: "unknown-persona",
        gameClient: gameClient,
        number: 1,
      })
    ).to.throw("Unknown AI persona: unknown-persona");
  });

  it("should throw an error for an unknown player type", () => {
    expect(() =>
      createPlayer({
        type: "unknown-type",
        gameClient: gameClient,
        number: 1,
      })
    ).to.throw("Unknown player type: unknown-type");
  });
});
