import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
import { AI } from "./base.js";
import { AI_TYPES } from "./index.js";

export class LowestValueAI extends AI {
  /**
   * Creates an instance of LowestValueAI.
   * This AI chooses the valid move with the lowest total value of cards in the combination.
   * @param gameClient The game client instance.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, persona: string | null = null) {
    super(gameClient, AI_TYPES.LOWEST_VALUE, persona);
  }

  /**
   * Executes the AI's turn by finding the valid move with the lowest total value.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const move = this._findLowestValueMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the valid move with the lowest total value for the AI player.
   * @param hand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if no valid move is found.
   */
  _findLowestValueMove(hand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length === 0) {
      return [];
    }

    let lowestValueMove = allValidMoves[0];
    let lowestTotalValue = lowestValueMove.reduce((sum, card) => sum + card.value, 0);

    for (let i = 1; i < allValidMoves.length; i++) {
      const currentMove = allValidMoves[i];
      const currentTotalValue = currentMove.reduce((sum, card) => sum + card.value, 0);

      if (currentTotalValue < lowestTotalValue) {
        lowestTotalValue = currentTotalValue;
        lowestValueMove = currentMove;
      }
    }

    return lowestValueMove;
  }
}
