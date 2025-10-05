import { RandomAI } from "../../src/app/ai/index.js";
import { Card, Game } from "../../src/app/game/index.js";

describe("RandomAI", () => {
  let game, randomAI;

  beforeEach(() => {
    game = new Game();
    randomAI = new RandomAI(game);
  });

  it("takeTurn() should return an empty array if no valid move exists", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦")]];
    const playPile = [new Card("2", "♥")]; // Highest possible card
    const move = randomAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.be.an("array").that.is.empty;
  });

  it("takeTurn() should return a valid move if one exists", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")]];
    const playPile = [new Card("3", "♣")]; // Lower than 4♦ and 5♣
    const move = randomAI.takeTurn(hand[0], playPile, 1, hand);
    expect(move).to.have.lengthOf.at.least(1);
  });

  it("takeTurn() should return a random move from the valid moves", () => {
    const hand = [[new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")]];
    const playPile = [new Card("3", "♣")];
    const validMoves = randomAI.findAllValidMoves(hand[0], playPile, 1, hand);

    // Stub Math.random to ensure a specific move is chosen
    const stub = sinon.stub(Math, "random").returns(0.5); // Should pick a middle element

    const move = randomAI.takeTurn(hand[0], playPile, 1, hand);

    expect(move).to.not.be.empty;
    expect(validMoves).to.deep.include(move); // Ensure the chosen move is one of the valid moves
    stub.restore();
  });
});
