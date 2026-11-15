import type { GameClient } from "../game/client";

export interface PlayerData {
  game: string;
  id: string;
  number: number;
  persona: string | null;
  type: string;
}

export class Player {
  type: string;
  gameClient: GameClient;
  number: number;
  id: string;
  persona: string | null;

  /**
   * @param type The type of player (human or ai).
   * @param gameClient The game client instance.
   * @param number The player number in the underlying game.
   */
  constructor(type: string, gameClient: GameClient, number: number) {
    this.type = type;
    this.gameClient = gameClient;
    this.number = number;
    this.id = crypto.randomUUID();
    this.persona = null;
  }

  data(): PlayerData {
    return { game: this.gameClient.getId(), id: this.id, number: this.number, persona: this.persona, type: this.type };
  }

  takeTurn(): void {
    throw new Error("Subclasses must implement takeTurn");
  }
}
