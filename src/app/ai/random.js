import { AI } from "./base.js";

export class RandomAI extends AI {
  /**
   * Creates an instance of RandomAI.
   * This AI chooses a random valid move from all available options.
   * @param {Game} game The game instance.
   */
  constructor(game) {
    super(game, "random");
  }

  /**
   * Executes the AI's turn by choosing a random valid move.
   * @param {Array<Card>} playerHand The AI player's hand.
   * @param {Array<Card>} playPile The current play pile.
   * @param {number} currentTurn The current turn number.
   * @param {Array<Array<Card>>} allPlayerHands All players' hands.
   * @returns {Array<Card>} The cards to play, or an empty array if the AI passes.
   */
  takeTurn(playerHand, playPile, currentTurn, allPlayerHands) {
    const allValidMoves = this.findAllValidMoves(playerHand, playPile, currentTurn, allPlayerHands);

    if (allValidMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * allValidMoves.length);
      return allValidMoves[randomIndex];
    }
    return [];
  }
}
