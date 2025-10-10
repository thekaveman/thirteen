import { Card } from "../game/index.js";
import { AI } from "./base.js";
import { AI_TYPES } from "./index.js";

export class LowestCardAI extends AI {
  /**
   * Creates an instance of LowestCardAI.
   * This AI chooses the valid move with the lowest-value starting card.
   * @param {GameClient} gameClient The game client instance.
   * @param {string} [persona=null] The persona of the AI.
   */
  constructor(gameClient, persona = null) {
    super(gameClient, AI_TYPES.LOWEST_CARD, persona);
  }

  /**
   * Executes the AI's turn by finding the lowest valid move.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const move = this._findLowestValidMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the lowest valid move for the AI player.
   * @param {Array<Card>} hand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if no valid move is found.
   */
  _findLowestValidMove(hand, playPile, currentTurn, allPlayerHands) {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    allValidMoves.sort((a, b) => a[0].value - b[0].value);

    return allValidMoves.length > 0 ? allValidMoves[0] : [];
  }
}
