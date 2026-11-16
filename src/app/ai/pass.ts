import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
import { AI } from "./base.js";
import { RandomAI } from "./random.js";

export class PassAI extends AI {
  strategy: AI;

  /**
   * Creates an instance of PassAI.
   * This AI passes unless forced to play, in which case it uses a provided strategy or defaults to RandomAI.
   * @param gameClient The game client instance.
   * @param strategy The strategy to use when forced to play.
   * @param persona The persona of the AI.
   */
  constructor(gameClient: GameClient, strategy: AI | null = null, persona: string | null = null) {
    super(gameClient, "pass", persona);
    this.strategy = strategy || new RandomAI(gameClient, persona);
  }

  /**
   * Executes the AI's turn by passing unless forced to play.
   * @param playerHand The AI player's hand.
   * @param playPile The current play pile.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   * @returns The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand: Card[], playPile: Card[], currentTurn: number, allPlayerHands: Card[][]): Card[] {
    // If it's the first turn of the game, or the first play of a round, we must play.
    if (currentTurn === 0 || playPile.length === 0) {
      return this.strategy.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    }

    // Otherwise, always pass.
    return [];
  }
}
