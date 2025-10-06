import { Card, Rules, COMBINATION_TYPES } from "../../src/app/game/index.js";

describe("Rules", () => {
  let rules;

  beforeEach(() => {
    rules = new Rules();
  });

  describe("Card Combination Logic", () => {
    it("getCombinationType() should identify all valid combination types", () => {
      expect(rules.getCombinationType([new Card("A", "♠")])).to.equal(COMBINATION_TYPES.SINGLE);
      expect(rules.getCombinationType([new Card("A", "♠"), new Card("A", "♦")])).to.equal(COMBINATION_TYPES.PAIR);
      expect(rules.getCombinationType([new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")])).to.equal(
        COMBINATION_TYPES.TRIPLE
      );
      expect(rules.getCombinationType([new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦"), new Card("A", "♥")])).to.equal(
        COMBINATION_TYPES.FOUR_OF_A_KIND
      );
      expect(rules.getCombinationType([new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")])).to.equal(
        COMBINATION_TYPES.STRAIGHT
      );
      const consecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      expect(rules.getCombinationType(consecutivePairs)).to.equal(COMBINATION_TYPES.CONSECUTIVE_PAIRS);
      expect(rules.getCombinationType([new Card("K", "♠"), new Card("A", "♠")])).to.equal(COMBINATION_TYPES.INVALID);
    });

    it("isSingle() should correctly identify a single", () => {
      expect(rules.isSingle([new Card("A", "♠")])).to.be.true;
      expect(rules.isSingle([new Card("A", "♠"), new Card("K", "♠")])).to.be.false;
    });

    it("isPair() should correctly identify a pair", () => {
      expect(rules.isPair([new Card("A", "♠"), new Card("A", "♦")])).to.be.true;
      expect(rules.isPair([new Card("A", "♠"), new Card("K", "♠")])).to.be.false;
    });

    it("isTriple() should correctly identify a triple", () => {
      expect(rules.isTriple([new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣")])).to.be.true;
      expect(rules.isTriple([new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠")])).to.be.false;
    });

    it("isFourOfAKind() should correctly identify a four-of-a-kind", () => {
      expect(rules.isFourOfAKind([new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")])).to.be.true;
      expect(
        rules.isFourOfAKind([new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠"), new Card("J", "♠")])
      ).to.be.false;
    });

    it("isStraight() should correctly identify straights", () => {
      expect(rules.isStraight([new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")])).to.be.true;
      expect(rules.isStraight([new Card("3", "♠"), new Card("5", "♦"), new Card("6", "♣")])).to.be.false;
      expect(rules.isStraight([new Card("K", "♠"), new Card("A", "♦"), new Card("2", "♣")])).to.be.false;
    });

    it("isConsecutivePairs() should correctly identify consecutive pairs", () => {
      const validPairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const invalidPairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("5", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const nonConsecutive = [new Card("3", "♠"), new Card("3", "♦"), new Card("5", "♣"), new Card("5", "♥")];
      const withTwos = [new Card("A", "♠"), new Card("A", "♦"), new Card("2", "♣"), new Card("2", "♥")];
      expect(rules.isConsecutivePairs(validPairs)).to.be.true;
      expect(rules.isConsecutivePairs(invalidPairs)).to.be.false;
      expect(rules.isConsecutivePairs(nonConsecutive)).to.be.false;
      expect(rules.isConsecutivePairs(withTwos)).to.be.false;
    });

    it("isBombForSingleTwo() should identify correct bombs for a single two", () => {
      const fourOfAKind = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
      const threeConsecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
      ];
      const invalidBomb = [new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠")];
      expect(rules.isBombForSingleTwo(fourOfAKind)).to.be.true;
      expect(rules.isBombForSingleTwo(threeConsecutivePairs)).to.be.true;
      expect(rules.isBombForSingleTwo(invalidBomb)).to.be.false;
    });

    it("isBombForPairOfTwos() should identify correct bombs for a pair of twos", () => {
      const fourConsecutivePairs = [
        new Card("3", "♠"),
        new Card("3", "♦"),
        new Card("4", "♣"),
        new Card("4", "♥"),
        new Card("5", "♠"),
        new Card("5", "♦"),
        new Card("6", "♣"),
        new Card("6", "♦"),
      ];
      const invalidBomb = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
      expect(rules.isBombForPairOfTwos(fourConsecutivePairs)).to.be.true;
      expect(rules.isBombForPairOfTwos(invalidBomb)).to.be.false;
    });
  });

  describe("Play Validation", () => {
    it("should not allow playing cards that are not in the player's hand", () => {
      const playerHand = [new Card("3", "♠")];
      const selectedCards = [new Card("4", "♦")];
      const isValid = rules.isValidPlay(selectedCards, [], playerHand, 1, [playerHand]);
      expect(isValid).to.be.false;
    });

    it("should require the lowest card to be played on the first turn", () => {
      const allPlayerHands = [[new Card("4", "♠")], [new Card("3", "♦")]];
      const playerHand = allPlayerHands[0];
      const selectedCards = [new Card("4", "♠")];
      const isValid = rules.isValidPlay(selectedCards, [], playerHand, 0, allPlayerHands);
      expect(isValid).to.be.false;
    });

    it("should allow any valid combination on an empty pile (after first turn)", () => {
      const playerHand = [new Card("5", "♠")];
      const isValid = rules.isValidPlay([new Card("5", "♠")], [], playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require the same combination type as the play pile", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦")];
      const playPile = [new Card("4", "♠")];
      const isValid = rules.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.false;
    });

    it("should require a higher-value card for singles", () => {
      const playerHand = [new Card("5", "♠")];
      const playPile = [new Card("4", "♠")];
      const isValid = rules.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value pair", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦")];
      const playPile = [new Card("4", "♠"), new Card("4", "♦")];
      const isValid = rules.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value triple", () => {
      const playerHand = [new Card("5", "♠"), new Card("5", "♦"), new Card("5", "♣")];
      const playPile = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")];
      const isValid = rules.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    it("should require a higher-value straight", () => {
      const playerHand = [new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")];
      const playPile = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
      const isValid = rules.isValidPlay(playerHand, playPile, playerHand, 1, [playerHand]);
      expect(isValid).to.be.true;
    });

    describe("Bomb Logic", () => {
      it("should allow a four-of-a-kind to beat a single 2", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("2", "♠")];
        const isValid = rules.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should allow three consecutive pairs to beat a single 2", () => {
        const bomb = [
          new Card("3", "♠"),
          new Card("3", "♦"),
          new Card("4", "♣"),
          new Card("4", "♥"),
          new Card("5", "♠"),
          new Card("5", "♦"),
        ];
        const playPile = [new Card("2", "♠")];
        const isValid = rules.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should allow four consecutive pairs to beat a pair of 2s", () => {
        const bomb = [
          new Card("3", "♠"),
          new Card("3", "♦"),
          new Card("4", "♣"),
          new Card("4", "♥"),
          new Card("5", "♠"),
          new Card("5", "♦"),
          new Card("6", "♣"),
          new Card("6", "♦"),
        ];
        const playPile = [new Card("2", "♠"), new Card("2", "♦")];
        const isValid = rules.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.true;
      });

      it("should not allow a bomb on a non-2 card", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("K", "♠")];
        const isValid = rules.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.false;
      });

      it("should not allow a four-of-a-kind to bomb a pair of 2s", () => {
        const bomb = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣"), new Card("4", "♥")];
        const playPile = [new Card("2", "♠"), new Card("2", "♦")];
        const isValid = rules.isValidPlay(bomb, playPile, bomb, 1, [bomb]);
        expect(isValid).to.be.false;
      });
    });
  });
});
