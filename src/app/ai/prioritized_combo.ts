import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
import type { AI } from "./base.js";
import { ComboAI } from "./combo.js";
import { AI_TYPES } from "./index.js";

export class PrioritizedComboAI extends ComboAI {
  /**
   * Creates an instance of PrioritizedComboAI.
   * This AI iterates through a list of strategies and uses the first one that can make a valid move.
   * @param gameClient The game client instance.
   * @param strategies An array of AI strategy instances, ordered by priority.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, strategies: AI[], persona: string | null = null) {
    super(gameClient, strategies, AI_TYPES.PRIORITIZED_COMBO, persona);
  }

  /**
   * Selects a strategy from the available strategies based on priority.
   * Uses findAllValidMoves() directly to avoid redundant computation
   * that would occur if we called takeTurn() (which internally calls
   * findAllValidMoves() again).
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The selected AI strategy.
   */
  select(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): AI | null {
    for (const strategy of this.strategies) {
      const validMoves = strategy.findAllValidMoves(playerHand, playPile, currentTurn, allPlayerHands);
      if (validMoves.length > 0) {
        return strategy;
      }
    }
    return null;
  }
}
