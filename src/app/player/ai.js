import { Player } from "./base.js";
import { PLAYER_TYPES } from "./index.js";

export class AIPlayer extends Player {
  constructor(game, number, ai) {
    super(PLAYER_TYPES.AI, game, number);
    this.ai = ai;
    this.persona = this.ai.persona;
  }

  data() {
    const d = super.data();
    d.ai = this.ai.data();
    return d;
  }

  takeTurn() {
    const playerHand = this.game.gameState.playerHands[this.game.gameState.currentPlayer];
    const playPile = this.game.gameState.playPile;
    const currentTurn = this.game.gameState.currentTurn;
    const allPlayerHands = this.game.gameState.playerHands;
    return this.ai.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
  }
}
