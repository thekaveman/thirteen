import { AI } from "./base.js";
import { ComboAI } from "./combo.js";
import { AI_TYPES } from "./constants.js";

export class RandomComboAI extends ComboAI {
  /**
   * Creates an instance of RandomComboAI.
   * This AI chooses a random strategy from its available strategies.
   * @param {Game} game The game instance.
   * @param {Array<AI>} strategies An array of AI strategy instances.
   * @param {string} [persona=null] The persona of the AI.
   */
  constructor(game, strategies, persona = null) {
    super(game, strategies, AI_TYPES.RANDOM_COMBO, persona);
  }

  /**
   * Selects a random strategy from the available strategies.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {AI} The selected AI strategy.
   */
  select(playerHand, playPile, currentTurn, allPlayerHands) {
    if (this.strategies.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * this.strategies.length);
    return this.strategies[randomIndex];
  }
}
