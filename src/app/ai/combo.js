import { AI } from "./base.js";

export class ComboAI extends AI {
  /**
   * Creates an instance of ComboAI.
   * @param {Game} game The game instance.
   * @param {Array<AI>} strategies An array of AI strategy instances.
   */
  constructor(game, strategies = [], type = "combo", persona = null) {
    super(game, type, persona);
    this.strategies = strategies;
  }

  data() {
    const d = super.data();
    d.strategies = this.strategies.map((strategy) => strategy.type);
    return d;
  }

  /**
   * Selects one of the available strategies.
   * Subclasses must implement this method.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {AI} The selected AI strategy.
   */
  select(playerHand, playPile, currentTurn, allPlayerHands) {
    throw new Error("Subclasses must implement select()");
  }

  /**
   * Executes the ComboAI's turn by selecting a strategy and returning its chosen move.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const selectedStrategy = this.select(playerHand, playPile, currentTurn, allPlayerHands);
    if (selectedStrategy) {
      return selectedStrategy.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    }
    return [];
  }
}
