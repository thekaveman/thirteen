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
  isValidPlay,
  passTurn,
  playCards,
  resetGame,
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

function test_gameState() {
  assert(gameState.numPlayers === 2, "Initial numPlayers should be 2");
  assert(Array.isArray(gameState.playerHands), "Initial playerHands should be an array");
  assert(gameState.playerHands.length === 0, "Initial playerHands should be empty");
  assert(Array.isArray(gameState.playPile), "Initial playPile should be an array");
  assert(gameState.playPile.length === 0, "Initial playPile should be empty");
  assert(gameState.currentPlayer === 0, "Initial currentPlayer should be 0");
  assert(gameState.currentTurn === 0, "Initial currentTurn should be 0");
  assert(Array.isArray(gameState.selectedCards), "Initial selectedCards should be an array");
  assert(gameState.selectedCards.length === 0, "Initial selectedCards should be empty");
  assert(gameState.consecutivePasses === 0, "Initial consecutivePasses should be 0");
  assert(gameState.lastPlayerToPlay === -1, "Initial lastPlayerToPlay should be -1");
  assert(gameState.roundNumber === 1, "Initial roundNumber should be 1");
  assert(gameState.gameOver === false, "Initial gameOver should be false");
}

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

function test_isConsecutivePairs_returnsFalseForInvalidPairs() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "5", suit: "♥", value: 9 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  assert(!isConsecutivePairs(cards), "Should return false for invalid pairs");
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

function test_isStraight_returnsFalseForNotAStraight() {
  const cards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
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

function test_isValidPlay_allowsSingleCardOnEmptyPile() {
  const selectedCards = [{ rank: "6", suit: "♠", value: 0 }];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  gameState.currentTurn = 1; // Not the first turn
  assert(isValidPlay(selectedCards, playPile), "Should allow playing a single card on an empty pile");
}

function test_isValidPlay_cannotStartRoundWithConsecutivePairs() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  gameState.currentTurn = 1;
  assert(!isValidPlay(selectedCards, playPile), "Should not be able to start a round with consecutive pairs");
}

function test_isValidPlay_consecutivePairsCannotBeatLowerConsecutivePairs() {
  const selectedCards = [
    { rank: "4", suit: "♠", value: 4 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 8 },
    { rank: "5", suit: "♥", value: 9 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Consecutive pairs should not beat lower consecutive pairs");
}

function test_isValidPlay_disallowsPlayingCardsNotInOwnHand() {
  gameState.currentPlayer = 0;
  gameState.playerHands = [[{ rank: "3", suit: "♠", value: 0 }], [{ rank: "4", suit: "♠", value: 4 }]];
  const selectedCards = [{ rank: "4", suit: "♠", value: 4 }]; // Card from player 1's hand
  const playPile = [];

  assert(!isValidPlay(selectedCards, playPile), "Should not allow playing cards not in current player's hand");
}

function test_isValidPlay_firstTurnMustPlayLowestCard() {
  const selectedCards = [{ rank: "4", suit: "♠", value: 4 }];
  const playPile = [];
  gameState.currentTurn = 0;
  gameState.playerHands = [
    [
      { rank: "3", suit: "♦", value: 2 },
      { rank: "4", suit: "♠", value: 4 },
    ],
    [
      { rank: "A", suit: "♠", value: 48 },
      { rank: "K", suit: "♣", value: 45 },
    ],
  ];
  assert(!isValidPlay(selectedCards, playPile), "First turn must play the lowest card in the game");
}

function test_isValidPlay_fourConsecutivePairsBeatsPairOf2s() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
    { rank: "6", suit: "♠", value: 12 },
    { rank: "6", suit: "♦", value: 13 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "2", suit: "♠", value: 50 },
    { rank: "2", suit: "♦", value: 51 },
  ];
  assert(isValidPlay(selectedCards, playPile), "Four consecutive pairs should beat a pair of 2s");
}

function test_isValidPlay_fourOfAKindBeatsLowerFourOfAKind() {
  const selectedCards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "K", suit: "♠", value: 44 },
    { rank: "K", suit: "♦", value: 45 },
    { rank: "K", suit: "♣", value: 46 },
    { rank: "K", suit: "♥", value: 47 },
  ];
  assert(isValidPlay(selectedCards, playPile), "Higher four of a kind should beat lower four of a kind");
}

function test_isValidPlay_fourOfAKindBeatsSingle2() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "3", suit: "♣", value: 2 },
    { rank: "3", suit: "♥", value: 3 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "2", suit: "♠", value: 51 }];
  assert(isValidPlay(selectedCards, playPile), "Four of a kind should beat a single 2");
}

function test_isValidPlay_higherSingleBeatsLowerSingle() {
  const selectedCards = [{ rank: "A", suit: "♠", value: 48 }];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "K", suit: "♠", value: 47 }];
  assert(isValidPlay(selectedCards, playPile), "Higher single should beat lower single");
}

function test_isValidPlay_lowerConsecutivePairsDoesNotBeatHigherConsecutivePairs() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "4", suit: "♠", value: 4 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 8 },
    { rank: "5", suit: "♥", value: 9 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Lower consecutive pairs should not beat higher consecutive pairs");
}

function test_isValidPlay_lowerFourOfAKindDoesNotBeatHigherFourOfAKind() {
  const selectedCards = [
    { rank: "K", suit: "♠", value: 44 },
    { rank: "K", suit: "♦", value: 45 },
    { rank: "K", suit: "♣", value: 46 },
    { rank: "K", suit: "♥", value: 47 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
    { rank: "A", suit: "♥", value: 51 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Lower four of a kind should not beat higher four of a kind");
}

function test_isValidPlay_lowerPairDoesNotBeatHigherPair() {
  const selectedCards = [
    { rank: "K", suit: "♠", value: 46 },
    { rank: "K", suit: "♦", value: 47 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Lower pair should not beat higher pair");
}

function test_isValidPlay_lowerSingleDoesNotBeatHigherSingle() {
  const selectedCards = [{ rank: "K", suit: "♠", value: 47 }];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "A", suit: "♠", value: 48 }];
  assert(!isValidPlay(selectedCards, playPile), "Lower single should not beat higher single");
}

function test_isValidPlay_lowerStraightDoesNotBeatHigherStraight() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "4", suit: "♠", value: 4 },
    { rank: "5", suit: "♦", value: 9 },
    { rank: "6", suit: "♣", value: 14 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Lower straight should not beat higher straight");
}

function test_isValidPlay_lowerTripleDoesNotBeatHigherTriple() {
  const selectedCards = [
    { rank: "K", suit: "♠", value: 45 },
    { rank: "K", suit: "♦", value: 46 },
    { rank: "K", suit: "♣", value: 47 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  assert(!isValidPlay(selectedCards, playPile), "Lower triple should not beat higher triple");
}

function test_isValidPlay_pairBeatsLowerPair() {
  const selectedCards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "K", suit: "♠", value: 46 },
    { rank: "K", suit: "♦", value: 47 },
  ];
  assert(isValidPlay(selectedCards, playPile), "Higher pair should beat lower pair");
}

function test_isValidPlay_playMustBeSameCombinationType() {
  const selectedCards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "K", suit: "♠", value: 47 }];
  assert(!isValidPlay(selectedCards, playPile), "Play must be the same combination type");
}

function test_isValidPlay_returnsFalseForLowerRankSingle() {
  const selectedCards = [{ rank: "4", suit: "♠", value: 10 }];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "5", suit: "♠", value: 11 }];
  assert(!isValidPlay(selectedCards, playPile), "Should return false for lower rank single");
}

function test_isValidPlay_selectionOrderDoesNotMatter() {
  const selectedCards = [
    { rank: "5", suit: "♣", value: 10 },
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  assert(isValidPlay(selectedCards, playPile), "Card selection order should not matter");
}

function test_isValidPlay_straightBeatsLowerStraight() {
  const selectedCards = [
    { rank: "4", suit: "♠", value: 4 },
    { rank: "5", suit: "♦", value: 9 },
    { rank: "6", suit: "♣", value: 14 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "4", suit: "♦", value: 5 },
    { rank: "5", suit: "♣", value: 10 },
  ];
  assert(isValidPlay(selectedCards, playPile), "Higher straight should beat lower straight");
}

function test_isValidPlay_threeConsecutivePairsBeatsSingle2() {
  const selectedCards = [
    { rank: "3", suit: "♠", value: 0 },
    { rank: "3", suit: "♦", value: 1 },
    { rank: "4", suit: "♣", value: 4 },
    { rank: "4", suit: "♥", value: 5 },
    { rank: "5", suit: "♠", value: 8 },
    { rank: "5", suit: "♦", value: 9 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [{ rank: "2", suit: "♠", value: 51 }];
  assert(isValidPlay(selectedCards, playPile), "Three consecutive pairs should beat a single 2");
}

function test_isValidPlay_tripleBeatsLowerTriple() {
  const selectedCards = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "A", suit: "♦", value: 49 },
    { rank: "A", suit: "♣", value: 50 },
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [
    { rank: "K", suit: "♠", value: 45 },
    { rank: "K", suit: "♦", value: 46 },
    { rank: "K", suit: "♣", value: 47 },
  ];
  assert(isValidPlay(selectedCards, playPile), "Higher triple should beat lower triple");
}

function test_passTurn_endsRoundCorrectly() {
  gameState.numPlayers = 3;
  gameState.currentPlayer = 2; // Player 3 is passing
  gameState.lastPlayerToPlay = 1; // Player 2 was the last to play
  gameState.consecutivePasses = 1; // Player 1 already passed
  gameState.roundNumber = 1;
  gameState.playPile = [{ rank: "A", suit: "♠", value: 48 }];

  passTurn();

  assert(gameState.playPile.length === 0, "endsRoundCorrectly: Should clear the play pile");
  assert(gameState.consecutivePasses === 0, "endsRoundCorrectly: Should reset consecutive passes");
  assert(gameState.currentPlayer === 1, "endsRoundCorrectly: Should set the current player to the round winner");
  assert(gameState.roundNumber === 2, "endsRoundCorrectly: Should increment the round number");
}

function test_passTurn_firstPlayOfRound() {
  gameState.playPile = []; // Empty play pile indicates the start of a round
  const originalState = { ...gameState };

  const passSuccessful = passTurn();

  assert(!passSuccessful, "Should return false when passing on the first play of a round");
  assert(gameState.currentPlayer === originalState.currentPlayer, "Should not change current player");
  assert(gameState.consecutivePasses === originalState.consecutivePasses, "Should not change consecutive passes");
}

function test_passTurn_incrementsPassesAndSwitchesPlayer() {
  gameState.numPlayers = 3;
  gameState.currentPlayer = 0;
  gameState.consecutivePasses = 0;
  gameState.playPile = [{ rank: "3", suit: "♠", value: 0 }]; // Not the first play
  gameState.selectedCards = [{ rank: "A", suit: "♠", value: 48 }];

  const passSuccessful = passTurn();

  assert(passSuccessful, "Should return true when pass is successful");
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.consecutivePasses === 1, "Should increment consecutive passes");
}

function test_playCards_updatesGameState() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  const cardToPlay = { rank: "4", suit: "♠", value: 4 };
  gameState.playerHands = [[cardToPlay], []];
  gameState.selectedCards = [cardToPlay];
  gameState.playPile = [];
  gameState.currentTurn = 1;
  gameState.consecutivePasses = 1; // Should be reset
  gameState.gameOver = false; // Ensure game is not over initially

  playCards();

  assert(gameState.playerHands[0].length === 0, "Should remove card from player's hand");
  assert(gameState.playPile.length === 1, "Should add card to play pile");
  assert(gameState.playPile[0].value === 4, "Should add correct card to play pile");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.currentPlayer === 0, "Current player should remain the winner");
  assert(gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(gameState.lastPlayerToPlay === 0, "Should set the last player to play");
  assert(gameState.gameOver === true, "Should set gameOver to true when player wins");
}

function test_resetGame() {
  gameState.numPlayers = 3;
  gameState.playerHands = [[], [], []];
  gameState.playPile = [{ rank: "A", suit: "♠", value: 48 }];
  gameState.currentPlayer = 1;
  gameState.currentTurn = 5;
  gameState.selectedCards = [{ rank: "A", suit: "♠", value: 48 }];
  gameState.consecutivePasses = 1;
  gameState.lastPlayerToPlay = 0;
  gameState.roundNumber = 2;
  gameState.gameOver = true;

  resetGame();

  assert(Array.isArray(gameState.playerHands), "Reset playerHands should be an array");
  assert(gameState.playerHands.length === 0, "Reset playerHands should be empty");
  assert(Array.isArray(gameState.playPile), "Reset playPile should be an array");
  assert(gameState.playPile.length === 0, "Reset playPile should be empty");
  assert(gameState.currentPlayer === 0, "Reset currentPlayer should be 0");
  assert(gameState.currentTurn === 0, "Reset currentTurn should be 0");
  assert(Array.isArray(gameState.selectedCards), "Reset selectedCards should be an array");
  assert(gameState.selectedCards.length === 0, "Reset selectedCards should be empty");
  assert(gameState.consecutivePasses === 0, "Reset consecutivePasses should be 0");
  assert(gameState.lastPlayerToPlay === -1, "Reset lastPlayerToPlay should be -1");
  assert(gameState.roundNumber === 1, "Reset roundNumber should be 1");
  assert(gameState.gameOver === false, "Reset gameOver should be false");
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
  test_isConsecutivePairs_returnsFalseForInvalidPairs,
  test_isConsecutivePairs_returnsFalseForNotConsecutivePairs,
  test_isConsecutivePairs_returnsTrueForConsecutivePairs,
  test_isFourOfAKind_returnsFalseForNotFourOfAKind,
  test_isFourOfAKind_returnsTrueForFourOfAKind,
  test_isPair_returnsFalseForNotPair,
  test_isPair_returnsTrueForPair,
  test_isSingle_returnsFalseForNotSingle,
  test_isSingle_returnsTrueForSingle,
  test_isStraight_returnsFalseForNotAStraight,
  test_isStraight_returnsFalseForNotStraight,
  test_isStraight_returnsFalseForStraightWith2,
  test_isStraight_returnsTrueForStraight,
  test_isTriple_returnsFalseForNotTriple,
  test_isTriple_returnsTrueForTriple,
  test_isValidPlay_allowsSingleCardOnEmptyPile,
  test_isValidPlay_cannotStartRoundWithConsecutivePairs,
  test_isValidPlay_consecutivePairsCannotBeatLowerConsecutivePairs,
  test_isValidPlay_disallowsPlayingCardsNotInOwnHand,
  test_isValidPlay_firstTurnMustPlayLowestCard,
  test_isValidPlay_fourConsecutivePairsBeatsPairOf2s,
  test_isValidPlay_fourOfAKindBeatsLowerFourOfAKind,
  test_isValidPlay_fourOfAKindBeatsSingle2,
  test_isValidPlay_higherSingleBeatsLowerSingle,
  test_isValidPlay_lowerConsecutivePairsDoesNotBeatHigherConsecutivePairs,
  test_isValidPlay_lowerFourOfAKindDoesNotBeatHigherFourOfAKind,
  test_isValidPlay_lowerPairDoesNotBeatHigherPair,
  test_isValidPlay_lowerSingleDoesNotBeatHigherSingle,
  test_isValidPlay_lowerStraightDoesNotBeatHigherStraight,
  test_isValidPlay_lowerTripleDoesNotBeatHigherTriple,
  test_isValidPlay_pairBeatsLowerPair,
  test_isValidPlay_playMustBeSameCombinationType,
  test_isValidPlay_returnsFalseForLowerRankSingle,
  test_isValidPlay_selectionOrderDoesNotMatter,
  test_isValidPlay_straightBeatsLowerStraight,
  test_isValidPlay_threeConsecutivePairsBeatsSingle2,
  test_isValidPlay_tripleBeatsLowerTriple,
  test_passTurn_endsRoundCorrectly,
  test_passTurn_firstPlayOfRound,
  test_passTurn_incrementsPassesAndSwitchesPlayer,
  test_playCards_updatesGameState,
  test_resetGame,
  test_sortHand_sortsHandByValue,
  test_switchToNextPlayer_switchesPlayer,
];
