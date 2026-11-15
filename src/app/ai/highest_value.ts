import type { GameClient } from "../game/client";
import type { Card } from "../game/deck";
import { AI } from "./base";
import { AI_TYPES } from "./index";

export class HighestValueAI extends AI {
  /**
   * Creates an instance of HighestValueAI.
   * This AI chooses the valid move with the highest total value of cards in the combination.
   * @param gameClient The game client instance.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, persona: string | null = null) {
    super(gameClient, AI_TYPES.HIGHEST_VALUE, persona);
  }

  /**
   * Executes the AI's turn by finding the valid move with the highest total value.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const move = this._findHighestValueMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the valid move with the highest total value for the AI player.
   * @param hand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if no valid move is found.
   */
  _findHighestValueMove(hand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length === 0) {
      return [];
    }

    let highestValueMove = allValidMoves[0];
    let highestTotalValue = highestValueMove.reduce((sum, card) => sum + card.value, 0);

    for (let i = 1; i < allValidMoves.length; i++) {
      const currentMove = allValidMoves[i];
      const currentTotalValue = currentMove.reduce((sum, card) => sum + card.value, 0);

      if (currentTotalValue > highestTotalValue) {
        highestTotalValue = currentTotalValue;
        highestValueMove = currentMove;
      }
    }

    return highestValueMove;
  }
}
