import { AI, LowestCardAI } from "../src/app/ai.js";
import { COMBINATION_TYPES } from "../src/app/constants.js";
import { Card } from "../src/app/deck.js";
import { Game } from "../src/app/game.js";
import { MockAI } from "./mocks.js";

describe("AI", () => {
  let game, ai;

  beforeEach(() => {
    game = new Game();
    ai = new AI(game);
  });

  describe("Base AI Class", () => {
    it("data() should return correct data", () => {
      const specificAI = new AI(game, "test-type");
      const aiData = specificAI.data();
      expect(aiData.id).to.equal(specificAI.id);
      expect(aiData.type).to.equal("test-type");
      expect(aiData.game).to.equal(game.id);
    });

    it("takeTurn() should throw an error for the base class", () => {
      const baseAI = new AI(game, "base");
      expect(() => baseAI.takeTurn()).to.throw("Subclasses must implement takeTurn");
    });
  });

  describe("Combination Generation", () => {
    it("generateCombinations() should find all singles", () => {
      const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
      const singles = ai.generateCombinations(hand, COMBINATION_TYPES.SINGLE);
      expect(singles).to.have.lengthOf(3);
      expect(singles[0][0].value).to.equal(Card.getValue("3", "♠"));
      expect(singles[1][0].value).to.equal(Card.getValue("4", "♦"));
      expect(singles[2][0].value).to.equal(Card.getValue("5", "♣"));
    });

    it("generateCombinations() should find all pairs", () => {
      const hand = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥"), new Card("5", "♠")];
      const pairs = ai.generateCombinations(hand, COMBINATION_TYPES.PAIR);
      expect(pairs).to.have.lengthOf(2);
      expect(pairs[0][0].rank).to.equal("3");
      expect(pairs[1][0].rank).to.equal("4");
    });

    it("generateCombinations() should find all triples", () => {
      const hand = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("3", "♣"),
        new Card("4", "♠"),
        new Card("4", "♦"),
        new Card("4", "♣"),
      ];
      const triples = ai.generateCombinations(hand, COMBINATION_TYPES.TRIPLE);
      expect(triples).to.have.lengthOf(2);
      expect(triples[0][0].rank).to.equal("3");
      expect(triples[1][0].rank).to.equal("4");
    });

    it("generateCombinations() should find all four-of-a-kinds", () => {
      const hand = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("3", "♣"),
        new Card("3", "♥"),
        new Card("4", "♠"),
        new Card("4", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
      ];
      const quads = ai.generateCombinations(hand, COMBINATION_TYPES.FOUR_OF_A_KIND);
      expect(quads).to.have.lengthOf(2);
      expect(quads[0][0].rank).to.equal("3");
      expect(quads[1][0].rank).to.equal("4");
    });

    it("generateCombinations() should find all straights", () => {
      const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("7", "♦")];
      const straights = ai.generateCombinations(hand, COMBINATION_TYPES.STRAIGHT);
      expect(straights).to.have.lengthOf(6);
      expect(straights.map((s) => s.map((c) => c.rank))).to.deep.include.members([
        ["3", "4", "5"],
        ["3", "4", "5", "6"],
        ["3", "4", "5", "6", "7"],
        ["4", "5", "6"],
        ["4", "5", "6", "7"],
        ["5", "6", "7"],
      ]);
    });

    it("generateCombinations() should find all consecutive pairs", () => {
      const hand = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
        new Card("6", "♣"),
        new Card("6", "♥"),
      ];
      const consecutivePairs = ai.generateCombinations(hand, COMBINATION_TYPES.CONSECUTIVE_PAIRS);
      expect(consecutivePairs).to.have.lengthOf(3);
      const lengths = consecutivePairs.map((c) => c.length).sort((a, b) => a - b);
      expect(lengths).to.deep.equal([6, 6, 8]);
    });

    it("generateCombinations() for consecutive pairs should handle long sequences correctly", () => {
      const hand = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
        new Card("6", "♣"),
        new Card("6", "♥"),
        new Card("7", "♠"),
        new Card("7", "♦"),
      ];
      const consecutivePairs = ai.generateCombinations(hand, COMBINATION_TYPES.CONSECUTIVE_PAIRS);
      expect(consecutivePairs).to.have.lengthOf(5);
      const hasInvalidLength = consecutivePairs.some((comb) => comb.length > 8);
      expect(hasInvalidLength).to.be.false;
    });
  });

  describe("Move Finding", () => {
    it("findAllValidMoves() should find all valid moves of all types", () => {
      const hand = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("5", "♠")];
      const allValidMoves = ai.findAllValidMoves(hand, [], 1, [hand]);
      // Expected: 4 singles, 1 pair, 2 straights (3-4-5)
      expect(allValidMoves).to.have.lengthOf(7);
    });
  });

  describe("LowestCardAI", () => {
    let lowestCardAI;

    beforeEach(() => {
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
        [
          new Card("5", "♠"),
          new Card("5", "♦"),
          new Card("5", "♣"),
          new Card("6", "♠"),
          new Card("6", "♦"),
          new Card("6", "♣"),
        ],
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

  describe("MockAI", () => {
    it("takeTurn() should return the move it was constructed with", () => {
      const move = [new Card("5", "♦")];
      const mockAI = new MockAI(game, move);
      const selectedMove = mockAI.takeTurn();
      expect(selectedMove).to.equal(move);
    });
  });
});
