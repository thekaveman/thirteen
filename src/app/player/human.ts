import type { Card } from "../game/deck.js";
import type { GameClient } from "../game/client.js";
import { log } from "../utils.js";
import { Player } from "./base.js";
import { PLAYER_TYPES } from "./index.js";

export class HumanPlayer extends Player {
  /**
   * Create a new HumanPlayer instance.
   * @param gameClient The game client instance this player uses.
   * @param number The player number in the underlying game.
   */
  constructor(gameClient: GameClient, number: number) {
    super(PLAYER_TYPES.HUMAN, gameClient, number);
  }

  takeTurn(): Card[] | null {
    // For human players, the turn is taken via UI interactions
    return null;
  }

  handlePassButtonClick(): void {
    this.gameClient.pass();
  }

  handlePlayButtonClick(): void {
    const selectedCards = this.gameClient.getSelectedCards();
    const playerHand = this.gameClient.getPlayerHands(this.gameClient.getCurrentPlayerIndex()) as Card[];
    const playPile = this.gameClient.getPlayPile();
    const currentTurn = this.gameClient.getCurrentTurn();
    const allPlayerHands = this.gameClient.getPlayerHands() as Card[][];
    if (this.gameClient.isValidPlay(selectedCards, playPile, playerHand, currentTurn, allPlayerHands)) {
      this.gameClient.play(selectedCards);
    } else {
      log("Invalid play", selectedCards);
    }
  }
}
