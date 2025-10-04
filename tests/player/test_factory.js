import { Game } from "../../src/app/game.js";
import { createPlayer, HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { PLAYER_TYPES } from "../../src/app/constants.js";
import { Deck } from "../../src/app/deck.js";

describe("Player Factory", () => {
  let game;

  beforeEach(() => {
    const deck = new Deck();
    game = new Game(deck);
  });

  it("should create a HumanPlayer", () => {
    const player = createPlayer({
      type: PLAYER_TYPES.HUMAN,
      game: game,
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
      game: game,
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
        game: game,
        number: 1,
      })
    ).to.throw("Unknown AI persona: unknown-persona");
  });

  it("should throw an error for an unknown player type", () => {
    expect(() =>
      createPlayer({
        type: "unknown-type",
        game: game,
        number: 1,
      })
    ).to.throw("Unknown player type: unknown-type");
  });
});
