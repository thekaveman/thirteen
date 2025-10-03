import { AI } from "./base.js";
import { RandomAI } from "./random.js";

export class PassAI extends AI {
  /**
   * Creates an instance of PassAI.
   * This AI passes unless forced to play, in which case it uses a provided strategy or defaults to RandomAI.
   * @param {Game} game The game instance.
   * @param {AI} [strategy=null] The strategy to use when forced to play. Defaults to RandomAI.
   */
  constructor(game, strategy = null) {
    super(game, "pass");
    this.strategy = strategy || new RandomAI(game);
  }

  /**
   * Executes the AI's turn by passing unless forced to play.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    // If it's the first turn of the game, or the first play of a round, we must play.
    if (currentTurn === 0 || playPile.length === 0) {
      return this.strategy.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    }

    // Otherwise, always pass.
    return [];
  }
}
