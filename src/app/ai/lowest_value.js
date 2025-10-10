import { AI } from "./base.js";
import { AI_TYPES } from "./index.js";

export class LowestValueAI extends AI {
  /**
   * Creates an instance of LowestValueAI.
   * This AI chooses the valid move with the lowest total value of cards in the combination.
   * @param {GameClient} gameClient The game client instance.
   * @param {string} [persona=null] The persona of the AI.
   */
  constructor(gameClient, persona = null) {
    super(gameClient, AI_TYPES.LOWEST_VALUE, persona);
  }

  /**
   * Executes the AI's turn by finding the valid move with the lowest total value.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const move = this._findLowestValueMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the valid move with the lowest total value for the AI player.
   * @param {Array<Card>} hand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if no valid move is found.
   */
  _findLowestValueMove(hand, playPile, currentTurn, allPlayerHands) {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length === 0) {
      return [];
    }

    let lowestValueMove = allValidMoves[0];
    let lowestTotalValue = lowestValueMove.reduce((sum, card) => sum + card.value, 0);

    for (let i = 1; i < allValidMoves.length; i++) {
      const currentMove = allValidMoves[i];
      const currentTotalValue = currentMove.reduce((sum, card) => sum + card.value, 0);

      if (currentTotalValue < lowestTotalValue) {
        lowestTotalValue = currentTotalValue;
        lowestValueMove = currentMove;
      }
    }

    return lowestValueMove;
  }
}
