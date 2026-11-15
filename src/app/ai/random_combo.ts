import type { GameClient } from "../game/client";
import type { Card } from "../game/deck";
import type { AI } from "./base";
import { ComboAI } from "./combo";
import { AI_TYPES } from "./index";

export class RandomComboAI extends ComboAI {
  /**
   * Creates an instance of RandomComboAI.
   * This AI chooses a random strategy from its available strategies.
   * @param gameClient The game client instance.
   * @param strategies An array of AI strategy instances.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, strategies: AI[], persona: string | null = null) {
    super(gameClient, strategies, AI_TYPES.RANDOM_COMBO, persona);
  }

  /**
   * Selects a random strategy from the available strategies.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The selected AI strategy.
   */
  select(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): AI | null {
    if (this.strategies.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.strategies.length);
    return this.strategies[randomIndex];
  }
}
