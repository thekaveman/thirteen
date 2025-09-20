import { RANKS } from "./constants.js";
import { sortHand } from "./deck.js";

export class AI {
  constructor(game) {
    this.game = game;
  }

  /**
   * Executes the AI's turn and returns the chosen move.
   * @param {Array<object>} playerHand The AI player's hand.
   * @param {Array<object>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<object>>} allPlayerHands All players' hands.
   * @returns {Array<object> | null} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    throw new Error("Subclasses must implement takeTurn");
  }

  /**
   * Finds all valid moves of a specific combination type for the AI player.
   * @param {Array<object>} hand The AI player's hand.
   * @param {Array<object>} playPile The current play pile.
   * @param {string} combinationType The type of combination to find.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<object>>} allPlayerHands All players' hands.
   * @returns {Array<Array<object>>} An array of valid moves.
   */
  _findValidMoves(hand, playPile, combinationType, currentTurn, allPlayerHands) {
    const potentialMoves = this._generateCombinations(hand, combinationType);
    const validMoves = [];

    for (const potentialPlay of potentialMoves) {
      if (this.game.isValidPlay(potentialPlay, playPile, hand, currentTurn, allPlayerHands)) {
        validMoves.push(potentialPlay);
      }
    }
    return validMoves;
  }

  /**
   * Generates all possible combinations of a given type from a player's hand.
   * @param {Array<object>} hand The player's hand.
   * @param {string} type The type of combination to generate.
   * @returns {Array<Array<object>>} An array of combinations.
   */
  _generateCombinations(hand, type) {
    let combinations = [];
    switch (type) {
      case "single":
        combinations = this._generateSingles(hand);
        break;
      case "pair":
        combinations = this._generatePairs(hand);
        break;
      case "triple":
        combinations = this._generateTriples(hand);
        break;
      case "straight":
        combinations = this._generateStraights(hand);
        break;
      case "four_of_a_kind":
        combinations = this._generateFourOfAKind(hand);
        break;
      case "consecutive_pairs":
        combinations = this._generateConsecutivePairs(hand);
        break;
    }

    combinations.forEach(sortHand);
    combinations.sort((a, b) => a[0].value - b[0].value);
    return combinations;
  }

  /**
   * Generates all possible single cards from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of single card combinations.
   */
  _generateSingles(hand) {
    return hand.map((card) => [card]);
  }

  /**
   * Generates all possible pairs from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of pair combinations.
   */
  _generatePairs(hand) {
    const combinations = [];
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        if (hand[i].rank === hand[j].rank) {
          combinations.push([hand[i], hand[j]]);
        }
      }
    }
    return combinations;
  }

  /**
   * Generates all possible triples from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of triple combinations.
   */
  _generateTriples(hand) {
    const combinations = [];
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        for (let k = j + 1; k < hand.length; k++) {
          if (hand[i].rank === hand[j].rank && hand[j].rank === hand[k].rank) {
            combinations.push([hand[i], hand[j], hand[k]]);
          }
        }
      }
    }
    return combinations;
  }

  /**
   * Generates all possible straights from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of straight combinations.
   */
  _generateStraights(hand) {
    const combinations = [];
    const sortedHand = [...hand];
    sortHand(sortedHand);

    const uniqueSortedCardsWithoutTwos = this._getUniqueSortedRanksWithoutTwos(sortedHand);
    const maximalStraights = this._findMaximalStraights(uniqueSortedCardsWithoutTwos);

    for (const maximalStraight of maximalStraights) {
      combinations.push(...this._deriveSubStraights(maximalStraight));
    }
    return combinations;
  }

  /**
   * Extracts unique ranks (excluding '2's) from a sorted hand.
   * @param {Array<object>} sortedHand The sorted hand.
   * @returns {Array<object>} An array of cards with unique ranks.
   */
  _getUniqueSortedRanksWithoutTwos(sortedHand) {
    const uniqueRanks = [];
    for (const card of sortedHand) {
      if (card.rank === "2") continue;
      if (uniqueRanks.length === 0 || RANKS.indexOf(card.rank) !== RANKS.indexOf(uniqueRanks[uniqueRanks.length - 1].rank)) {
        uniqueRanks.push(card);
      }
    }
    return uniqueRanks;
  }

  /**
   * Builds the longest possible consecutive straight starting from a given index in uniqueRanks.
   * @param {Array<object>} uniqueRanks An array of cards with unique ranks.
   * @returns {Array<object>} The longest consecutive straight found.
   */
  _findMaximalStraights(uniqueRanks) {
    const maximalStraights = [];
    if (uniqueRanks.length === 0) return maximalStraights;

    let currentMaximalSequence = [uniqueRanks[0]];
    for (let i = 1; i < uniqueRanks.length; i++) {
      if (
        RANKS.indexOf(uniqueRanks[i].rank) ===
        RANKS.indexOf(currentMaximalSequence[currentMaximalSequence.length - 1].rank) + 1
      ) {
        currentMaximalSequence.push(uniqueRanks[i]);
      } else {
        maximalStraights.push(currentMaximalSequence);
        currentMaximalSequence = [uniqueRanks[i]];
      }
    }
    maximalStraights.push(currentMaximalSequence);
    return maximalStraights;
  }

  /**
   * Extracts all sub-straights of length 3 or more from a given straight.
   * @param {Array<object>} maximalStraight The straight to extract sub-straights from.
   * @returns {Array<Array<object>>} An array of sub-straights.
   */
  _deriveSubStraights(maximalStraight) {
    const subStraights = [];
    if (maximalStraight.length >= 3) {
      for (let i = 0; i <= maximalStraight.length - 3; i++) {
        for (let j = i + 3; j <= maximalStraight.length; j++) {
          subStraights.push(maximalStraight.slice(i, j));
        }
      }
    }
    return subStraights;
  }

  /**
   * Generates all possible four of a kind combinations from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of four of a kind combinations.
   */
  _generateFourOfAKind(hand) {
    const combinations = [];
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        for (let k = j + 1; k < hand.length; k++) {
          for (let l = k + 1; l < hand.length; l++) {
            if (hand[i].rank === hand[j].rank && hand[j].rank === hand[k].rank && hand[k].rank === hand[l].rank) {
              combinations.push([hand[i], hand[j], hand[k], hand[l]]);
            }
          }
        }
      }
    }
    return combinations;
  }

  /**
   * Generates all possible consecutive pairs (double straights) from a hand.
   * @param {Array<object>} hand The player's hand.
   * @returns {Array<Array<object>>} An array of consecutive pair combinations.
   */
  _generateConsecutivePairs(hand) {
    const combinations = [];
    const sortedHand = [...hand];
    sortHand(sortedHand);

    const rankToCards = new Map();
    for (const card of sortedHand) {
      if (!rankToCards.has(card.rank)) {
        rankToCards.set(card.rank, []);
      }
      rankToCards.get(card.rank).push(card);
    }

    const distinctPairs = [];
    for (const [rank, cards] of rankToCards.entries()) {
      if (cards.length >= 2) {
        distinctPairs.push([cards[0], cards[1]]);
      }
    }

    distinctPairs.sort((a, b) => a[0].value - b[0].value);

    if (distinctPairs.length < 3) return combinations;

    const maximalConsecutivePairsSequences = [];
    if (distinctPairs.length > 0) {
      let currentMaximalSequence = [distinctPairs[0]];
      for (let i = 1; i < distinctPairs.length; i++) {
        if (
          RANKS.indexOf(distinctPairs[i][0].rank) ===
          RANKS.indexOf(currentMaximalSequence[currentMaximalSequence.length - 1][0].rank) + 1
        ) {
          currentMaximalSequence.push(distinctPairs[i]);
        } else {
          maximalConsecutivePairsSequences.push(currentMaximalSequence);
          currentMaximalSequence = [distinctPairs[i]];
        }
      }
      maximalConsecutivePairsSequences.push(currentMaximalSequence);
    }

    for (const maximalSequence of maximalConsecutivePairsSequences) {
      combinations.push(...this._deriveSubConsecutivePairs(maximalSequence));
    }

    return combinations;
  }

  /**
   * Extracts all sub-consecutive pairs of length 3 or more from a given sequence of consecutive pairs.
   * @param {Array<Array<object>>} maximalConsecutivePairs The sequence of consecutive pairs to extract sub-sequences from.
   * @returns {Array<Array<object>>} An array of sub-consecutive pair combinations.
   */
  _deriveSubConsecutivePairs(maximalConsecutivePairs) {
    const subConsecutivePairs = [];
    if (maximalConsecutivePairs.length >= 3) {
      for (let i = 0; i <= maximalConsecutivePairs.length - 3; i++) {
        for (let j = i + 3; j <= maximalConsecutivePairs.length; j++) {
          subConsecutivePairs.push(maximalConsecutivePairs.slice(i, j).flat());
        }
      }
    }
    return subConsecutivePairs;
  }
}

export class LowestCardAI extends AI {
  constructor(game) {
    super(game);
  }

  /**
   * Executes the AI's turn by finding the lowest valid move.
   * @param {Array<object>} playerHand The AI player's hand.
   * @param {Array<object>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<object>>} allPlayerHands All players' hands.
   * @returns {Array<object>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const move = this._findLowestValidMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the lowest valid move for the AI player.
   * @param {Array<object>} hand The AI player's hand.
   * @param {Array<object>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<object>>} allPlayerHands All players' hands.
   * @returns {Array<object>} The cards to play, or an empty array if no valid move is found.
   */
  _findLowestValidMove(hand, playPile, currentTurn, allPlayerHands) {
    let allValidMoves = [];
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "single", currentTurn, allPlayerHands));
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "pair", currentTurn, allPlayerHands));
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "triple", currentTurn, allPlayerHands));
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "straight", currentTurn, allPlayerHands));
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "four_of_a_kind", currentTurn, allPlayerHands));
    allValidMoves = allValidMoves.concat(this._findValidMoves(hand, playPile, "consecutive_pairs", currentTurn, allPlayerHands));

    allValidMoves.sort((a, b) => a[0].value - b[0].value);

    return allValidMoves.length > 0 ? allValidMoves[0] : [];
  }
}
