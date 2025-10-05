import { AI } from "./base.js";
import { AI_TYPES } from "./constants.js";

export class HighestValueAI extends AI {
  /**
   * Creates an instance of HighestValueAI.
   * This AI chooses the valid move with the highest total value of cards in the combination.
   * @param {Game} game The game instance.
   * @param {string} [persona=null] The persona of the AI.
   */
  constructor(game, persona = null) {
    super(game, AI_TYPES.HIGHEST_VALUE, persona);
  }

  /**
   * Executes the AI's turn by finding the valid move with the highest total value.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const move = this._findHighestValueMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the valid move with the highest total value for the AI player.
   * @param {Array<Card>} hand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if no valid move is found.
   */
  _findHighestValueMove(hand, playPile, currentTurn, allPlayerHands) {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length === 0) {
      return [];
    }

    let highestValueMove = allValidMoves[0];
    let highestTotalValue = highestValueMove.reduce((sum, card) => sum + card.value, 0);

    for (let i = 1; i < allValidMoves.length; i++) {
      const currentMove = allValidMoves[i];
      const currentTotalValue = currentMove.reduce((sum, card) => sum + card.value, 0);

      if (currentTotalValue > highestTotalValue) {
        highestTotalValue = currentTotalValue;
        highestValueMove = currentMove;
      }
    }

    return highestValueMove;
  }
}
