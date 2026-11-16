import { SUITS, RANKS } from "./index.js";

export class Card {
  rank: string;
  suit: string;
  value: number;

  constructor(rank: string, suit: string) {
    this.rank = rank;
    this.suit = suit;
    this.value = Card.getValue(rank, suit);
  }

  /**
   * Checks if all cards in a combination have the same rank.
   * @param cards The cards to check.
   * @returns True if all cards have the same rank.
   */
  static allSameRank(cards: readonly Card[]): boolean {
    if (cards.length === 0) {
      return true;
    }
    const firstRank = cards[0].rank;
    return cards.every((card) => card.rank === firstRank);
  }

  /**
   * Get a data representation of the cards.
   * @param cards The cards to transform.
   * @returns The pure data representation of the cards.
   */
  static listToObjects(cards: readonly Card[]): Array<{ rank: string; suit: string; value: number }> {
    return cards.map((card) => card.data());
  }

  /**
   * Finds the lowest card in the list of hands.
   * @param hands An array of player hands.
   * @returns The lowest card object, or null if no cards exist.
   */
  static findLowest(hands: readonly Card[][]): Card | null {
    let lowestCard: Card | null = null;
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
   * @param rank The rank of the card (e.g., "A", "K", "3").
   * @param suit The suit of the card (e.g., "♠", "♣", "♦", "♥").
   * @returns The calculated numeric value of the card.
   */
  static getValue(rank: string, suit: string): number {
    const rankIndex = RANKS.indexOf(rank);
    const suitIndex = SUITS.indexOf(suit);
    return rankIndex * 4 + suitIndex;
  }

  /**
   * Parse a JSON string into a Card instance.
   * @param json JSON string containing card data.
   * @returns The parsed Card instance.
   */
  static parse(json: string): Card {
    const data = JSON.parse(json);
    return new Card(data.rank, data.suit);
  }

  /**
   * Parse an array of objects into an array of Card instances.
   * @param list Array containing card data.
   * @returns The parsed array of Card instances.
   */
  static objectsToList(list: ReadonlyArray<{ rank: string; suit: string }>): Card[] {
    return list.map((c) => new Card(c.rank, c.suit));
  }

  /**
   * Sorts a hand of cards by value.
   * @param hand The hand to sort.
   */
  static sort(hand: Card[]): void {
    hand.sort((a, b) => a.value - b.value);
  }

  /**
   * Get a data representation of this card.
   * @returns The pure data representation of the card.
   */
  data(): { rank: string; suit: string; value: number } {
    return { rank: this.rank, suit: this.suit, value: this.value };
  }
}

export class Deck {
  cards: Card[];

  constructor(cards?: ReadonlyArray<{ rank: string; suit: string }>) {
    if (cards) {
      this.cards = cards.map((card) => new Card(card.rank, card.suit));
    } else {
      this.cards = SUITS.flatMap((suit) => RANKS.map((rank) => new Card(rank, suit)));
    }
  }

  /**
   * Deals a deck of cards to a specified number of players.
   * @param numPlayers The number of players.
   * @returns An array of hands, where each hand is an array of cards.
   */
  deal(numPlayers: number): Card[][] {
    const hands: Card[][] = new Array(numPlayers).fill(0).map(() => []);
    const shuffledCards = [...this.cards];

    // Fisher-Yates shuffle on the copy
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    for (let i = 0; i < 13; i++) {
      for (let j = 0; j < numPlayers; j++) {
        if (shuffledCards.length > 0) {
          const card = shuffledCards.pop();
          if (card !== undefined) {
            hands[j].push(card);
          }
        }
      }
    }
    return hands;
  }
}
