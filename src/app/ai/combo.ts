import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
import { AI } from "./base.js";

export abstract class ComboAI extends AI {
  strategies: AI[];

  /**
   * Creates an instance of ComboAI.
   * @param gameClient The game client instance.
   * @param strategies An array of AI strategy instances.
   * @param type The type of AI.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, strategies: AI[] = [], type: string = "combo", persona: string | null = null) {
    super(gameClient, type, persona);
    this.strategies = strategies;
  }

  data(): { game: string; id: string; persona: string | null; type: string; strategies: string[] } {
    const d = super.data();
    return { ...d, strategies: this.strategies.map((strategy) => strategy.type) };
  }

  /**
   * Selects one of the available strategies.
   * Subclasses must implement this method.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The selected AI strategy, or null if none.
   */
  select(
    _playerHand: Card[],
    _playPile: Card[],
    _currentTurn: number,
    _allPlayerHands: Card[][],
  ): AI | null {
    throw new Error("Subclasses must implement select()");
  }

  /**
   * Executes the ComboAI's turn by selecting a strategy and returning its chosen move.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    const selectedStrategy = this.select(playerHand, playPile, currentTurn, allPlayerHands);
    if (selectedStrategy) {
      return selectedStrategy.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    }
    return [];
  }
}
