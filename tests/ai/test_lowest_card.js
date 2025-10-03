import { LowestCardAI } from "../../src/app/ai/index.js";
import { Card } from "../../src/app/deck.js";
import { Game } from "../../src/app/game.js";

describe("LowestCardAI", () => {
  let game, lowestCardAI;

  beforeEach(() => {
    game = new Game();
    lowestCardAI = new LowestCardAI(game);
  });

  it("takeTurn() should return an empty array if no valid move exists", () => {
    const hand = [[new Card("4", "♠"), new Card("5", "♦")]];
    const playPile = [new Card("6", "♣")];
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.be.an("array").that.is.empty;
  });

  it("takeTurn() should choose the lowest valid single", () => {
    const hand = [[new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")]];
    const playPile = [new Card("3", "♠")];
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(1);
    expect(move[0].value).to.equal(Card.getValue("4", "♠"));
  });

  it("takeTurn() should choose the lowest valid pair", () => {
    const hand = [[new Card("4", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("5", "♥")]];
    const playPile = [new Card("3", "♠"), new Card("3", "♦")];
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(2);
    expect(move[0].rank).to.equal("4");
  });

  it("takeTurn() should choose the lowest valid triple", () => {
    const hand = [
      [new Card("5", "♠"), new Card("5", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("6", "♦"), new Card("6", "♣")],
    ];
    const playPile = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")];
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move[0].rank).to.equal("5");
  });

  it("takeTurn() should choose the lowest valid straight", () => {
    const hand = [[new Card("6", "♠"), new Card("7", "♦"), new Card("8", "♣"), new Card("9", "♠"), new Card("10", "♦")]];
    const playPile = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(3);
    expect(move.map((c) => c.rank)).to.deep.equal(["6", "7", "8"]);
  });

  it("takeTurn() should choose the lowest four-of-a-kind bomb", () => {
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
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(4);
    expect(move[0].rank).to.equal("3");
  });

  it("takeTurn() should choose the lowest consecutive pairs bomb", () => {
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
    const move = lowestCardAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf(6);
    expect(move.map((c) => c.rank)).to.deep.equal(["3", "3", "4", "4", "5", "5"]);
  });

  it("takeTurn() should choose the lowest value combination when pile is empty", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♥")];
    const move = lowestCardAI.takeTurn(hand, [], 1, [hand]);
    expect(move).to.have.lengthOf(1);
    expect(move[0].rank).to.equal("3");
    expect(move[0].suit).to.equal("♠");
  });
});
