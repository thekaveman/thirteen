import { AI } from "../ai/index.js";
import { Player } from "./base.js";
import { PLAYER_TYPES } from "./index.js";

export class AIPlayer extends Player {
  /**
   * Create a new AIPlayer instance.
   * @param {GameClient} gameClient The game client instance this player uses.
   * @param {number} number The player number in the underlying game.
   * @param {AI} ai The AI strategy to wire into this player.
   */
  constructor(gameClient, number, ai) {
    super(PLAYER_TYPES.AI, gameClient, number);
    this.ai = ai;
    this.persona = this.ai.persona;
  }

  data() {
    const d = super.data();
    d.ai = this.ai.data();
    return d;
  }

  takeTurn() {
    const playerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex());
    const playPile = this.gameClient.getPlayPile();
    const currentTurn = this.gameClient.getCurrentTurn();
    const allPlayerHands = this.gameClient.getPlayerHands();
    return this.ai.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
  }
}
