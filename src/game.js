import { COMBINATION_TYPES, RANKS } from "./constants.js";
import { allCardsHaveSameRank, findLowestCardInHands } from "./deck.js";
import { log } from "./utils.js";

export const gameState = {
  numPlayers: 2,
  players: [],
  playerHands: [],
  playPile: [],
  currentPlayer: 0,
  currentTurn: 0,
  selectedCards: [],
  consecutivePasses: 0,
  lastPlayerToPlay: -1,
  roundNumber: 1,
  roundsWon: [],
  gamesWon: [],
  gameOver: false,
  playerTypes: ["human", "human"], // Default to human players
};

/**
 * Finds the player who should start the game based on the lowest card.
 * @param {Array<Array<object>>} hands An array of sorted player hands.
 * @returns {number} The index of the player who should start.
 */
export function findStartingPlayer(hands) {
  let startingPlayer = 0;
  const lowestCardValue = findLowestCardInHands(hands).value;

  for (let i = 0; i < hands.length; i++) {
    if (hands[i][0].value == lowestCardValue) {
      startingPlayer = i;
    }
  }

  return startingPlayer;
}

/**
 * Determines the combination type of a set of cards.
 * @param {Array<object>} cards The cards to check.
 * @returns {string} The combination type.
 */
export function getCombinationType(cards) {
  if (isSingle(cards)) return COMBINATION_TYPES.SINGLE;
  if (isPair(cards)) return COMBINATION_TYPES.PAIR;
  if (isTriple(cards)) return COMBINATION_TYPES.TRIPLE;
  if (isStraight(cards)) return COMBINATION_TYPES.STRAIGHT;
  if (isConsecutivePairs(cards)) return COMBINATION_TYPES.CONSECUTIVE_PAIRS;
  if (isFourOfAKind(cards)) return COMBINATION_TYPES.FOUR_OF_A_KIND;
  return COMBINATION_TYPES.INVALID;
}

/**
 * Checks if a combination of cards is a bomb that can beat a pair of 2s.
 * A bomb against a pair of 2s is four consecutive pairs.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the cards form a bomb that beats a pair of 2s.
 */
export function isBombForPairOfTwos(cards) {
  const combinationType = getCombinationType(cards);
  if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS && cards.length === 8) {
    return true;
  }
  return false;
}

/**
 * Checks if a combination of cards is a bomb that can beat a single 2.
 * A bomb against a single 2 is either a four-of-a-kind or three consecutive pairs.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the cards form a bomb that beats a single 2.
 */
export function isBombForSingleTwo(cards) {
  const combinationType = getCombinationType(cards);
  if (combinationType === COMBINATION_TYPES.FOUR_OF_A_KIND) {
    return true;
  }
  if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS && cards.length === 6) {
    return true;
  }
  return false;
}

/**
 * Checks if a combination is consecutive pairs.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is consecutive pairs.
 */
export function isConsecutivePairs(cards) {
  if (cards.length < 6 || cards.length % 2 !== 0) {
    return false;
  }
  const pairs = [];
  for (let i = 0; i < cards.length; i += 2) {
    const pair = [cards[i], cards[i + 1]];
    if (!isPair(pair)) {
      return false;
    }
    pairs.push(pair);
  }
  for (let i = 0; i < pairs.length - 1; i++) {
    const rankIndex1 = RANKS.indexOf(pairs[i][0].rank);
    const rankIndex2 = RANKS.indexOf(pairs[i + 1][0].rank);
    if (rankIndex2 !== rankIndex1 + 1) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a combination is a four-of-a-kind.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is a four-of-a-kind.
 */
export function isFourOfAKind(cards) {
  return cards.length === 4 && allCardsHaveSameRank(cards);
}

/**
 * Checks if a combination is a pair.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is a pair.
 */
export function isPair(cards) {
  return cards.length === 2 && allCardsHaveSameRank(cards);
}

/**
 * Checks if a combination is a single card.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is a single.
 */
export function isSingle(cards) {
  return cards.length === 1;
}

/**
 * Checks if a combination is a straight.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is a straight.
 */
export function isStraight(cards) {
  if (cards.length < 3) {
    return false;
  }
  if (cards.some((card) => card.rank === "2")) {
    return false;
  }
  for (let i = 0; i < cards.length - 1; i++) {
    const rankIndex1 = RANKS.indexOf(cards[i].rank);
    const rankIndex2 = RANKS.indexOf(cards[i + 1].rank);
    if (rankIndex2 !== rankIndex1 + 1) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a combination is a triple.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if the combination is a triple.
 */
export function isTriple(cards) {
  return cards.length === 3 && allCardsHaveSameRank(cards);
}

/**
 * Checks if a play is valid according to the game rules.
 * @param {Array<object>} selectedCards The cards the player has selected.
 * @param {Array<object>} playPile The cards currently in the play pile.
 * @param {Array<object>} playerHand The hand of the player making the play.
 * @returns {boolean} True if the play is valid.
 */
export function isValidPlay(selectedCards, playPile, playerHand) {
  // Check if all selected cards are in the current player's hand
  for (const selectedCard of selectedCards) {
    if (!playerHand.some((card) => card.rank === selectedCard.rank && card.suit === selectedCard.suit)) {
      return false;
    }
  }

  const playPileCombinationType = getCombinationType(playPile);
  const selectedCombinationType = getCombinationType(selectedCards);

  if (selectedCombinationType === COMBINATION_TYPES.INVALID) {
    return false;
  }

  // Bomb logic
  if (playPile.length > 0 && playPile[0].rank === "2") {
    if (playPileCombinationType === COMBINATION_TYPES.SINGLE && isBombForSingleTwo(selectedCards)) {
      return true;
    }
    if (playPileCombinationType === COMBINATION_TYPES.PAIR && isBombForPairOfTwos(selectedCards)) {
      return true;
    }
  }

  // These combinations are only valid as bombs, which are handled above.
  // Any other attempted use is invalid.
  if (
    selectedCombinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS ||
    selectedCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND
  ) {
    return false;
  }

  // Standard play validation
  if (playPile.length === 0) {
    if (gameState.currentTurn === 0) {
      const lowestCard = findLowestCardInHands(gameState.playerHands);
      return selectedCards.some((card) => card.value === lowestCard.value);
    }
    return true;
  }

  if (selectedCombinationType !== playPileCombinationType) {
    return false;
  }

  if (selectedCards.length !== playPile.length) {
    return false;
  }

  const highestSelectedCard = selectedCards.reduce((max, card) => (card.value > max.value ? card : max));
  const highestPlayPileCard = playPile.reduce((max, card) => (card.value > max.value ? card : max));

  return highestSelectedCard.value > highestPlayPileCard.value;
}

/**
 * Handles a player passing their turn.
 * @returns {boolean} True if the pass was successful, false otherwise (e.g., cannot pass on first play).
 */
export function passTurn() {
  if (gameState.playPile.length === 0) {
    log("Cannot pass on the first play of a round.");
    return false;
  }

  gameState.consecutivePasses++;
  gameState.selectedCards = []; // Clear selected cards on pass

  if (gameState.consecutivePasses >= gameState.numPlayers - 1) {
    log(`Player ${gameState.lastPlayerToPlay + 1} wins round ${gameState.roundNumber}.`);
    gameState.roundsWon[gameState.lastPlayerToPlay]++;
    gameState.playPile = [];
    gameState.consecutivePasses = 0;
    gameState.currentPlayer = gameState.lastPlayerToPlay;
    gameState.roundNumber++;
  } else {
    switchToNextPlayer();
  }

  gameState.currentTurn++;
  return true;
}

/**
 * Handles a valid play, updating the game state.
 */
export function playCards() {
  // Move selected cards to play pile
  gameState.playPile = [...gameState.selectedCards];

  // Remove selected cards from player's hand
  const currentPlayerHand = gameState.playerHands[gameState.currentPlayer];
  gameState.selectedCards.forEach((selectedCard) => {
    const cardIndex = currentPlayerHand.findIndex((card) => card.value === selectedCard.value);
    if (cardIndex > -1) {
      currentPlayerHand.splice(cardIndex, 1);
    }
  });

  // Check for win condition
  if (currentPlayerHand.length === 0) {
    log(`Player ${gameState.currentPlayer + 1} wins the game!`);
    gameState.gamesWon[gameState.currentPlayer]++;
    gameState.gameOver = true;
  }

  gameState.consecutivePasses = 0;
  gameState.lastPlayerToPlay = gameState.currentPlayer;

  // Clear selected cards
  gameState.selectedCards = [];

  // Switch to next player
  if (!gameState.gameOver) {
    switchToNextPlayer();
  }
  gameState.currentTurn++;
}

/**
 * Resets the game state to its initial values.
 */
export function resetGame() {
  gameState.playerHands = [];
  gameState.playPile = [];
  gameState.currentPlayer = 0;
  gameState.currentTurn = 0;
  gameState.selectedCards = [];
  gameState.consecutivePasses = 0;
  gameState.lastPlayerToPlay = -1;
  gameState.roundNumber = 1;
  gameState.roundsWon = new Array(gameState.numPlayers).fill(0);
  if (gameState.gamesWon.length === 0) {
    gameState.gamesWon = new Array(gameState.numPlayers).fill(0);
  }
  gameState.gameOver = false;
}

/**
 * Switches to the next player.
 */
export function switchToNextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
}
