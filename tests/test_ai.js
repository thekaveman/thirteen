import { assert } from "./utils.js";
import { AI } from "../src/ai.js";
import { createCard, getCardValue } from "../src/deck.js";

function test_AI_generateCombinations_consecutivePairs() {
  const ai = new AI();
  const hand = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
    createCard("6", "♣"),
    createCard("6", "♥"),
  ];
  const consecutivePairs = ai._generateCombinations(hand, "consecutive_pairs");

  assert(consecutivePairs.length === 3, "Should return 3 consecutive pairs combinations");
  assert(
    consecutivePairs[0].length === 6 &&
      consecutivePairs[0][0].rank === "3" &&
      consecutivePairs[0][1].rank === "3" &&
      consecutivePairs[0][2].rank === "4" &&
      consecutivePairs[0][3].rank === "4" &&
      consecutivePairs[0][4].rank === "5" &&
      consecutivePairs[0][5].rank === "5",
    "First consecutive pair should be 33-44-55"
  );
  assert(
    consecutivePairs[1].length === 8 &&
      consecutivePairs[1][0].rank === "3" &&
      consecutivePairs[1][1].rank === "3" &&
      consecutivePairs[1][2].rank === "4" &&
      consecutivePairs[1][3].rank === "4" &&
      consecutivePairs[1][4].rank === "5" &&
      consecutivePairs[1][5].rank === "5" &&
      consecutivePairs[1][6].rank === "6" &&
      consecutivePairs[1][7].rank === "6",
    "Second consecutive pair should be 33-44-55-66"
  );
  assert(
    consecutivePairs[2].length === 6 &&
      consecutivePairs[2][0].rank === "4" &&
      consecutivePairs[2][1].rank === "4" &&
      consecutivePairs[2][2].rank === "5" &&
      consecutivePairs[2][3].rank === "5" &&
      consecutivePairs[2][4].rank === "6" &&
      consecutivePairs[2][5].rank === "6",
    "Third consecutive pair should be 44-55-66"
  );
}

function test_AI_generateCombinations_fourOfAKind() {
  const ai = new AI();
  const hand = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("3", "♣"),
    createCard("3", "♥"),
    createCard("4", "♠"),
    createCard("4", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
  ];
  const fourOfAKind = ai._generateCombinations(hand, "four_of_a_kind");

  assert(fourOfAKind.length === 2, "Should return 2 four of a kind combinations");
  assert(
    fourOfAKind[0][0].rank === "3" &&
      fourOfAKind[0][1].rank === "3" &&
      fourOfAKind[0][2].rank === "3" &&
      fourOfAKind[0][3].rank === "3",
    "First four of a kind should be the lowest"
  );
  assert(
    fourOfAKind[1][0].rank === "4" &&
      fourOfAKind[1][1].rank === "4" &&
      fourOfAKind[1][2].rank === "4" &&
      fourOfAKind[1][3].rank === "4",
    "Second four of a kind should be the next lowest"
  );
}

function test_AI_generateCombinations_pairs() {
  const ai = new AI();
  const hand = [createCard("3", "♠"), createCard("3", "♦"), createCard("4", "♣"), createCard("4", "♥"), createCard("5", "♠")];
  const pairs = ai._generateCombinations(hand, "pair");

  assert(pairs.length === 2, "Should return 2 pairs");
  assert(pairs[0][0].rank === "3" && pairs[0][1].rank === "3", "First pair should be the lowest pair");
  assert(pairs[1][0].rank === "4" && pairs[1][1].rank === "4", "Second pair should be the next lowest pair");
}

function test_AI_generateCombinations_singles() {
  const ai = new AI();
  const hand = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  const singles = ai._generateCombinations(hand, "single");

  assert(singles.length === 3, "Should return 3 single cards");
  assert(singles[0][0].value === getCardValue("3", "♠"), "First single should be the lowest card");
  assert(singles[1][0].value === getCardValue("4", "♦"), "Second single should be the middle card");
  assert(singles[2][0].value === getCardValue("5", "♣"), "Third single should be the highest card");
}

function test_AI_generateCombinations_straights() {
  const ai = new AI();
  const hand = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣"), createCard("6", "♠"), createCard("7", "♦")];
  const straights = ai._generateCombinations(hand, "straight");

  assert(straights.length === 6, "Should return 6 straights");
  assert(
    straights[0][0].rank === "3" && straights[0][1].rank === "4" && straights[0][2].rank === "5",
    "First straight should be 3-4-5"
  );
  assert(
    straights[1][0].rank === "3" && straights[1][1].rank === "4" && straights[1][2].rank === "5" && straights[1][3].rank === "6",
    "Second straight should be 3-4-5-6"
  );
  assert(
    straights[2][0].rank === "3" &&
      straights[2][1].rank === "4" &&
      straights[2][2].rank === "5" &&
      straights[2][3].rank === "6" &&
      straights[2][4].rank === "7",
    "Third straight should be 3-4-5-6-7"
  );
  assert(
    straights[3][0].rank === "4" && straights[3][1].rank === "5" && straights[3][2].rank === "6",
    "Fourth straight should be 4-5-6"
  );
  assert(
    straights[4][0].rank === "4" && straights[4][1].rank === "5" && straights[4][2].rank === "6" && straights[4][3].rank === "7",
    "Fifth straight should be 4-5-6-7"
  );
  assert(
    straights[5][0].rank === "5" && straights[5][1].rank === "6" && straights[5][2].rank === "7",
    "Sixth straight should be 5-6-7"
  );
}

function test_AI_generateCombinations_triples() {
  const ai = new AI();
  const hand = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("3", "♣"),
    createCard("4", "♠"),
    createCard("4", "♦"),
    createCard("4", "♣"),
  ];
  const triples = ai._generateCombinations(hand, "triple");

  assert(triples.length === 2, "Should return 2 triples");
  assert(
    triples[0][0].rank === "3" && triples[0][1].rank === "3" && triples[0][2].rank === "3",
    "First triple should be the lowest triple"
  );
  assert(
    triples[1][0].rank === "4" && triples[1][1].rank === "4" && triples[1][2].rank === "4",
    "Second triple should be the next lowest triple"
  );
}

export const aiTests = [
  test_AI_generateCombinations_consecutivePairs,
  test_AI_generateCombinations_fourOfAKind,
  test_AI_generateCombinations_pairs,
  test_AI_generateCombinations_singles,
  test_AI_generateCombinations_straights,
  test_AI_generateCombinations_triples,
];
