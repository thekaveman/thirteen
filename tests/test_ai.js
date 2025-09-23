import { AI, LowestCardAI } from "../src/ai.js";
import { Card } from "../src/deck.js";
import { Game } from "../src/game.js";
import { log } from "../src/utils.js";
import { MockAI } from "./mocks.js";
import { assert } from "./utils.js";

function test_AI_findAllValidMoves() {
  const game = new Game();
  const ai = new AI(game);
  const hand = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("5", "♠")];
  const playPile = [];
  const currentTurn = 3;
  const allPlayerHands = [hand];

  const allValidMoves = ai.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

  // Expected moves: singles (3♠, 3♦, 4♣, 5♠), pair (3♠, 3♦), straights (3♠-4♣-5♠, 3♦-4♣-5♠)
  // Total 7 moves
  assert(allValidMoves.length === 7, "Should return all valid moves from different combination types");

  // Sort the moves for consistent assertion
  allValidMoves.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a[0].value - b[0].value;
  });

  assert(
    allValidMoves[0].length === 1 && allValidMoves[0][0].rank === "3" && allValidMoves[0][0].suit === "♠",
    "First move should be 3♠"
  );
  assert(
    allValidMoves[1].length === 1 && allValidMoves[1][0].rank === "3" && allValidMoves[1][0].suit === "♦",
    "Second move should be 3♦"
  );
  assert(
    allValidMoves[2].length === 1 && allValidMoves[2][0].rank === "4" && allValidMoves[2][0].suit === "♣",
    "Third move should be 4♣"
  );
  assert(
    allValidMoves[3].length === 1 && allValidMoves[3][0].rank === "5" && allValidMoves[3][0].suit === "♠",
    "Fourth move should be 5♠"
  );
  assert(
    allValidMoves[4].length === 2 && allValidMoves[4][0].rank === "3" && allValidMoves[4][1].rank === "3",
    "Fifth move should be a pair of 3s"
  );
  assert(
    allValidMoves[5].length === 3 &&
      allValidMoves[5][0].rank === "3" &&
      allValidMoves[5][1].rank === "4" &&
      allValidMoves[5][2].rank === "5",
    "Sixth move should be a 3-4-5 straight"
  );
  assert(
    allValidMoves[6].length === 3 &&
      allValidMoves[6][0].rank === "3" &&
      allValidMoves[6][1].rank === "4" &&
      allValidMoves[6][2].rank === "5",
    "Seventh move should be another 3-4-5 straight"
  );
}

function test_AI_generateCombinations_consecutivePairs() {
  const game = new Game();
  const ai = new AI(game);
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
  const consecutivePairs = ai.generateCombinations(hand, "consecutive_pairs");

  assert(consecutivePairs.length === 3, "Should return 3 consecutive pairs combinations");

  const lengths = consecutivePairs.map((c) => c.length).sort((a, b) => a - b);
  assert(lengths[0] === 6 && lengths[1] === 6 && lengths[2] === 8, "Should have two 3-pair and one 4-pair combinations");
}

function test_AI_generateCombinations_consecutivePairs_long() {
  const game = new Game();
  const ai = new AI(game);
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
  const consecutivePairs = ai.generateCombinations(hand, "consecutive_pairs");

  assert(consecutivePairs.length === 5, "Should return 5 consecutive pairs combinations for a long sequence");

  const hasInvalidLength = consecutivePairs.some((comb) => comb.length > 8);
  assert(!hasInvalidLength, "Should not generate consecutive pairs of length 5 or more");
}

function test_AI_generateCombinations_fourOfAKind() {
  const game = new Game();
  const ai = new AI(game);
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
  const fourOfAKind = ai.generateCombinations(hand, "four_of_a_kind");

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
  const game = new Game();
  const ai = new AI(game);
  const hand = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥"), new Card("5", "♠")];
  const pairs = ai.generateCombinations(hand, "pair");

  assert(pairs.length === 2, "Should return 2 pairs");
  assert(pairs[0][0].rank === "3" && pairs[0][1].rank === "3", "First pair should be the lowest pair");
  assert(pairs[1][0].rank === "4" && pairs[1][1].rank === "4", "Second pair should be the next lowest pair");
}

function test_AI_generateCombinations_singles() {
  const game = new Game();
  const ai = new AI(game);
  const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  const singles = ai.generateCombinations(hand, "single");

  assert(singles.length === 3, "Should return 3 single cards");
  assert(singles[0][0].value === Card.getValue("3", "♠"), "First single should be the lowest card");
  assert(singles[1][0].value === Card.getValue("4", "♦"), "Second single should be the middle card");
  assert(singles[2][0].value === Card.getValue("5", "♣"), "Third single should be the highest card");
}

function test_AI_generateCombinations_straights() {
  const game = new Game();
  const ai = new AI(game);
  const hand = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("7", "♦")];
  const straights = ai.generateCombinations(hand, "straight");

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
  const game = new Game();
  const ai = new AI(game);
  const hand = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("3", "♣"),
    new Card("4", "♠"),
    new Card("4", "♦"),
    new Card("4", "♣"),
  ];
  const triples = ai.generateCombinations(hand, "triple");

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

function test_LowestCardAI_takeTurn_LowestConsecutivePairs() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const playerHand = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
    new Card("6", "♠"),
    new Card("6", "♦"),
  ];
  const playPile = [new Card("2", "♠")]; // Play pile has a single 2
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

function test_LowestCardAI_takeTurn_LowestFourOfAKind() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [
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
  const playPile = [new Card("2", "♠")]; // Play pile has a single 2
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 4, "Should find a four of a kind move");
  assert(
    move[0].rank === "3" && move[1].rank === "3" && move[2].rank === "3" && move[3].rank === "3",
    "Should find the lowest four of a kind"
  );
}

function test_LowestCardAI_takeTurn_LowestPair() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [[new Card("4", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("5", "♥")]];
  const playPile = [new Card("3", "♠"), new Card("3", "♦")]; // Play pile has a pair of 3s
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 2, "Should find a pair move");
  assert(move[0].rank === "4" && move[1].rank === "4", "Should find the lowest pair");
}

function test_LowestCardAI_takeTurn_LowestSingle() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [[new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")]];
  const playPile = [new Card("3", "♠")];
  const currentTurn = 1;

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 1, "Should find a single card move");
  assert(move[0].value === Card.getValue("4", "♠"), "Should find the lowest valid single card");
}

function test_LowestCardAI_takeTurn_LowestStraight() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [[new Card("6", "♠"), new Card("7", "♦"), new Card("8", "♣"), new Card("9", "♠"), new Card("10", "♦")]];
  const playPile = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")]; // Play pile has a straight of 3-4-5
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 3, "Should find a straight move");
  assert(move[0].rank === "6" && move[1].rank === "7" && move[2].rank === "8", "Should find the lowest straight");
}

function test_LowestCardAI_takeTurn_LowestTriple() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [
    [new Card("5", "♠"), new Card("5", "♦"), new Card("5", "♣"), new Card("6", "♠"), new Card("6", "♦"), new Card("6", "♣")],
  ];
  const playPile = [new Card("4", "♠"), new Card("4", "♦"), new Card("4", "♣")]; // Play pile has a triple of 4s
  const currentTurn = 1; // Not the first turn

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 3, "Should find a triple move");
  assert(move[0].rank === "5" && move[1].rank === "5" && move[2].rank === "5", "Should find the lowest triple");
}

function test_LowestCardAI_takeTurn_returnsEmptyArrayWhenNoValidMove() {
  const game = new Game();
  const ai = new LowestCardAI(game);
  const currentPlayer = 0;
  const playerHands = [[new Card("4", "♠"), new Card("5", "♦")]];
  const playPile = [new Card("6", "♣")];
  const currentTurn = 1;

  const move = ai.takeTurn(playerHands[currentPlayer], playPile, currentTurn, playerHands);

  assert(move.length === 0, "Should return an empty array when no valid move is found");
}

function test_MockAI_takeTurn() {
  const game = new Game();
  const move = [new Card("5", "♦")];
  const ai = new MockAI(game, move);
  const selectedMove = ai.takeTurn();
  assert(selectedMove === move, "MockAI should return the move it was constructed with");
}

export const aiTests = [
  test_AI_findAllValidMoves,
  test_AI_generateCombinations_consecutivePairs,
  test_AI_generateCombinations_consecutivePairs_long,
  test_AI_generateCombinations_fourOfAKind,
  test_AI_generateCombinations_pairs,
  test_AI_generateCombinations_singles,
  test_AI_generateCombinations_straights,
  test_AI_generateCombinations_triples,
  test_LowestCardAI_takeTurn_LowestConsecutivePairs,
  test_LowestCardAI_takeTurn_LowestFourOfAKind,
  test_LowestCardAI_takeTurn_LowestPair,
  test_LowestCardAI_takeTurn_LowestSingle,
  test_LowestCardAI_takeTurn_LowestStraight,
  test_LowestCardAI_takeTurn_LowestTriple,
  test_LowestCardAI_takeTurn_returnsEmptyArrayWhenNoValidMove,
  test_MockAI_takeTurn,
];
