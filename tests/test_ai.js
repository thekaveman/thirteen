import { assert } from "./utils.js";
import { AI, LowestCardAI } from "../src/ai.js";
import { createCard, getCardValue } from "../src/deck.js";

export class TestAI {
  constructor(move) {
    this.move = move;
  }

  takeTurn(hand, playPile, currentTurn, playerHands) {
    return this.move;
  }
}

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

function test_LowestCardAI_takeTurn_lowestConsecutivePairs() {
  const ai = new LowestCardAI();
  const playerHand = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
    createCard("6", "♠"),
    createCard("6", "♦"),
  ];
  const playPile = [createCard("2", "♠")]; // Play pile has a single 2
  const currentTurn = 1; // Not the first turn
  const allPlayerHands = [playerHand];

  const move = ai.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);

  assert(move.length === 6, "AI should have played three consecutive pairs");
  assert(
    move[0].rank === "3" &&
      move[1].rank === "3" &&
      move[2].rank === "4" &&
      move[3].rank === "4" &&
      move[4].rank === "5" &&
      move[5].rank === "5",
    "AI should have played the 33-44-55 consecutive pairs"
  );
}

function test_LowestCardAI_takeTurn_lowestFourOfAKind() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [
    [
      createCard("3", "♠"),
      createCard("3", "♦"),
      createCard("3", "♣"),
      createCard("3", "♥"),
      createCard("4", "♠"),
      createCard("4", "♣"),
      createCard("4", "♦"),
      createCard("4", "♥"),
    ],
  ];
  const playPile = [createCard("2", "♠")]; // Play pile has a single 2
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 4, "Should find a four of a kind move");
  assert(
    move[0].rank === "3" && move[1].rank === "3" && move[2].rank === "3" && move[3].rank === "3",
    "Should find the lowest four of a kind"
  );
}

function test_LowestCardAI_takeTurn_lowestPair() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [[createCard("4", "♠"), createCard("4", "♦"), createCard("5", "♣"), createCard("5", "♥")]];
  const playPile = [createCard("3", "♠"), createCard("3", "♦")]; // Play pile has a pair of 3s
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 2, "Should find a pair move");
  assert(move[0].rank === "4" && move[1].rank === "4", "Should find the lowest pair");
}

function test_LowestCardAI_takeTurn_lowestSingle() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [[createCard("4", "♠"), createCard("5", "♦"), createCard("6", "♣")]];
  const playPile = [createCard("3", "♠")];
  const currentTurn = 1;

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 1, "Should find a single card move");
  assert(move[0].value === getCardValue("4", "♠"), "Should find the lowest valid single card");
}

function test_LowestCardAI_takeTurn_lowestStraight() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [
    [createCard("6", "♠"), createCard("7", "♦"), createCard("8", "♣"), createCard("9", "♠"), createCard("10", "♦")],
  ];
  const playPile = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")]; // Play pile has a straight of 3-4-5
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 3, "Should find a straight move");
  assert(move[0].rank === "6" && move[1].rank === "7" && move[2].rank === "8", "Should find the lowest straight");
}

function test_LowestCardAI_takeTurn_lowestTriple() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [
    [
      createCard("5", "♠"),
      createCard("5", "♦"),
      createCard("5", "♣"),
      createCard("6", "♠"),
      createCard("6", "♦"),
      createCard("6", "♣"),
    ],
  ];
  const playPile = [createCard("4", "♠"), createCard("4", "♦"), createCard("4", "♣")]; // Play pile has a triple of 4s
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 3, "Should find a triple move");
  assert(move[0].rank === "5" && move[1].rank === "5" && move[2].rank === "5", "Should find the lowest triple");
}

function test_LowestCardAI_takeTurn_returnsEmptyArrayWhenNoValidMove() {
  const ai = new LowestCardAI();
  const currentPlayer = 0;
  const playerHands = [[createCard("4", "♠"), createCard("5", "♦")]];
  const playPile = [createCard("6", "♣")];
  const currentTurn = 1;

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 0, "Should return an empty array when no valid move is found");
}

function test_TestAI_takeTurn() {
  const move = [createCard("5", "♦")];
  const ai = new TestAI(move);
  const selectedMove = ai.takeTurn();
  assert(selectedMove === move, "TestAI should return the move it was constructed with");
}

export const aiTests = [
  test_AI_generateCombinations_consecutivePairs,
  test_AI_generateCombinations_fourOfAKind,
  test_AI_generateCombinations_pairs,
  test_AI_generateCombinations_singles,
  test_AI_generateCombinations_straights,
  test_AI_generateCombinations_triples,
  test_LowestCardAI_takeTurn_lowestConsecutivePairs,
  test_LowestCardAI_takeTurn_lowestFourOfAKind,
  test_LowestCardAI_takeTurn_lowestPair,
  test_LowestCardAI_takeTurn_lowestSingle,
  test_LowestCardAI_takeTurn_lowestStraight,
  test_LowestCardAI_takeTurn_lowestTriple,
  test_LowestCardAI_takeTurn_returnsEmptyArrayWhenNoValidMove,
  test_TestAI_takeTurn,
];
