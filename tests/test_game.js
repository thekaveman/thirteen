import { assert } from "./utils.js";
import { Card } from "../src/app/deck.js";
import { Game } from "../src/app/game.js";
import { MockDeck, MockAI, MockUI, MockPlayer } from "./mocks.js";

function testSetup() {
  const game = new Game(MockDeck, `${Game.STATE_KEY}-tests`);
  return game;
}

function test_createPlayers_createsPlayers() {
  const game = testSetup();
  game.gameState.playerTypes = ["human", "ai"];
  game.gameState.players = [{ id: "one" }, { id: "two" }];
  const players = game.createPlayers(new MockAI(game), new MockUI(game));
  assert(players.length === 2, "Should create 2 players");
  assert(players[0].type === "human", "First player should be human");
  assert(players[0].id === "one", "First player should get the correct (existing) ID");
  assert(players[1].type === "ai", "Second player should be AI");
  assert(players[1].id === "two", "Second player should get the correct (existing) ID");
}

function test_findStartingPlayer_findsPlayerWithLowestCard() {
  const game = testSetup();
  const hands = [
    [new Card("A", "♠"), new Card("K", "♣")],
    [new Card("3", "♦"), new Card("4", "♠")],
  ];
  const startingPlayer = game.findStartingPlayer(hands);
  assert(startingPlayer === 1, "Player with the lowest card should start");
}

function test_gameState() {
  const game = testSetup();
  assert(game.gameState.numPlayers === 0, "Initial numPlayers should be 0");
  assert(Array.isArray(game.gameState.playerHands), "Initial playerHands should be an array");
  assert(game.gameState.playerHands.length === 0, "Initial playerHands should be empty");
  assert(Array.isArray(game.gameState.playPile), "Initial playPile should be an array");
  assert(game.gameState.playPile.length === 0, "Initial playPile should be empty");
  assert(game.gameState.currentPlayer === 0, "Initial currentPlayer should be 0");
  assert(game.gameState.currentTurn === 0, "Initial currentTurn should be 0");
  assert(Array.isArray(game.gameState.selectedCards), "Initial selectedCards should be an array");
  assert(game.gameState.selectedCards.length === 0, "Initial selectedCards should be empty");
  assert(game.gameState.consecutivePasses === 0, "Initial consecutivePasses should be 0");
  assert(game.gameState.lastPlayerToPlay === -1, "Initial lastPlayerToPlay should be -1");
  assert(game.gameState.roundNumber === 1, "Initial roundNumber should be 1");
  assert(Array.isArray(game.gameState.roundsWon), "Initial roundsWon should be an array");
  assert(game.gameState.roundsWon.length === 0, "Initial roundsWon should be empty");
  assert(game.gameState.gameOver === false, "Initial gameOver should be false");
}

function test_getCombinationType_returnsCorrectType() {
  const game = testSetup();
  let cards = [new Card("A", "♠")];
  assert(game.getCombinationType(cards) === "single", "Should return single");

  cards = [new Card("A", "♠"), new Card("A", "♦")];
  assert(game.getCombinationType(cards) === "pair", "Should return pair");

  cards = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")];
  assert(game.getCombinationType(cards) === "triple", "Should return triple");

  cards = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦"), new Card("A", "♥")];
  assert(game.getCombinationType(cards) === "four_of_a_kind", "Should return four_of_a_kind");

  cards = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  assert(game.getCombinationType(cards) === "straight", "Should return straight");

  cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  assert(game.getCombinationType(cards) === "consecutive_pairs", "Should return consecutive_pairs");

  cards = [new Card("K", "♠"), new Card("A", "♠")];
  assert(game.getCombinationType(cards) === "invalid", "Should return invalid");
}

function test_isBombForPairOfTwos_returnsFalseForOtherCombinations() {
  const game = testSetup();
  const single = [new Card("A", "♠")];
  const pair = [new Card("A", "♠"), new Card("A", "♦")];
  const triple = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")];
  const straight = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  const fourOfAKind = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
  assert(!game.isBombForPairOfTwos(single), "Should return false for a single");
  assert(!game.isBombForPairOfTwos(pair), "Should return false for a pair");
  assert(!game.isBombForPairOfTwos(triple), "Should return false for a triple");
  assert(!game.isBombForPairOfTwos(straight), "Should return false for a straight");
  assert(!game.isBombForPairOfTwos(fourOfAKind), "Should return false for a four of a kind");
}

function test_isBombForPairOfTwos_returnsTrueForFourConsecutivePairs() {
  const game = testSetup();
  const cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
    new Card("6", "♠"),
    new Card("6", "♦"),
  ];
  assert(game.isBombForPairOfTwos(cards), "Should return true for four consecutive pairs");
}
function test_isBombForSingleTwo_returnsFalseForOtherCombinations() {
  const game = testSetup();
  const single = [new Card("A", "♠")];
  const pair = [new Card("A", "♠"), new Card("A", "♦")];
  const triple = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")];
  const straight = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  assert(!game.isBombForSingleTwo(single), "Should return false for a single");
  assert(!game.isBombForSingleTwo(pair), "Should return false for a pair");
  assert(!game.isBombForSingleTwo(triple), "Should return false for a triple");
  assert(!game.isBombForSingleTwo(straight), "Should return false for a straight");
}

function test_isBombForSingleTwo_returnsTrueForFourOfAKind() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
  assert(game.isBombForSingleTwo(cards), "Should return true for four of a kind");
}

function test_isBombForSingleTwo_returnsTrueForThreeConsecutivePairs() {
  const game = testSetup();
  const cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  assert(game.isBombForSingleTwo(cards), "Should return true for three consecutive pairs");
}

function test_isConsecutivePairs_returnsFalseForInvalidPairs() {
  const game = testSetup();
  const cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("5", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  assert(!game.isConsecutivePairs(cards), "Should return false for invalid pairs");
}

function test_isConsecutivePairs_returnsFalseForNotConsecutivePairs() {
  const game = testSetup();
  const cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("6", "♠"),
    new Card("6", "♦"),
  ];
  assert(!game.isConsecutivePairs(cards), "Should return false for non-consecutive pairs");
}

function test_isConsecutivePairs_returnsTrueForConsecutivePairs() {
  const game = testSetup();
  const cards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  assert(game.isConsecutivePairs(cards), "Should return true for consecutive pairs");
}

function test_isFourOfAKind_returnsFalseForNotFourOfAKind() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠"), new Card("J", "♠")];
  assert(!game.isFourOfAKind(cards), "Should return false for four different cards");
}

function test_isFourOfAKind_returnsTrueForFourOfAKind() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
  assert(game.isFourOfAKind(cards), "Should return true for a four of a kind");
}

function test_isPair_returnsFalseForNotPair() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("K", "♠")];
  assert(!game.isPair(cards), "Should return false for two different cards");
}

function test_isPair_returnsTrueForPair() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("A", "♦")];
  assert(game.isPair(cards), "Should return true for a pair");
}

function test_isSingle_returnsFalseForNotSingle() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("K", "♠")];
  assert(!game.isSingle(cards), "Should return false for more than one card");
}

function test_isSingle_returnsTrueForSingle() {
  const game = testSetup();
  const cards = [new Card("A", "♠")];
  assert(game.isSingle(cards), "Should return true for a single card");
}

function test_isStraight_returnsFalseForNotStraight() {
  const game = testSetup();
  const cards = [new Card("3", "♠"), new Card("5", "♦"), new Card("6", "♣")];
  assert(!game.isStraight(cards), "Should return false for a non-straight");
}

function test_isStraight_returnsFalseForNotAStraight() {
  const game = testSetup();
  const cards = [new Card("3", "♠"), new Card("4", "♦"), new Card("6", "♣")];
  assert(!game.isStraight(cards), "Should return false for a non-straight");
}

function test_isStraight_returnsFalseForStraightWith2() {
  const game = testSetup();
  const cards = [new Card("K", "♠"), new Card("A", "♦"), new Card("2", "♣")];
  assert(!game.isStraight(cards), "Should return false for a straight with a 2");
}

function test_isStraight_returnsTrueForStraight() {
  const game = testSetup();
  const cards = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  assert(game.isStraight(cards), "Should return true for a straight");
}

function test_isTriple_returnsFalseForNotTriple() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("K", "♠"), new Card("Q", "♠")];
  assert(!game.isTriple(cards), "Should return false for three different cards");
}

function test_isTriple_returnsTrueForTriple() {
  const game = testSetup();
  const cards = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣")];
  assert(game.isTriple(cards), "Should return true for a triple");
}

function test_isValidPlay_allowsSingleCardOnEmptyPile() {
  const game = testSetup();
  const selectedCards = [new Card("6", "♠")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [];
  const currentTurn = 1; // Not the first turn
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Should allow playing a single card on an empty pile"
  );
}

function test_isValidPlay_bombCannotBePlayedOnNonTwo() {
  const game = testSetup();
  const bomb = [new Card("3", "♠"), new Card("3", "♦"), new Card("3", "♣"), new Card("3", "♥")];
  const currentPlayer = 0;
  const playerHands = [bomb];
  const playPile = [new Card("K", "♠")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(bomb, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Bomb should not be playable on a non-two card"
  );
}

function test_isValidPlay_cannotStartRoundWithConsecutivePairs() {
  const game = testSetup();
  const selectedCards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Should not be able to start a round with consecutive pairs"
  );
}

function test_isValidPlay_consecutivePairsCannotBeatLowerConsecutivePairs() {
  const game = testSetup();
  const selectedCards = [new Card("4", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("5", "♥")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Consecutive pairs should not beat lower consecutive pairs"
  );
}

function test_isValidPlay_disallowsPlayingCardsNotInOwnHand() {
  const game = testSetup();
  const currentPlayer = 0;
  const playerHands = [[new Card("3", "♠")], [new Card("4", "♠")]];
  const selectedCards = [new Card("4", "♠")]; // Card from player 1's hand
  const playPile = [];
  const currentTurn = 0;

  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Should not allow playing cards not in current player's hand"
  );
}

function test_isValidPlay_firstTurnMustPlayLowestCard() {
  const game = testSetup();
  const selectedCards = [new Card("4", "♠")];
  const playPile = [];
  const currentTurn = 0;
  const playerHands = [
    [new Card("3", "♦"), new Card("4", "♠")],
    [new Card("A", "♠"), new Card("K", "♣")],
  ];
  const currentPlayer = 0;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "First turn must play the lowest card in the game"
  );
}

function test_isValidPlay_fourConsecutivePairsBeatsPairOf2s() {
  const game = testSetup();
  const selectedCards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
    new Card("6", "♠"),
    new Card("6", "♦"),
  ];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("2", "♠"), new Card("2", "♦")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Four consecutive pairs should beat a pair of 2s"
  );
}

function test_isValidPlay_fourConsecutivePairsCannotBombSingleTwo() {
  const game = testSetup();
  const bomb = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
    new Card("6", "♠"),
    new Card("6", "♦"),
  ];
  const currentPlayer = 0;
  const playerHands = [bomb];
  const playPile = [new Card("2", "♠")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(bomb, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Four consecutive pairs should not be a valid bomb for a single two"
  );
}

function test_isValidPlay_fourOfAKindBeatsSingle2() {
  const game = testSetup();
  const selectedCards = [new Card("3", "♠"), new Card("3", "♦"), new Card("3", "♣"), new Card("3", "♥")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("2", "♠")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Four of a kind should beat a single 2"
  );
}

function test_isValidPlay_fourOfAKindCannotBombPairOfTwos() {
  const game = testSetup();
  const bomb = [new Card("3", "♠"), new Card("3", "♦"), new Card("3", "♣"), new Card("3", "♥")];
  const currentPlayer = 0;
  const playerHands = [bomb];
  const playPile = [new Card("2", "♠"), new Card("2", "♦")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(bomb, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Four of a kind should not be a valid bomb for a pair of twos"
  );
}

function test_isValidPlay_fourOfAKindOnlyValidAsBomb() {
  const game = testSetup();
  const fourOfAKind = [new Card("4", "♠"), new Card("4", "♣"), new Card("4", "♦"), new Card("4", "♥")];
  const currentPlayer = 0;
  const playerHands = [fourOfAKind];
  const currentTurn = 1;

  const playPileSingle = [new Card("K", "♠")]; // A single card, not a 2
  assert(
    !game.isValidPlay(fourOfAKind, playPileSingle, playerHands[currentPlayer], currentTurn, playerHands),
    "Four of a kind should only be valid as a bomb against a 2"
  );

  const playPileFourOfAKind = [new Card("3", "♠"), new Card("3", "♣"), new Card("3", "♦"), new Card("3", "♥")];
  assert(
    !game.isValidPlay(fourOfAKind, playPileFourOfAKind, playerHands[currentPlayer], currentTurn, playerHands),
    "Four of a kind should only be valid as a bomb against a 2"
  );
}

function test_isValidPlay_higherSingleBeatsLowerSingle() {
  const game = testSetup();
  const selectedCards = [new Card("A", "♠")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("K", "♠")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Higher single should beat lower single"
  );
}

function test_isValidPlay_lowerConsecutivePairsDoesNotBeatHigherConsecutivePairs() {
  const game = testSetup();
  const selectedCards = [new Card("3", "♠"), new Card("3", "♦"), new Card("4", "♣"), new Card("4", "♥")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("4", "♠"), new Card("4", "♦"), new Card("5", "♣"), new Card("5", "♥")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower consecutive pairs should not beat higher consecutive pairs"
  );
}

function test_isValidPlay_lowerFourOfAKindDoesNotBeatHigherFourOfAKind() {
  const game = testSetup();
  const selectedCards = [new Card("K", "♠"), new Card("K", "♦"), new Card("K", "♣"), new Card("K", "♥")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣"), new Card("A", "♥")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower four of a kind should not beat higher four of a kind"
  );
}

function test_isValidPlay_lowerPairDoesNotBeatHigherPair() {
  const game = testSetup();
  const selectedCards = [new Card("K", "♠"), new Card("K", "♦")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("A", "♠"), new Card("A", "♦")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower pair should not beat higher pair"
  );
}

function test_isValidPlay_lowerSingleDoesNotBeatHigherSingle() {
  const game = testSetup();
  const selectedCards = [new Card("K", "♠")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("A", "♠")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower single should not beat higher single"
  );
}

function test_isValidPlay_lowerStraightDoesNotBeatHigherStraight() {
  const game = testSetup();
  const selectedCards = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower straight should not beat higher straight"
  );
}

function test_isValidPlay_lowerTripleDoesNotBeatHigherTriple() {
  const game = testSetup();
  const selectedCards = [new Card("K", "♠"), new Card("K", "♦"), new Card("K", "♣")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Lower triple should not beat higher triple"
  );
}

function test_isValidPlay_orderMatters() {
  const game = testSetup();
  const selectedCards = [new Card("5", "♣"), new Card("3", "♠"), new Card("4", "♦")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Assumes cards are ordered ascending by value"
  );
}

function test_isValidPlay_pairBeatsLowerPair() {
  const game = testSetup();
  const selectedCards = [new Card("A", "♠"), new Card("A", "♦")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("K", "♠"), new Card("K", "♦")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Higher pair should beat lower pair"
  );
}

function test_isValidPlay_playMustBeSameCombinationType() {
  const game = testSetup();
  const selectedCards = [new Card("A", "♠"), new Card("A", "♦")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("K", "♠")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Play must be the same combination type"
  );
}

function test_isValidPlay_returnsFalseForLowerRankSingle() {
  const game = testSetup();
  const selectedCards = [new Card("4", "♠")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("5", "♠")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Should return false for lower rank single"
  );
}

function test_isValidPlay_straightBeatsLowerStraight() {
  const game = testSetup();
  const selectedCards = [new Card("4", "♠"), new Card("5", "♦"), new Card("6", "♣")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♣")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Higher straight should beat lower straight"
  );
}

function test_isValidPlay_threeConsecutivePairsBeatsSingle2() {
  const game = testSetup();
  const selectedCards = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("2", "♠")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Three consecutive pairs should beat a single 2"
  );
}

function test_isValidPlay_threeConsecutivePairsCannotBombPairOfTwos() {
  const game = testSetup();
  const bomb = [
    new Card("3", "♠"),
    new Card("3", "♦"),
    new Card("4", "♣"),
    new Card("4", "♥"),
    new Card("5", "♠"),
    new Card("5", "♦"),
  ];
  const currentPlayer = 0;
  const playerHands = [bomb];
  const playPile = [new Card("2", "♠"), new Card("2", "♦")];
  const currentTurn = 1;
  assert(
    !game.isValidPlay(bomb, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Three consecutive pairs should not be a valid bomb for a pair of twos"
  );
}

function test_isValidPlay_tripleBeatsLowerTriple() {
  const game = testSetup();
  const selectedCards = [new Card("A", "♠"), new Card("A", "♦"), new Card("A", "♣")];
  const currentPlayer = 0;
  const playerHands = [selectedCards];
  const playPile = [new Card("K", "♠"), new Card("K", "♦"), new Card("K", "♣")];
  const currentTurn = 1;
  assert(
    game.isValidPlay(selectedCards, playPile, playerHands[currentPlayer], currentTurn, playerHands),
    "Higher triple should beat lower triple"
  );
}

function test_load_noSavedGame() {
  const game = testSetup();
  const loaded = game.load(new MockAI(game), new MockUI(game));
  assert(!loaded, "Should not load game if no saved game exists");
}

function test_nextPlayer_switchesPlayer() {
  const game = testSetup();
  game.gameState.currentPlayer = 0;
  game.gameState.numPlayers = 2;
  game.nextPlayer();
  assert(game.gameState.currentPlayer === 1, "Should switch to the next player");
  game.nextPlayer();
  assert(game.gameState.currentPlayer === 0, "Should switch back to the first player");
  game.nextPlayer();
  assert(game.gameState.currentPlayer === 1, "Should switch to the next player");
}

function test_passTurn_endsRoundCorrectly() {
  const game = testSetup();
  game.gameState.numPlayers = 3;
  game.gameState.currentPlayer = 2; // Player 3 is passing
  game.gameState.lastPlayerToPlay = 1; // Player 2 was the last to play
  game.gameState.consecutivePasses = 1; // Player 1 already passed
  game.gameState.roundNumber = 1;
  game.gameState.roundsWon = [0, 0, 0];
  game.gameState.playPile = [new Card("A", "♠")];

  game.passTurn();

  assert(game.gameState.playPile.length === 0, "endsRoundCorrectly: Should clear the play pile");
  assert(game.gameState.consecutivePasses === 0, "endsRoundCorrectly: Should reset consecutive passes");
  assert(game.gameState.currentPlayer === 1, "endsRoundCorrectly: Should set the current player to the round winner");
  assert(game.gameState.roundNumber === 2, "endsRoundCorrectly: Should increment the round number");
  assert(game.gameState.roundsWon[1] === 1, "endsRoundCorrectly: Should increment the rounds won for the winner");
}

function test_passTurn_firstPlayOfRound() {
  const game = testSetup();
  game.gameState.playPile = []; // Empty play pile indicates the start of a round
  const originalState = { ...game.gameState };

  const passSuccessful = game.passTurn();

  assert(!passSuccessful, "Should return false when passing on the first play of a round");
  assert(game.gameState.currentPlayer === originalState.currentPlayer, "Should not change current player");
  assert(game.gameState.consecutivePasses === originalState.consecutivePasses, "Should not change consecutive passes");
}

function test_passTurn_incrementsPassesAndSwitchesPlayer() {
  const game = testSetup();
  game.gameState.numPlayers = 3;
  game.gameState.currentPlayer = 0;
  game.gameState.consecutivePasses = 0;
  game.gameState.playPile = [new Card("3", "♠")]; // Not the first play
  game.gameState.selectedCards = [new Card("A", "♠")];

  const passSuccessful = game.passTurn();

  assert(passSuccessful, "Should return true when pass is successful");
  assert(game.gameState.currentPlayer === 1, "Should switch to the next player");
  assert(game.gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(game.gameState.consecutivePasses === 1, "Should increment consecutive passes");
}

function test_playCards_updatesGameState() {
  const game = testSetup();
  game.gameState.currentPlayer = 0;
  game.gameState.numPlayers = 2;
  const cardToPlay = new Card("4", "♠");
  game.gameState.playerHands = [[cardToPlay, new Card("5", "♠")], []];
  game.gameState.selectedCards = [cardToPlay];
  game.gameState.playPile = [];
  game.gameState.currentTurn = 1;
  game.gameState.consecutivePasses = 1;

  game.playCards();

  assert(game.gameState.playerHands[0].length === 1, "Should remove card from player's hand");
  assert(game.gameState.playPile.length === 1, "Should add card to play pile");
  assert(game.gameState.playPile[0].value === 4, "Should add correct card to play pile");
  assert(game.gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(game.gameState.currentPlayer === 1, "Should switch to next player");
  assert(game.gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(game.gameState.lastPlayerToPlay === 0, "Should set the last player to play");
  assert(game.gameState.gameOver === false, "Should not set gameOver to true when player does not win");
}

function test_playCards_updatesGamesWon() {
  const game = testSetup();
  game.gameState.currentPlayer = 0;
  game.gameState.numPlayers = 2;
  const cardToPlay = new Card("4", "♠");
  game.gameState.playerHands = [[cardToPlay], []];
  game.gameState.selectedCards = [cardToPlay];
  game.gameState.gamesWon = [0, 0];

  game.playCards();

  assert(game.gameState.gamesWon[0] === 1, "Should increment games won for the winner");
}

function test_reset_resetsGame() {
  const game = testSetup();
  game.gameState.numPlayers = 2;
  game.gameState.playerHands = [[], [new Card("A", "♠")]];
  game.gameState.playPile = [new Card("7", "♠")];
  game.gameState.currentPlayer = 1;
  game.gameState.currentTurn = 5;
  game.gameState.selectedCards = [new Card("A", "♠")];
  game.gameState.consecutivePasses = 1;
  game.gameState.lastPlayerToPlay = 0;
  game.gameState.roundNumber = 2;
  game.gameState.roundsWon = [1, 0];
  const gamesWon = [1, 1];
  game.gameState.gamesWon = gamesWon;
  game.gameState.gameStarted = true;
  game.gameState.gameOver = true;

  game.reset();

  assert(Array.isArray(game.gameState.playerHands), "Reset playerHands should be an array");
  assert(game.gameState.playerHands.length === game.gameState.numPlayers, "Reset playerHands should be dealt");
  assert(Array.isArray(game.gameState.playPile), "Reset playPile should be an array");
  assert(game.gameState.playPile.length === 0, "Reset playPile should be empty");
  assert(game.gameState.currentPlayer === 0, "Reset currentPlayer should be 0");
  assert(game.gameState.currentTurn === 0, "Reset currentTurn should be 0");
  assert(Array.isArray(game.gameState.selectedCards), "Reset selectedCards should be an array");
  assert(game.gameState.selectedCards.length === 0, "Reset selectedCards should be empty");
  assert(game.gameState.consecutivePasses === 0, "Reset consecutivePasses should be 0");
  assert(game.gameState.lastPlayerToPlay === -1, "Reset lastPlayerToPlay should be -1");
  assert(game.gameState.roundNumber === 1, "Reset roundNumber should be 1");
  assert(Array.isArray(game.gameState.roundsWon), "Reset roundsWon should be an array");
  assert(game.gameState.roundsWon.length === 2, "Reset roundsWon should have the correct length");
  assert(
    game.gameState.roundsWon.every((r) => r === 0),
    "Reset roundsWon should all be 0"
  );
  assert(
    game.gameState.gamesWon.every((value, index) => value === gamesWon[index]),
    "Reset should not overwrite gamesWon"
  );
  assert(game.gameState.gameStarted === false, "Reset gameStarted should be false");
  assert(game.gameState.gameOver === false, "Reset gameOver should be false");
}

function test_save_savesGameState() {
  const game = testSetup();
  game.save();
  const savedGame = localStorage.getItem(game.stateKey);
  assert(savedGame, "Should save game to localStorage");
  const parsedGame = JSON.parse(savedGame);
  assert(parsedGame.id === game.id, "Should save the correct game id");
  assert(parsedGame.stateKey === game.stateKey, "Should save the correct state key");
}

function test_setPlayers_initializesPlayersAndHands() {
  const game = testSetup();
  const players = [{ type: "human" }, { type: "ai" }];
  game.setPlayers(players);

  assert(game.gameState.numPlayers === players.length, "numPlayers should be initialized with the correct length");
  assert(game.gameState.players.length === players.length, "players should be initialized with the correct length");
  assert(game.gameState.playerHands.length === players.length, "playerHands should be initialized with the correct length");
  assert(game.gameState.roundsWon.length === players.length, "roundsWon should be initialized with the correct length");
  assert(
    game.gameState.roundsWon.every((count) => count === 0),
    "roundsWon should be filled with zeros"
  );
  assert(game.gameState.gamesWon.length === players.length, "gamesWon should be initialized with the correct length");

  const gamesWon = [2, 1];
  game.gameState.gamesWon = gamesWon;
  game.setPlayers(players);

  assert(
    game.gameState.gamesWon.every((value, index) => value === gamesWon[index]),
    "gamesWon should not be overwritten by setPlayers"
  );
}

function test_start_initializesGameState() {
  const game = testSetup();
  const players = [new MockPlayer("Human 1", [], true), new MockPlayer("AI 1", [], false)];
  game.setPlayers(players);
  game.start();

  assert(game.gameState.gameStarted, "gameStarted should be true");
  assert(game.gameState.currentPlayer === 0 || game.gameState.currentPlayer === 1, "currentPlayer should be initialized");
  assert(
    game.gameState.lastPlayerToPlay === game.gameState.currentPlayer,
    "lastPlayerToPlay should be initialized to the current player"
  );
}

function test_win_updatesGameState() {
  const game = testSetup();
  game.gameState.numPlayers = 2;
  game.gameState.currentPlayer = 0;
  game.gameState.gamesWon = [0, 0];
  game.gameState.roundsWon = [0, 0];
  game.gameState.playPile = [new Card("A", "♠")];
  game.gameState.gameStarted = true;

  game.win();

  assert(game.gameState.gameOver, "gameOver should be true after a win");
  assert(!game.gameState.gameStarted, "gameStarted should be false after a win");
  assert(game.gameState.gamesWon[0] === 1, "Winner's gamesWon should be incremented");
  assert(game.gameState.roundsWon[0] === 1, "Winner's roundsWon should be incremented");
  assert(game.gameState.playPile.length === 0, "Play pile should be cleared after a win");
}

export const gameTests = [
  test_createPlayers_createsPlayers,
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
  test_isValidPlay_bombCannotBePlayedOnNonTwo,
  test_isValidPlay_cannotStartRoundWithConsecutivePairs,
  test_isValidPlay_consecutivePairsCannotBeatLowerConsecutivePairs,
  test_isValidPlay_disallowsPlayingCardsNotInOwnHand,
  test_isValidPlay_firstTurnMustPlayLowestCard,
  test_isValidPlay_fourConsecutivePairsBeatsPairOf2s,
  test_isValidPlay_fourConsecutivePairsCannotBombSingleTwo,
  test_isValidPlay_fourOfAKindBeatsSingle2,
  test_isValidPlay_fourOfAKindCannotBombPairOfTwos,
  test_isValidPlay_fourOfAKindOnlyValidAsBomb,
  test_isValidPlay_higherSingleBeatsLowerSingle,
  test_isValidPlay_lowerConsecutivePairsDoesNotBeatHigherConsecutivePairs,
  test_isValidPlay_lowerFourOfAKindDoesNotBeatHigherFourOfAKind,
  test_isValidPlay_lowerPairDoesNotBeatHigherPair,
  test_isValidPlay_lowerSingleDoesNotBeatHigherSingle,
  test_isValidPlay_lowerStraightDoesNotBeatHigherStraight,
  test_isValidPlay_lowerTripleDoesNotBeatHigherTriple,
  test_isValidPlay_orderMatters,
  test_isValidPlay_pairBeatsLowerPair,
  test_isValidPlay_playMustBeSameCombinationType,
  test_isValidPlay_returnsFalseForLowerRankSingle,
  test_isValidPlay_straightBeatsLowerStraight,
  test_isValidPlay_threeConsecutivePairsBeatsSingle2,
  test_isValidPlay_threeConsecutivePairsCannotBombPairOfTwos,
  test_isValidPlay_tripleBeatsLowerTriple,
  test_load_noSavedGame,
  test_nextPlayer_switchesPlayer,
  test_passTurn_endsRoundCorrectly,
  test_passTurn_firstPlayOfRound,
  test_passTurn_incrementsPassesAndSwitchesPlayer,
  test_playCards_updatesGameState,
  test_playCards_updatesGamesWon,
  test_reset_resetsGame,
  test_save_savesGameState,
  test_setPlayers_initializesPlayersAndHands,
  test_start_initializesGameState,
  test_win_updatesGameState,
];
