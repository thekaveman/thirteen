import { RANKS } from "./constants.js";

export const gameState = {
  numPlayers: 2,
  playerHands: [],
  playPile: [],
  currentPlayer: 0,
  currentTurn: 0,
  selectedCards: [],
};

/**
 * Checks if all cards in a combination have the same rank.
 * @param {Array<object>} cards The cards to check.
 * @returns {boolean} True if all cards have the same rank.
 */
export function allCardsHaveSameRank(cards) {
  if (cards.length === 0) {
    return true;
  }
  const firstRank = cards[0].rank;
  return cards.every((card) => card.rank === firstRank);
}

/**
 * Finds the lowest card in the entire game.
 * @param {Array<Array<object>>} hands An array of player hands.
 * @returns {object} The lowest card object.
 */
export function findLowestCardInGame(hands) {
  let lowestCard = null;
  let lowestCardValue = Infinity;

  hands.forEach((hand) => {
    hand.forEach((card) => {
      if (card.value < lowestCardValue) {
        lowestCardValue = card.value;
        lowestCard = card;
      }
    });
  });

  return lowestCard;
}

/**
 * Finds the player who should start the game based on the lowest card.
 * @param {Array<Array<object>>} hands An array of player hands.
 * @returns {number} The index of the player who should start.
 */
export function findStartingPlayer(hands) {
  let startingPlayer = 0;
  let lowestCardValue = hands[0][0].value;

  for (let i = 1; i < hands.length; i++) {
    if (hands[i][0].value < lowestCardValue) {
      lowestCardValue = hands[i][0].value;
      startingPlayer = i;
    }
  }

  return startingPlayer;
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
 * Sorts a player's hand by card value.
 * @param {Array<object>} hand The hand to sort.
 */
export function sortHand(hand) {
  hand.sort((a, b) => a.value - b.value);
}

/**
 * Switches to the next player.
 */
export function switchToNextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
}
