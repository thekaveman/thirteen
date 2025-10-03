import { AI } from "./base.js";
import { Card } from "../deck.js";

export class HighestCardAI extends AI {
  /**
   * Creates an instance of HighestCardAI.
   * This AI chooses the valid move with the highest-value starting card.
   * @param {Game} game The game instance.
   */
  constructor(game) {
    super(game, "highest-card");
  }

  /**
   * Executes the AI's turn by finding the highest valid move.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const move = this._findHighestValidMove(playerHand, playPile, currentTurn, allPlayerHands);
    return move.length > 0 ? move : [];
  }

  /**
   * Finds the highest valid move for the AI player.
   * @param {Array<Card>} hand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if no valid move is found.
   */
  _findHighestValidMove(hand, playPile, currentTurn, allPlayerHands) {
    const allValidMoves = this.findAllValidMoves(hand, playPile, currentTurn, allPlayerHands);

    allValidMoves.sort((a, b) => b[0].value - a[0].value); // Sort in descending order

    return allValidMoves.length > 0 ? allValidMoves[0] : [];
  }
}
