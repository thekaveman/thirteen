import type { Card } from "../game/deck";
import type { GameClient } from "../game/client";
import type { AI } from "../ai/base.js";
import { Player } from "./base";
import { PLAYER_TYPES } from "./index";

export class AIPlayer extends Player {
  ai: AI;

  /**
   * Create a new AIPlayer instance.
   * @param gameClient The game client instance this player uses.
   * @param number The player number in the underlying game.
   * @param ai The AI strategy to wire into this player.
   */
  constructor(gameClient: GameClient, number: number, ai: AI) {
    super(PLAYER_TYPES.AI, gameClient, number);
    this.ai = ai;
    this.persona = this.ai.persona;
  }

  data(): { game: string; id: string; number: number; persona: string | null; type: string; ai: unknown } {
    const d = super.data();
    return { ...d, ai: this.ai.data() };
  }

  takeTurn(): Card[] {
    const playerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex()) as Card[];
    const playPile = this.gameClient.getPlayPile();
    const currentTurn = this.gameClient.getCurrentTurn();
    const allPlayerHands = this.gameClient.getPlayerHands() as Card[][];
    const result = this.ai.takeTurn(playerHand, playPile, currentTurn, allPlayerHands);
    return result ?? [];
  }
}
