import { assert } from "./utils.js";
import { createCard } from "../src/deck.js";
import {
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
  switchToNextPlayer,
} from "../src/game.js";

function test_findStartingPlayer_findsPlayerWithLowestCard() {
  const hands = [
    [createCard("A", "♠"), createCard("K", "♣")],
    [createCard("3", "♦"), createCard("4", "♠")],
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
  assert(Array.isArray(gameState.roundsWon), "Initial roundsWon should be an array");
  assert(gameState.roundsWon.length === 0, "Initial roundsWon should be empty");
  assert(gameState.gameOver === false, "Initial gameOver should be false");
}

function test_getCombinationType_returnsCorrectType() {
  let cards = [createCard("A", "♠")];
  assert(getCombinationType(cards) === "single", "Should return single");

  cards = [createCard("A", "♠"), createCard("A", "♦")];
  assert(getCombinationType(cards) === "pair", "Should return pair");

  cards = [createCard("A", "♠"), createCard("A", "♣"), createCard("A", "♦")];
  assert(getCombinationType(cards) === "triple", "Should return triple");

  cards = [createCard("A", "♠"), createCard("A", "♣"), createCard("A", "♦"), createCard("A", "♥")];
  assert(getCombinationType(cards) === "four_of_a_kind", "Should return four_of_a_kind");

  cards = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  assert(getCombinationType(cards) === "straight", "Should return straight");

  cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  assert(getCombinationType(cards) === "consecutive_pairs", "Should return consecutive_pairs");

  cards = [createCard("K", "♠"), createCard("A", "♠")];
  assert(getCombinationType(cards) === "invalid", "Should return invalid");
}

function test_isBombForPairOfTwos_returnsFalseForOtherCombinations() {
  const single = [createCard("A", "♠")];
  const pair = [createCard("A", "♠"), createCard("A", "♦")];
  const triple = [createCard("A", "♠"), createCard("A", "♣"), createCard("A", "♦")];
  const straight = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  const fourOfAKind = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣"), createCard("A", "♥")];
  assert(!isBombForPairOfTwos(single), "Should return false for a single");
  assert(!isBombForPairOfTwos(pair), "Should return false for a pair");
  assert(!isBombForPairOfTwos(triple), "Should return false for a triple");
  assert(!isBombForPairOfTwos(straight), "Should return false for a straight");
  assert(!isBombForPairOfTwos(fourOfAKind), "Should return false for a four of a kind");
}

function test_isBombForPairOfTwos_returnsTrueForFourConsecutivePairs() {
  const cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
    createCard("6", "♠"),
    createCard("6", "♦"),
  ];
  assert(isBombForPairOfTwos(cards), "Should return true for four consecutive pairs");
}
function test_isBombForSingleTwo_returnsFalseForOtherCombinations() {
  const single = [createCard("A", "♠")];
  const pair = [createCard("A", "♠"), createCard("A", "♦")];
  const triple = [createCard("A", "♠"), createCard("A", "♣"), createCard("A", "♦")];
  const straight = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  assert(!isBombForSingleTwo(single), "Should return false for a single");
  assert(!isBombForSingleTwo(pair), "Should return false for a pair");
  assert(!isBombForSingleTwo(triple), "Should return false for a triple");
  assert(!isBombForSingleTwo(straight), "Should return false for a straight");
}

function test_isBombForSingleTwo_returnsTrueForFourOfAKind() {
  const cards = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣"), createCard("A", "♥")];
  assert(isBombForSingleTwo(cards), "Should return true for four of a kind");
}

function test_isBombForSingleTwo_returnsTrueForThreeConsecutivePairs() {
  const cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  assert(isBombForSingleTwo(cards), "Should return true for three consecutive pairs");
}

function test_isConsecutivePairs_returnsFalseForInvalidPairs() {
  const cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("5", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  assert(!isConsecutivePairs(cards), "Should return false for invalid pairs");
}

function test_isConsecutivePairs_returnsFalseForNotConsecutivePairs() {
  const cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("6", "♠"),
    createCard("6", "♦"),
  ];
  assert(!isConsecutivePairs(cards), "Should return false for non-consecutive pairs");
}

function test_isConsecutivePairs_returnsTrueForConsecutivePairs() {
  const cards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  assert(isConsecutivePairs(cards), "Should return true for consecutive pairs");
}

function test_isFourOfAKind_returnsFalseForNotFourOfAKind() {
  const cards = [createCard("A", "♠"), createCard("K", "♠"), createCard("Q", "♠"), createCard("J", "♠")];
  assert(!isFourOfAKind(cards), "Should return false for four different cards");
}

function test_isFourOfAKind_returnsTrueForFourOfAKind() {
  const cards = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣"), createCard("A", "♥")];
  assert(isFourOfAKind(cards), "Should return true for a four of a kind");
}

function test_isPair_returnsFalseForNotPair() {
  const cards = [createCard("A", "♠"), createCard("K", "♠")];
  assert(!isPair(cards), "Should return false for two different cards");
}

function test_isPair_returnsTrueForPair() {
  const cards = [createCard("A", "♠"), createCard("A", "♦")];
  assert(isPair(cards), "Should return true for a pair");
}

function test_isSingle_returnsFalseForNotSingle() {
  const cards = [createCard("A", "♠"), createCard("K", "♠")];
  assert(!isSingle(cards), "Should return false for more than one card");
}

function test_isSingle_returnsTrueForSingle() {
  const cards = [createCard("A", "♠")];
  assert(isSingle(cards), "Should return true for a single card");
}

function test_isStraight_returnsFalseForNotStraight() {
  const cards = [createCard("3", "♠"), createCard("5", "♦"), createCard("6", "♣")];
  assert(!isStraight(cards), "Should return false for a non-straight");
}

function test_isStraight_returnsFalseForNotAStraight() {
  const cards = [createCard("3", "♠"), createCard("4", "♦"), createCard("6", "♣")];
  assert(!isStraight(cards), "Should return false for a non-straight");
}

function test_isStraight_returnsFalseForStraightWith2() {
  const cards = [createCard("K", "♠"), createCard("A", "♦"), createCard("2", "♣")];
  assert(!isStraight(cards), "Should return false for a straight with a 2");
}

function test_isStraight_returnsTrueForStraight() {
  const cards = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  assert(isStraight(cards), "Should return true for a straight");
}

function test_isTriple_returnsFalseForNotTriple() {
  const cards = [createCard("A", "♠"), createCard("K", "♠"), createCard("Q", "♠")];
  assert(!isTriple(cards), "Should return false for three different cards");
}

function test_isTriple_returnsTrueForTriple() {
  const cards = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣")];
  assert(isTriple(cards), "Should return true for a triple");
}

function test_isValidPlay_allowsSingleCardOnEmptyPile() {
  const selectedCards = [createCard("6", "♠")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  gameState.currentTurn = 1; // Not the first turn
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Should allow playing a single card on an empty pile"
  );
}

function test_isValidPlay_cannotStartRoundWithConsecutivePairs() {
  const selectedCards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  gameState.currentTurn = 1;
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Should not be able to start a round with consecutive pairs"
  );
}

function test_isValidPlay_consecutivePairsCannotBeatLowerConsecutivePairs() {
  const selectedCards = [createCard("4", "♠"), createCard("4", "♦"), createCard("5", "♣"), createCard("5", "♥")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("3", "♠"), createCard("3", "♦"), createCard("4", "♣"), createCard("4", "♥")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Consecutive pairs should not beat lower consecutive pairs"
  );
}

function test_isValidPlay_disallowsPlayingCardsNotInOwnHand() {
  gameState.currentPlayer = 0;
  gameState.playerHands = [[createCard("3", "♠")], [createCard("4", "♠")]];
  const selectedCards = [createCard("4", "♠")]; // Card from player 1's hand
  const playPile = [];

  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Should not allow playing cards not in current player's hand"
  );
}

function test_isValidPlay_firstTurnMustPlayLowestCard() {
  const selectedCards = [createCard("4", "♠")];
  const playPile = [];
  gameState.currentTurn = 0;
  gameState.playerHands = [
    [createCard("3", "♦"), createCard("4", "♠")],
    [createCard("A", "♠"), createCard("K", "♣")],
  ];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "First turn must play the lowest card in the game"
  );
}

function test_isValidPlay_fourConsecutivePairsBeatsPairOf2s() {
  const selectedCards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
    createCard("6", "♠"),
    createCard("6", "♦"),
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("2", "♠"), createCard("2", "♦")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Four consecutive pairs should beat a pair of 2s"
  );
}

function test_isValidPlay_fourOfAKindBeatsSingle2() {
  const selectedCards = [createCard("3", "♠"), createCard("3", "♦"), createCard("3", "♣"), createCard("3", "♥")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("2", "♠")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Four of a kind should beat a single 2"
  );
}

function test_isValidPlay_higherSingleBeatsLowerSingle() {
  const selectedCards = [createCard("A", "♠")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("K", "♠")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Higher single should beat lower single"
  );
}

function test_isValidPlay_lowerConsecutivePairsDoesNotBeatHigherConsecutivePairs() {
  const selectedCards = [createCard("3", "♠"), createCard("3", "♦"), createCard("4", "♣"), createCard("4", "♥")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("4", "♠"), createCard("4", "♦"), createCard("5", "♣"), createCard("5", "♥")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower consecutive pairs should not beat higher consecutive pairs"
  );
}

function test_isValidPlay_lowerFourOfAKindDoesNotBeatHigherFourOfAKind() {
  const selectedCards = [createCard("K", "♠"), createCard("K", "♦"), createCard("K", "♣"), createCard("K", "♥")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣"), createCard("A", "♥")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower four of a kind should not beat higher four of a kind"
  );
}

function test_isValidPlay_lowerPairDoesNotBeatHigherPair() {
  const selectedCards = [createCard("K", "♠"), createCard("K", "♦")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("A", "♠"), createCard("A", "♦")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower pair should not beat higher pair"
  );
}

function test_isValidPlay_lowerSingleDoesNotBeatHigherSingle() {
  const selectedCards = [createCard("K", "♠")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("A", "♠")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower single should not beat higher single"
  );
}

function test_isValidPlay_lowerStraightDoesNotBeatHigherStraight() {
  const selectedCards = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("4", "♠"), createCard("5", "♦"), createCard("6", "♣")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower straight should not beat higher straight"
  );
}

function test_isValidPlay_lowerTripleDoesNotBeatHigherTriple() {
  const selectedCards = [createCard("K", "♠"), createCard("K", "♦"), createCard("K", "♣")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Lower triple should not beat higher triple"
  );
}

function test_isValidPlay_pairBeatsLowerPair() {
  const selectedCards = [createCard("A", "♠"), createCard("A", "♦")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("K", "♠"), createCard("K", "♦")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Higher pair should beat lower pair"
  );
}

function test_isValidPlay_playMustBeSameCombinationType() {
  const selectedCards = [createCard("A", "♠"), createCard("A", "♦")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("K", "♠")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Play must be the same combination type"
  );
}

function test_isValidPlay_returnsFalseForLowerRankSingle() {
  const selectedCards = [createCard("4", "♠")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("5", "♠")];
  assert(
    !isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Should return false for lower rank single"
  );
}

function test_isValidPlay_selectionOrderDoesNotMatter() {
  const selectedCards = [createCard("5", "♣"), createCard("3", "♠"), createCard("4", "♦")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Card selection order should not matter"
  );
}

function test_isValidPlay_straightBeatsLowerStraight() {
  const selectedCards = [createCard("4", "♠"), createCard("5", "♦"), createCard("6", "♣")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("3", "♠"), createCard("4", "♦"), createCard("5", "♣")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Higher straight should beat lower straight"
  );
}

function test_isValidPlay_threeConsecutivePairsBeatsSingle2() {
  const selectedCards = [
    createCard("3", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("4", "♥"),
    createCard("5", "♠"),
    createCard("5", "♦"),
  ];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("2", "♠")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Three consecutive pairs should beat a single 2"
  );
}

function test_isValidPlay_tripleBeatsLowerTriple() {
  const selectedCards = [createCard("A", "♠"), createCard("A", "♦"), createCard("A", "♣")];
  gameState.currentPlayer = 0;
  gameState.playerHands = [selectedCards];
  const playPile = [createCard("K", "♠"), createCard("K", "♦"), createCard("K", "♣")];
  assert(
    isValidPlay(selectedCards, playPile, gameState.playerHands[gameState.currentPlayer]),
    "Higher triple should beat lower triple"
  );
}

function test_passTurn_endsRoundCorrectly() {
  gameState.numPlayers = 3;
  gameState.currentPlayer = 2; // Player 3 is passing
  gameState.lastPlayerToPlay = 1; // Player 2 was the last to play
  gameState.consecutivePasses = 1; // Player 1 already passed
  gameState.roundNumber = 1;
  gameState.roundsWon = [0, 0, 0];
  gameState.playPile = [createCard("A", "♠")];

  passTurn();

  assert(gameState.playPile.length === 0, "endsRoundCorrectly: Should clear the play pile");
  assert(gameState.consecutivePasses === 0, "endsRoundCorrectly: Should reset consecutive passes");
  assert(gameState.currentPlayer === 1, "endsRoundCorrectly: Should set the current player to the round winner");
  assert(gameState.roundNumber === 2, "endsRoundCorrectly: Should increment the round number");
  assert(gameState.roundsWon[1] === 1, "endsRoundCorrectly: Should increment the rounds won for the winner");
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
  gameState.playPile = [createCard("3", "♠")]; // Not the first play
  gameState.selectedCards = [createCard("A", "♠")];

  const passSuccessful = passTurn();

  assert(passSuccessful, "Should return true when pass is successful");
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.consecutivePasses === 1, "Should increment consecutive passes");
}

function test_playCards_updatesGameState() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  const cardToPlay = createCard("4", "♠");
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
  gameState.playPile = [createCard("A", "♠")];
  gameState.currentPlayer = 1;
  gameState.currentTurn = 5;
  gameState.selectedCards = [createCard("A", "♠")];
  gameState.consecutivePasses = 1;
  gameState.lastPlayerToPlay = 0;
  gameState.roundNumber = 2;
  gameState.roundsWon = [1, 0, 0];
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
  assert(Array.isArray(gameState.roundsWon), "Reset roundsWon should be an array");
  assert(gameState.roundsWon.length === 3, "Reset roundsWon should have the correct length");
  assert(
    gameState.roundsWon.every((r) => r === 0),
    "Reset roundsWon should all be 0"
  );
  assert(gameState.gameOver === false, "Reset gameOver should be false");
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

function test_playCards_updatesGamesWon() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  const cardToPlay = createCard("4", "♠");
  gameState.playerHands = [[cardToPlay], []];
  gameState.selectedCards = [cardToPlay];
  gameState.gamesWon = [0, 0];

  playCards();

  assert(gameState.gamesWon[0] === 1, "Should increment games won for the winner");
}

export const gameTests = [
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
  test_isValidPlay_straightBeatsLowerStraight,
  test_isValidPlay_threeConsecutivePairsBeatsSingle2,
  test_isValidPlay_tripleBeatsLowerTriple,
  test_passTurn_endsRoundCorrectly,
  test_passTurn_firstPlayOfRound,
  test_passTurn_incrementsPassesAndSwitchesPlayer,
  test_playCards_updatesGameState,
  test_playCards_updatesGamesWon,
  test_resetGame,
  test_switchToNextPlayer_switchesPlayer,
];
