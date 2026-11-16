import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
import { Card as CardClass, COMBINATION_TYPES, RANKS } from "../game/index.js";

export class AI {
  gameClient: GameClient;
  type: string;
  persona: string | null;
  id: string;

  /**
   * Creates an instance of AI.
   * This is a base class for all AI strategies.
   * @param gameClient The game client instance.
   * @param type The type of AI (e.g., "lowest_card", "random").
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, type: string, persona: string | null = null) {
    this.gameClient = gameClient;
    this.type = type;
    this.persona = persona;
    this.id = crypto.randomUUID();
  }

  data(): { game: string; id: string; persona: string | null; type: string } {
    return { game: this.gameClient.getId(), id: this.id, persona: this.persona, type: this.type };
  }

  /**
   * Executes the AI's turn and returns the chosen move.
   * Subclasses must implement this method.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(_playerHand: Card[], _playPile: Card[], _currentTurn: number, _allPlayerHands: Card[][]): Card[] {
    throw new Error("Subclasses must implement takeTurn");
  }

  /**
   * Finds all valid move for the AI player.
   * @param hand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns An array of valid moves, or empty array if none found.
   */
  findAllValidMoves(
    hand: Card[],
    playPile: Card[],
    currentTurn: number,
    allPlayerHands: Card[][],
  ): Card[][] {
    let allValidMoves: Card[][] = [];
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(hand, playPile, COMBINATION_TYPES.SINGLE, currentTurn, allPlayerHands),
    );
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(hand, playPile, COMBINATION_TYPES.PAIR, currentTurn, allPlayerHands),
    );
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(hand, playPile, COMBINATION_TYPES.TRIPLE, currentTurn, allPlayerHands),
    );
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(hand, playPile, COMBINATION_TYPES.STRAIGHT, currentTurn, allPlayerHands),
    );
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(hand, playPile, COMBINATION_TYPES.FOUR_OF_A_KIND, currentTurn, allPlayerHands),
    );
    allValidMoves = allValidMoves.concat(
      this.findValidMoves(
        hand,
        playPile,
        COMBINATION_TYPES.CONSECUTIVE_PAIRS,
        currentTurn,
        allPlayerHands,
      ),
    );
    return allValidMoves;
  }

  /**
   * Finds all valid moves of a specific combination type for the AI player.
   * @param hand The AI player's hand.
   * @param playPile The current play pile.
   * @param combinationType The type of combination to find.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns An array of valid moves.
   */
  findValidMoves(
    hand: Card[],
    playPile: Card[],
    combinationType: string,
    currentTurn: number,
    allPlayerHands: Card[][],
  ): Card[][] {
    const potentialMoves = this.generateCombinations(hand, combinationType);
    const validMoves: Card[][] = [];

    for (const potentialPlay of potentialMoves) {
      if (
        this.gameClient.isValidPlay(
          potentialPlay,
          playPile,
          hand,
          currentTurn,
          allPlayerHands,
        )
      ) {
        validMoves.push(potentialPlay);
      }
    }
    return validMoves;
  }

  /**
   * Generates all possible combinations of a given type from a player's hand.
   * @param hand The player's hand.
   * @param type The type of combination to generate.
   * @returns An array of combinations.
   */
  generateCombinations(hand: Card[], type: string): Card[][] {
    let combinations: Card[][] = [];
    switch (type) {
      case COMBINATION_TYPES.SINGLE:
        combinations = this._generateSingles(hand);
        break;
      case COMBINATION_TYPES.PAIR:
        combinations = this._generatePairs(hand);
        break;
      case COMBINATION_TYPES.TRIPLE:
        combinations = this._generateTriples(hand);
        break;
      case COMBINATION_TYPES.STRAIGHT:
        combinations = this._generateStraights(hand);
        break;
      case COMBINATION_TYPES.FOUR_OF_A_KIND:
        combinations = this._generateFourOfAKind(hand);
        break;
      case COMBINATION_TYPES.CONSECUTIVE_PAIRS:
        combinations = this._generateConsecutivePairs(hand);
        break;
    }

    combinations.forEach(CardClass.sort);
    combinations.sort((a, b) => a[0].value - b[0].value);
    return combinations;
  }

  /**
   * Generates all possible single cards from a hand.
   * @param hand The player's hand.
   * @returns An array of single card combinations.
   */
  _generateSingles(hand: Card[]): Card[][] {
    return hand.map((card) => [card]);
  }

  /**
   * Generates all possible pairs from a hand.
   * @param hand The player's hand.
   * @returns An array of pair combinations.
   */
  _generatePairs(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];
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
   * @param hand The player's hand.
   * @returns An array of triple combinations.
   */
  _generateTriples(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];
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
   * @param hand The player's hand.
   * @returns An array of straight combinations.
   */
  _generateStraights(hand: Card[]): Card[][] {
    const straights: Card[][] = [];
    const handWithoutTwos = hand.filter((card) => card.rank !== "2");
    if (handWithoutTwos.length < 3) {
      return straights;
    }

    // Find all unique straights of ranks
    const uniqueCards = handWithoutTwos.reduce((acc: Card[], card) => {
      if (!acc.find((c) => c.rank === card.rank)) {
        acc.push(card);
      }
      return acc;
    }, []);
    CardClass.sort(uniqueCards);

    const rankStraights: string[][] = [];
    for (let i = 0; i < uniqueCards.length; i++) {
      for (let j = i; j < uniqueCards.length; j++) {
        const slice = uniqueCards.slice(i, j + 1);
        if (slice.length >= 3) {
          let isStraight = true;
          for (let k = 0; k < slice.length - 1; k++) {
            if (RANKS.indexOf(slice[k + 1].rank) - RANKS.indexOf(slice[k].rank) !== 1) {
              isStraight = false;
              break;
            }
          }
          if (isStraight) {
            rankStraights.push(slice.map((card) => card.rank));
          }
        }
      }
    }

    // For each rank straight, find all card combinations
    for (const rankStraight of rankStraights) {
      const cardsInStraight = rankStraight.map(
        (rank) => handWithoutTwos.filter((card) => card.rank === rank),
      );

      const combinations = cardsInStraight.reduce(
        (acc: Card[][], cards) => {
          const newAcc: Card[][] = [];
          for (const accCard of acc) {
            for (const card of cards) {
              newAcc.push([...accCard, card]);
            }
          }
          return newAcc;
        },
        [[]] as Card[][],
      );

      straights.push(...combinations);
    }

    return straights;
  }

  /**
   * Generates all possible four of a kind combinations from a hand.
   * @param hand The player's hand.
   * @returns An array of four of a kind combinations.
   */
  _generateFourOfAKind(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];
    for (let i = 0; i < hand.length; i++) {
      for (let j = i + 1; j < hand.length; j++) {
        for (let k = j + 1; k < hand.length; k++) {
          for (let l = k + 1; l < hand.length; l++) {
            if (
              hand[i].rank === hand[j].rank &&
              hand[j].rank === hand[k].rank &&
              hand[k].rank === hand[l].rank
            ) {
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
   * @param hand The player's hand.
   * @returns An array of consecutive pair combinations.
   */
  _generateConsecutivePairs(hand: Card[]): Card[][] {
    const combinations: Card[][] = [];
    const handWithoutTwos = hand.filter((card) => card.rank !== "2");
    const sortedHand = [...handWithoutTwos];
    CardClass.sort(sortedHand);

    const rankToCards = new Map<string, Card[]>();
    for (const card of sortedHand) {
      if (!rankToCards.has(card.rank)) {
        rankToCards.set(card.rank, []);
      }
      rankToCards.get(card.rank)!.push(card);
    }

    const distinctPairs: Card[][] = [];
    for (const [, cards] of rankToCards.entries()) {
      if (cards.length >= 2) {
        distinctPairs.push([cards[0], cards[1]]);
      }
    }

    distinctPairs.sort((a, b) => a[0].value - b[0].value);

    if (distinctPairs.length < 3) return combinations;

    const maximalConsecutivePairsSequences: Card[][][] = [];
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
   * Extracts all sub-consecutive pairs of length 3 or 4 from a given sequence of consecutive pairs.
   * @param maximalConsecutivePairs The sequence of consecutive pairs to extract sub-sequences from.
   * @returns An array of sub-consecutive pair combinations.
   */
  _deriveSubConsecutivePairs(maximalConsecutivePairs: Card[][]): Card[][] {
    const subConsecutivePairs: Card[][] = [];
    if (maximalConsecutivePairs.length >= 3) {
      for (let i = 0; i <= maximalConsecutivePairs.length - 3; i++) {
        for (
          let j = i + 3;
          j <= i + 4 && j <= maximalConsecutivePairs.length;
          j++
        ) {
          subConsecutivePairs.push(maximalConsecutivePairs.slice(i, j).flat() as Card[]);
        }
      }
    }
    return subConsecutivePairs;
  }
}
