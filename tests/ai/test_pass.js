import { PassAI } from "../../src/app/ai/index.js";
import { Card, Game, GameClient } from "../../src/app/game/index.js";
import { MockAI, MockDeck } from "../mocks.js";

describe("PassAI", () => {
  let game, gameClient, passAI, randomAIStub;

  beforeEach(() => {
    game = new Game(new MockDeck());
    gameClient = new GameClient(game);
    randomAIStub = new MockAI(gameClient, [new Card("3", "♠")]); // Default forced play
    passAI = new PassAI(gameClient, randomAIStub);
  });

  it("takeTurn() should pass if not forced to play", () => {
    const hand = [[new Card("3", "♠")]];
    const playPile = [new Card("4", "♠")]; // Not empty, so not forced
    const move = passAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.be.an("array").that.is.empty;
  });

  it("takeTurn() should play if it's the first turn of the game", () => {
    const hand = [[new Card("3", "♠")]];
    const playPile = [];
    const move = passAI.takeTurn(hand[0], playPile, 0, hand);
    expect(move).to.deep.equal([new Card("3", "♠")]);
  });

  it("takeTurn() should play if it's the first play of a round", () => {
    const hand = [[new Card("3", "♠")]];
    const playPile = [];
    const move = passAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.deep.equal([new Card("3", "♠")]);
  });

  it("takeTurn() should use the provided strategy when forced to play", () => {
    const hand = [[new Card("3", "♠")]];
    const playPile = [];
    const forcedPlayStrategy = new MockAI(gameClient, [new Card("4", "♦")]);
    const ai = new PassAI(gameClient, forcedPlayStrategy);
    const move = ai.takeTurn(hand[0], playPile, 0, hand);
    expect(move).to.deep.equal([new Card("4", "♦")]);
  });

  it("takeTurn() should use RandomAI as default strategy when forced to play if no strategy is provided", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦")]];
    const playPile = [];
    const ai = new PassAI(gameClient);
    const move = ai.takeTurn(hand[0], playPile, 0, hand);
    // RandomAI will return a random valid move, so we just check if it's not empty
    expect(move).to.not.be.empty;
  });
});
