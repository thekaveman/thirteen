import type { GameClient } from "../game/client";
import type { Card } from "../game/deck";
import { AI } from "./base";
import { AI_TYPES } from "./index";

export class HighestCardAI extends AI {
  /**
   * Creates an instance of HighestCardAI.
   * This AI chooses the valid move with the highest-value starting card.
   * @param gameClient The game client instance.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, persona: string | null = null) {
    super(gameClient, AI_TYPES.HIGHEST_CARD, persona);
  }

  /**
   * Executes the AI's turn by finding the highest valid move.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const move = this._findHighestValidMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the highest valid move for the AI player.
   * @param hand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if no valid move is found.
   */
  _findHighestValidMove(hand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    allValidMoves.sort((a, b) => b[0].value - a[0].value);

    return allValidMoves.length > 0 ? allValidMoves[0] : [];
  }
}
