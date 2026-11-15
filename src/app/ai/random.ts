import type { GameClient } from "../game/client";
import type { Card } from "../game/deck";
import { AI } from "./base";

export class RandomAI extends AI {
  /**
   * Creates an instance of RandomAI.
   * This AI chooses a random valid move from all available options.
   * @param gameClient The game client instance.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, persona: string | null = null) {
    super(gameClient, "random", persona);
  }

  /**
   * Executes the AI's turn by choosing a random valid move.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const allValidMoves = this.findAllValidMoves(playerHand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * allValidMoves.length);
      return allValidMoves[randomIndex];
    }
    return [];
  }
}
