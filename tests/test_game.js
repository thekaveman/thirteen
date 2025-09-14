import { assert } from "./utils.js";
import {
  allCardsHaveSameRank,
  findLowestCardInGame,
  findStartingPlayer,
  gameState,
  getCombinationType,
  isBombForPairOfTwos,
  isBombForSingleTwo,
  isConsecutivePairs,
  isFourOfAKind,
  isPair,
  isSingle,
  isStraight,
  isTriple,
  sortHand,
  switchToNextPlayer,
} from "../src/game.js";

function test_allCardsHaveSameRank_returnsFalseForDifferentRank() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♦", value: 45 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  assert(!allCardsHaveSameRank(cards), "Should return false for cards with different ranks");
}

function test_allCardsHaveSameRank_returnsTrueForSameRank() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  assert(allCardsHaveSameRank(cards), "Should return true for cards with the same rank");
}

function test_findLowestCardInGame_findsLowestCard() {
  const hands = [
    [
      { rank: "A", suit: "♠", value: 48 },
      { rank: "K", suit: "♣", value: 45 },
    ],
    [
      { rank: "3", suit: "♦", value: 2 },
      { rank: "4", suit: "♠", value: 4 },
    ],
  ];
  const lowestCard = findLowestCardInGame(hands);
  assert(lowestCard.value === 2, "Should find the lowest card in the game");
}

function test_findStartingPlayer_findsPlayerWithLowestCard() {
  const hands = [
    [
      { rank: "A", suit: "♠", value: 48 },
      { rank: "K", suit: "♣", value: 45 },
    ],
    [
      { rank: "3", suit: "♦", value: 2 },
      { rank: "4", suit: "♠", value: 4 },
    ],
  ];
  const startingPlayer = findStartingPlayer(hands);
  assert(startingPlayer === 1, "Player with the lowest card should start");
}

function test_gameState() {}

function test_getCombinationType_returnsCorrectType() {
  let cards = [{ rank: "A", suit: "♠", value: 48 }];
  assert(getCombinationType(cards) === "single", "Should return single");

  cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  assert(getCombinationType(cards) === "pair", "Should return pair");

  cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  assert(getCombinationType(cards) === "triple", "Should return triple");

  cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  assert(getCombinationType(cards) === "four_of_a_kind", "Should return four_of_a_kind");

  cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  assert(getCombinationType(cards) === "straight", "Should return straight");

  cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  assert(getCombinationType(cards) === "consecutive_pairs", "Should return consecutive_pairs");

  cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♠", value: 47 },
  ];
  assert(getCombinationType(cards) === "invalid", "Should return invalid");
}

function test_isBombForPairOfTwos_returnsFalseForOtherCombinations() {
  const single = [{ rank: "A", suit: "♠", value: 48 }];
  const pair = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  const triple = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  const straight = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  const fourOfAKind = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  assert(!isBombForPairOfTwos(single), "Should return false for a single");
  assert(!isBombForPairOfTwos(pair), "Should return false for a pair");
  assert(!isBombForPairOfTwos(triple), "Should return false for a triple");
  assert(!isBombForPairOfTwos(straight), "Should return false for a straight");
  assert(!isBombForPairOfTwos(fourOfAKind), "Should return false for a four of a kind");
}

function test_isBombForPairOfTwos_returnsTrueForFourConsecutivePairs() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
    { rank: "6", suit: "♠", value: 12 },
    { rank: "6", suit: "♦", value: 13 },
  ];
  assert(isBombForPairOfTwos(cards), "Should return true for four consecutive pairs");
}

function test_isBombForSingleTwo_returnsFalseForOtherCombinations() {
  const single = [{ rank: "A", suit: "♠", value: 48 }];
  const pair = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  const triple = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  const straight = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  assert(!isBombForSingleTwo(single), "Should return false for a single");
  assert(!isBombForSingleTwo(pair), "Should return false for a pair");
  assert(!isBombForSingleTwo(triple), "Should return false for a triple");
  assert(!isBombForSingleTwo(straight), "Should return false for a straight");
}

function test_isBombForSingleTwo_returnsTrueForFourOfAKind() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  assert(isBombForSingleTwo(cards), "Should return true for four of a kind");
}

function test_isBombForSingleTwo_returnsTrueForThreeConsecutivePairs() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  assert(isBombForSingleTwo(cards), "Should return true for three consecutive pairs");
}

function test_isConsecutivePairs_returnsFalseForNotConsecutivePairs() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "6", suit: "♠", value: 12 },
    { rank: "6", suit: "♦", value: 13 },
  ];
  assert(!isConsecutivePairs(cards), "Should return false for non-consecutive pairs");
}

function test_isConsecutivePairs_returnsTrueForConsecutivePairs() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  assert(isConsecutivePairs(cards), "Should return true for consecutive pairs");
}

function test_isFourOfAKind_returnsFalseForNotFourOfAKind() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♠", value: 47 },
    { rank: "Q", suit: "♠", value: 46 },
    { rank: "J", suit: "♠", value: 45 },
  ];
  assert(!isFourOfAKind(cards), "Should return false for four different cards");
}

function test_isFourOfAKind_returnsTrueForFourOfAKind() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  assert(isFourOfAKind(cards), "Should return true for a four of a kind");
}

function test_isPair_returnsFalseForNotPair() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♠", value: 47 },
  ];
  assert(!isPair(cards), "Should return false for two different cards");
}

function test_isPair_returnsTrueForPair() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  assert(isPair(cards), "Should return true for a pair");
}

function test_isSingle_returnsFalseForNotSingle() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♠", value: 47 },
  ];
  assert(!isSingle(cards), "Should return false for more than one card");
}

function test_isSingle_returnsTrueForSingle() {
  const cards = [{ rank: "A", suit: "♠", value: 48 }];
  assert(isSingle(cards), "Should return true for a single card");
}

function test_isStraight_returnsFalseForNotStraight() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "5", suit: "♦", value: 9 },
    { rank: "6", suit: "♣", value: 14 },
  ];
  assert(!isStraight(cards), "Should return false for a non-straight");
}

function test_isStraight_returnsFalseForStraightWith2() {
  const cards = [
    { rank: "K", suit: "♠", value: 44 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "2", suit: "♣", value: 51 },
  ];
  assert(!isStraight(cards), "Should return false for a straight with a 2");
}

function test_isStraight_returnsTrueForStraight() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  assert(isStraight(cards), "Should return true for a straight");
}

function test_isTriple_returnsFalseForNotTriple() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "K", suit: "♠", value: 47 },
    { rank: "Q", suit: "♠", value: 46 },
  ];
  assert(!isTriple(cards), "Should return false for three different cards");
}

function test_isTriple_returnsTrueForTriple() {
  const cards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  assert(isTriple(cards), "Should return true for a triple");
}

function test_sortHand_sortsHandByValue() {
  const hand = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "3", suit: "♦", value: 2 },
    { rank: "K", suit: "♣", value: 45 },
  ];
  sortHand(hand);
  assert(hand[0].value === 2, "Hand should be sorted by value");
  assert(hand[1].value === 45, "Hand should be sorted by value");
  assert(hand[2].value === 48, "Hand should be sorted by value");
}

function test_switchToNextPlayer_switchesPlayer() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  switchToNextPlayer();
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  switchToNextPlayer();
  assert(gameState.currentPlayer === 0, "Should switch back to the first player");
  switchToNextPlayer();
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
}

export const gameTests = [
  test_allCardsHaveSameRank_returnsFalseForDifferentRank,
  test_allCardsHaveSameRank_returnsTrueForSameRank,
  test_findLowestCardInGame_findsLowestCard,
  test_findStartingPlayer_findsPlayerWithLowestCard,
  test_gameState,
  test_getCombinationType_returnsCorrectType,
  test_isBombForPairOfTwos_returnsFalseForOtherCombinations,
  test_isBombForPairOfTwos_returnsTrueForFourConsecutivePairs,
  test_isBombForSingleTwo_returnsFalseForOtherCombinations,
  test_isBombForSingleTwo_returnsTrueForFourOfAKind,
  test_isBombForSingleTwo_returnsTrueForThreeConsecutivePairs,
  test_isConsecutivePairs_returnsFalseForNotConsecutivePairs,
  test_isConsecutivePairs_returnsTrueForConsecutivePairs,
  test_isFourOfAKind_returnsFalseForNotFourOfAKind,
  test_isFourOfAKind_returnsTrueForFourOfAKind,
  test_isPair_returnsFalseForNotPair,
  test_isPair_returnsTrueForPair,
  test_isSingle_returnsFalseForNotSingle,
  test_isSingle_returnsTrueForSingle,
  test_isStraight_returnsFalseForNotStraight,
  test_isStraight_returnsFalseForStraightWith2,
  test_isStraight_returnsTrueForStraight,
  test_isTriple_returnsFalseForNotTriple,
  test_isTriple_returnsTrueForTriple,
  test_sortHand_sortsHandByValue,
  test_switchToNextPlayer_switchesPlayer,
];
