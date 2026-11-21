import { COMBINATION_TYPES, RANKS } from "./index.js";
import type { Card } from "./deck.js";
import { Card as CardClass } from "./deck.js";

export class Rules {
  /**
   * Finds the player who should start the game based on the lowest card.
   * @param hands An array of sorted player hands.
   * @returns The index of the player who should start.
   */
  findStartingPlayer(hands: Card[][]): number {
    let startingPlayer = 0;
    const lowestCard = CardClass.findLowest(hands);
    if (lowestCard) {
      const lowestCardValue = lowestCard.value;

      for (let i = 0; i < hands.length; i++) {
        if (hands[i] && hands[i].length > 0 && hands[i][0].value == lowestCardValue) {
          startingPlayer = i;
        }
      }
    }

    return startingPlayer;
  }

  /**
   * Determines the combination type of a set of cards.
   * @param cards The cards to check.
   * @returns The combination type.
   */
  getCombinationType(cards: readonly Card[]): string {
    if (this.isSingle(cards)) return COMBINATION_TYPES.SINGLE;
    if (this.isPair(cards)) return COMBINATION_TYPES.PAIR;
    if (this.isTriple(cards)) return COMBINATION_TYPES.TRIPLE;
    if (this.isStraight(cards)) return COMBINATION_TYPES.STRAIGHT;
    if (this.isFourOfAKind(cards)) return COMBINATION_TYPES.FOUR_OF_A_KIND;
    return COMBINATION_TYPES.INVALID;
  }

  /**
   * Checks if a combination of cards is a bomb that can beat a single 2.
   * A bomb against a single 2 is either a four-of-a-kind or three consecutive pairs.
   * @param cards The cards to check.
   * @returns True if the cards form a bomb that beats a single 2.
   */
  isBombForSingleTwo(cards: readonly Card[]): boolean {
    const combinationType = this.getCombinationType(cards);
    if (combinationType === COMBINATION_TYPES.FOUR_OF_A_KIND) {
      return true;
    }
    if (this.isConsecutivePairs(cards)) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a combination is consecutive pairs.
   * @param cards The cards to check.
   * @returns True if the combination is consecutive pairs.
   */
  isConsecutivePairs(cards: readonly Card[]): boolean {
    if (cards.length !== 6 || cards.length % 2 !== 0 || cards.some((card) => card.rank === "2")) {
      return false;
    }
    const pairs: Card[][] = [];
    for (let i = 0; i < cards.length; i += 2) {
      const pair = [cards[i], cards[i + 1]];
      if (!this.isPair(pair)) {
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
   * @param cards The cards to check.
   * @returns True if the combination is a four-of-a-kind.
   */
  isFourOfAKind(cards: readonly Card[]): boolean {
    return cards.length === 4 && CardClass.allSameRank(cards);
  }

  /**
   * Checks if a combination is a pair.
   * @param cards The cards to check.
   * @returns True if the combination is a pair.
   */
  isPair(cards: readonly Card[]): boolean {
    return cards.length === 2 && CardClass.allSameRank(cards);
  }

  /**
   * Checks if a combination is a single card.
   * @param cards The cards to check.
   * @returns True if the combination is a single.
   */
  isSingle(cards: readonly Card[]): boolean {
    return cards.length === 1;
  }

  /**
   * Checks if a combination is a straight.
   * @param cards The cards to check.
   * @returns True if the combination is a straight.
   */
  isStraight(cards: readonly Card[]): boolean {
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
   * @param cards The cards to check.
   * @returns True if the combination is a triple.
   */
  isTriple(cards: readonly Card[]): boolean {
    return cards.length === 3 && CardClass.allSameRank(cards);
  }

  /**
   * Checks if a play is valid according to the game rules.
   * @param selectedCards The cards the player has selected.
   * @param playPile The cards currently in the play pile.
   * @param playerHand The hand of the player making the play.
   * @param currentTurn The index of the current player's turn.
   * @param allPlayerHands All player hands.
   * @returns True if the play is valid.
   */
  isValidPlay(
    selectedCards: readonly Card[],
    playPile: readonly Card[],
    playerHand: readonly Card[],
    currentTurn: number,
    allPlayerHands: readonly Card[][],
  ): boolean {
    // Check if all selected cards are in the current player's hand
    for (const selectedCard of selectedCards) {
      if (!playerHand.some((card) => card.rank === selectedCard.rank && card.suit === selectedCard.suit)) {
        return false;
      }
    }

    const playPileCombinationType = this.getCombinationType(playPile);

    // Determine if the selection is a bomb (four-of-a-kind or three consecutive pairs)
    const selectedCombinationType = this.getCombinationType(selectedCards);
    const isSelectedBomb =
      selectedCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND ||
      this.isConsecutivePairs(selectedCards);

    // Bomb logic: Bombs can only be played on a single 2 or a previous bomb of the same type
    if (isSelectedBomb) {
      if (playPile.length === 0) return false;

      const topCard = playPile[playPile.length - 1];

      // Check if play pile is a single 2
      if (topCard.rank === "2" && playPile.length === 1) {
        return this.isBombForSingleTwo(selectedCards);
      }

      // Check if play pile is a bomb of the same type
      const playPileIsBomb =
        playPileCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND ||
        this.isConsecutivePairs(playPile);

      if (playPileIsBomb) {
        const selectedBombType = selectedCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND ? "four_of_a_kind" : "consecutive_pairs";
        const playPileBombType = playPileCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND ? "four_of_a_kind" : (this.isConsecutivePairs(playPile) ? "consecutive_pairs" : null);

        if (selectedBombType === playPileBombType) {
          // Same bomb type: must be higher value
          const highestSelectedCard = selectedCards.reduce((max, card) => (card.value > max.value ? card : max));
          const highestPlayPileCard = playPile.reduce((max, card) => (card.value > max.value ? card : max));
          return highestSelectedCard.value > highestPlayPileCard.value;
        }

        return false; // Different bomb type
      }

      return false; // Cannot bomb on non-2, non-bomb plays
    }

    // Reject invalid combinations (e.g., four consecutive pairs is not a valid combo)
    if (selectedCombinationType === COMBINATION_TYPES.INVALID) {
      return false;
    }

    // Standard play validation
    if (playPile.length === 0) {
      if (currentTurn === 0) {
        const lowestCard = CardClass.findLowest(allPlayerHands);
        return selectedCards.some((card) => card.value === lowestCard!.value);
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
}
