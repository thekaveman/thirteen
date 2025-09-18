import { SUITS, RANKS } from "./constants.js";

/**
 * Creates a standard 52-card deck.
 * @returns {Array<object>} An array of card objects.
 */
export function createDeck() {
  const deck = [];
  SUITS.forEach((suit, suitIndex) => {
    RANKS.forEach((rank, rankIndex) => {
      deck.push({
        rank,
        suit,
        value: rankIndex * 4 + suitIndex,
      });
    });
  });
  return deck;
}

/**
 * Deals a deck of cards to a specified number of players.
 * @param {Array<object>} deck The deck to deal from.
 * @param {number} numPlayers The number of players.
 * @returns {Array<Array<object>>} An array of hands, where each hand is an array of cards.
 */
export function deal(deck, numPlayers) {
  const hands = Array.from({ length: numPlayers }, () => []);
  const cardsToDeal = Math.min(deck.length, numPlayers * 13);
  for (let i = 0; i < cardsToDeal; i++) {
    hands[i % numPlayers].push(deck[i]);
  }
  return hands;
}

/**
 * Shuffles a deck of cards in place.
 * @param {Array<object>} deck The deck to shuffle.
 */
export function shuffleDeck(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

/**
 * Sorts a hand of cards by value.
 * @param {Array<object>} hand The hand to sort.
 */
export function sortHand(hand) {
  hand.sort((a, b) => a.value - b.value);
}
