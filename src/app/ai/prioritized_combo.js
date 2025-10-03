import { ComboAI } from "./combo.js";

export class PrioritizedComboAI extends ComboAI {
  /**
   * Creates an instance of PrioritizedComboAI.
   * This AI iterates through a list of strategies and uses the first one that can make a valid move.
   * @param {Game} game The game instance.
   * @param {Array<AI>} strategies An array of AI strategy instances, ordered by priority.
   */
  constructor(game, strategies) {
    super(game, "prioritized-combo", strategies);
  }

  /**
   * Selects a strategy from the available strategies based on priority.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {AI} The selected AI strategy.
   */
  select(playerHand, playPile, currentTurn, allPlayerHands) {
    for (const strategy of this.strategies) {
      const move = strategy.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
      if (move && move.length > 0) {
        return strategy;
      }
    }
    return null;
  }
}
