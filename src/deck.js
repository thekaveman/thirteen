import { SUITS, RANKS } from "./constants.js";

/**
 * Creates a card from a 52-card deck.
 * @param {string} rank The rank of the card (e.g., "A", "K", "3").
 * @param {string} suit The suit of the card (e.g., "♠", "♣", "♦", "♥").
 * @returns {object} A card object.
 */
export function createCard(rank, suit) {
  return {
    rank,
    suit,
    value: getCardValue(rank, suit),
  };
}

/**
 * Creates a standard 52-card deck.
 * @returns {Array<object>} An array of card objects.
 */
export function createDeck() {
  const deck = [];
  SUITS.forEach((suit, _) => {
    RANKS.forEach((rank, _) => {
      deck.push(createCard(rank, suit));
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
 * Calculates the numeric value of a card based on its rank and suit.
 * @param {string} rank The rank of the card (e.g., "A", "K", "3").
 * @param {string} suit The suit of the card (e.g., "♠", "♣", "♦", "♥").
 * @returns {number} The calculated numeric value of the card.
 */
export function getCardValue(rank, suit) {
  const rankIndex = RANKS.indexOf(rank);
  const suitIndex = SUITS.indexOf(suit);
  return rankIndex * 4 + suitIndex;
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
