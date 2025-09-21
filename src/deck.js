import { SUITS, RANKS } from "./constants.js";

export class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
    this.value = Card.getValue(rank, suit);
  }

  /**
   * Checks if all cards in a combination have the same rank.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if all cards have the same rank.
   */
  static allSameRank(cards) {
    if (cards.length === 0) {
      return true;
    }
    const firstRank = cards[0].rank;
    return cards.every((card) => card.rank === firstRank);
  }

  /**
   * Finds the lowest card in the list of hands.
   * @param {Array<Array<Card>>} hands An array of player hands.
   * @returns {Card} The lowest card object.
   */
  static findLowest(hands) {
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
   * Calculates the numeric value of a card based on its rank and suit.
   * @param {string} rank The rank of the card (e.g., "A", "K", "3").
   * @param {string} suit The suit of the card (e.g., "♠", "♣", "♦", "♥").
   * @returns {number} The calculated numeric value of the card.
   */
  static getValue(rank, suit) {
    const rankIndex = RANKS.indexOf(rank);
    const suitIndex = SUITS.indexOf(suit);
    return rankIndex * 4 + suitIndex;
  }

  /**
   * Sorts a hand of cards by value.
   * @param {Array<Card>} hand The hand to sort.
   */
  static sort(hand) {
    hand.sort((a, b) => a.value - b.value);
  }
}

export class Deck {
  constructor() {
    this.cards = [];
    SUITS.forEach((suit) => {
      RANKS.forEach((rank) => {
        this.cards.push(new Card(rank, suit));
      });
    });
  }

  /**
   * Shuffles the deck of cards in place.
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Deals a deck of cards to a specified number of players.
   * @param {number} numPlayers The number of players.
   * @returns {Array<Array<Card>>} An array of hands, where each hand is an array of cards.
   */
  deal(numPlayers) {
    const hands = Array.from({ length: numPlayers }, () => []);
    const cardsToDeal = Math.min(this.cards.length, numPlayers * 13);
    for (let i = 0; i < cardsToDeal; i++) {
      hands[i % numPlayers].push(this.cards[i]);
    }
    return hands;
  }
}
