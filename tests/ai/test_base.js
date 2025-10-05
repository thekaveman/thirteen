import { AI } from "../../src/app/ai/index.js";
import { Card, Game, COMBINATION_TYPES } from "../../src/app/game/index.js";

describe("AI", () => {
  let game, ai;

  beforeEach(() => {
    game = new Game();
    ai = new AI(game);
  });

  describe("Base AI Class", () => {
    it("data() should return correct data", () => {
      const specificAI = new AI(game, "test-type", "test-persona");
      const aiData = specificAI.data();
      expect(aiData.id).to.equal(specificAI.id);
      expect(aiData.game).to.equal(game.id);
      expect(aiData.type).to.equal("test-type");
      expect(aiData.persona).to.equal("test-persona");
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

    it("generateCombinations() should return no straights for small hands", () => {
      const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("2", "♣")];
      const straights = ai.generateCombinations(hand, COMBINATION_TYPES.STRAIGHT);
      expect(straights).to.have.lengthOf(0);
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

    it("generateCombinations() for consecutive pairs should handle small hands correctly", () => {
      const hand = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("6", "♦"),
      ];
      const consecutivePairs = ai.generateCombinations(hand, COMBINATION_TYPES.CONSECUTIVE_PAIRS);
      expect(consecutivePairs).to.have.lengthOf(0);
    });

    it("_deriveSubConsecutivePairs() should return an empty array for small sequences", () => {
      const smallSequence = [[new Card("3", "♠"), new Card("3", "♦")]];
      const subConsecutivePairs = ai._deriveSubConsecutivePairs(smallSequence);
      expect(subConsecutivePairs).to.have.lengthOf(0);
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
});
