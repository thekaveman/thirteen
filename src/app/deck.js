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
   * Parse a JSON string into a Card instance.
   * @param {string} json JSON string containing card data.
   * @returns {Card} The parsed Card instance.
   */
  static parse(json) {
    const data = JSON.parse(json);
    return new Card(data.rank, data.suit);
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
  constructor(cards = null) {
    if (cards) {
      this.cards = cards.map((card) => new Card(card.rank, card.suit));
    } else {
      this.cards = SUITS.flatMap((suit) => RANKS.map((rank) => new Card(rank, suit)));
    }
  }

  /**
   * Deals a deck of cards to a specified number of players.
   * @param {number} numPlayers The number of players.
   * @returns {Array<Array<Card>>} An array of hands, where each hand is an array of cards.
   */
  deal(numPlayers) {
    const hands = new Array(numPlayers).fill(0).map(() => []);
    const shuffledCards = [...this.cards];

    // Fisher-Yates shuffle on the copy
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < numPlayers; j++) {
        if (shuffledCards.length > 0) {
          hands[j].push(shuffledCards.pop());
        }
      }
    }
    return hands;
  }
}
