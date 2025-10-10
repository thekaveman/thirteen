import { HighestCardAI } from "../../src/app/ai/index.js";
import { Card, Game, GameClient } from "../../src/app/game/index.js";
import { MockDeck } from "../mocks.js";

describe("HighestCardAI", () => {
  let game, gameClient, highestCardAI;

  beforeEach(() => {
    game = new Game(new MockDeck());
    gameClient = new GameClient(game);
    highestCardAI = new HighestCardAI(gameClient);
  });

  it("takeTurn() should return an empty array if no valid move exists", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦")]];
    const playPile = [new Card("2", "♥")]; // Highest possible card
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.be.an("array").that.is.empty;
  });

  it("takeTurn() should choose the highest valid single", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")]];
    const playPile = [new Card("3", "♣")]; // Lower than 4♦ and 5♣
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(1);
    expect(move[0].value).to.equal(Card.getValue("5", "♣"));
  });

  it("takeTurn() should choose the highest valid pair", () => {
    const hand = [[new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥")]];
    const playPile = [new Card("3", "♥"), new Card("3", "♠")]; // Lower than 4♣ and 4♥
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(2);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the highest valid triple", () => {
    const hand = [
      [new Card("3", "♠"), new Card("3", "♦"), new Card("3", "♣"), new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")],
    ];
    const playPile = [new Card("3", "♥"), new Card("3", "♠"), new Card("3", "♦")]; // Lower than 4♠, 4♦, 4♣
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the highest valid straight", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("7", "♦")]];
    const playPile = [new Card("3", "♣"), new Card("4", "♠"), new Card("5", "♦")]; // Lower than 5♣, 6♠, 7♦
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move.map((c) => c.rank)).to.deep.equal(["5", "6", "7"]);
  });

  it("takeTurn() should choose the highest four-of-a-kind bomb", () => {
    const hand = [
      [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("3", "♣"),
        new Card("3", "♥"),
        new Card("4", "♠"),
        new Card("4", "♣"),
        new Card("4", "♦"),
        new Card("4", "♥"),
      ],
    ];
    const playPile = [new Card("2", "♠")];
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(4);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the highest consecutive pairs bomb", () => {
    const hand = [
      [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
        new Card("6", "♠"),
        new Card("6", "♦"),
      ],
    ];
    const playPile = [new Card("2", "♠")];
    const move = highestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(6);
    expect(move.map((c) => c.rank)).to.deep.equal(["4", "4", "5", "5", "6", "6"]);
  });

  it("takeTurn() should choose the highest value combination when pile is empty", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♥")];
    const move = highestCardAI.takeTurn(hand, [], 1, [hand]);
    expect(move).to.have.lengthOf(1);
    expect(move[0].rank).to.equal("6");
    expect(move[0].suit).to.equal("♥");
  });
});
