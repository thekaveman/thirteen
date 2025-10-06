import { HighestValueAI } from "../../src/app/ai/index.js";
import { Card, Game } from "../../src/app/game/index.js";

describe("HighestValueAI", () => {
  let game, highestValueAI;

  beforeEach(() => {
    game = new Game();
    highestValueAI = new HighestValueAI(game);
  });

  it("takeTurn() should return an empty array if no valid move exists", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦")]];
    const playPile = [new Card("2", "♥")]; // Highest possible card
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.be.an("array").that.is.empty;
  });

  it("takeTurn() should choose the valid single with the highest total value", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")]];
    const playPile = [new Card("3", "♠")]; // Lower than 4♦ and 5♣
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(1);
    expect(move[0].value).to.equal(Card.getValue("5", "♣"));
  });

  it("takeTurn() should choose the valid pair with the highest total value", () => {
    const hand = [[new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥")]];
    const playPile = [new Card("3", "♣"), new Card("3", "♥")]; // Lower than 4♣ and 4♥
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(2);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the valid triple with the highest total value", () => {
    const hand = [
      [new Card("3", "♠"), new Card("3", "♦"), new Card("3", "♣"), new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")],
    ];
    const playPile = [new Card("3", "♥"), new Card("3", "♠"), new Card("3", "♦")]; // Lower than 4♠, 4♦, 4♣
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the valid straight with the highest total value", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("7", "♦")]];
    const playPile = [new Card("3", "♣"), new Card("4", "♠"), new Card("5", "♦")]; // Lower than 5♣, 6♠, 7♦
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move.map((c) => c.rank)).to.deep.equal(["5", "6", "7"]);
  });

  it("takeTurn() should choose the four-of-a-kind bomb with the highest total value", () => {
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
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(4);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the consecutive pairs bomb with the highest total value", () => {
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
    const move = highestValueAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(6);
    expect(move.map((c) => c.rank)).to.deep.equal(["4", "4", "5", "5", "6", "6"]);
  });

  it("takeTurn() should choose the highest value combination when pile is empty", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♥")];
    const move = highestValueAI.takeTurn(hand, [], 1, [hand]);
    expect(move).to.have.lengthOf(4);
    expect(move.map((c) => c.rank)).to.deep.equal(["3", "4", "5", "6"]);
  });
});
