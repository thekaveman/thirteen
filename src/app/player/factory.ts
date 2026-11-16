import type { GameClient } from "../game/client.js";
import type { AI } from "../ai/base.js";
import { Player } from "./base.js";
import { AIPlayer } from "./ai.js";
import { HumanPlayer } from "./human.js";
import { PLAYER_TYPES } from "./index.js";

export interface PlayerFactoryConfig {
  id: string;
  gameClient: GameClient;
  type: string;
  number: number;
  ui?: unknown;
  persona?: string;
}

/**
 * Creates a player instance based on the provided configuration.
 * @param config The player configuration.
 */
export async function createPlayer(config: PlayerFactoryConfig): Promise<Player> {
  const { id, gameClient, type, number, ui, persona } = config;
  let player: Player | undefined;

  if (type === PLAYER_TYPES.HUMAN) {
    player = new HumanPlayer(gameClient, number);
  }

  if (type === PLAYER_TYPES.AI) {
    // Lazy-load AI_PERSONAS to break circular dependency
    const { AI_PERSONAS } = await import("../ai/personas.js");
    const aiPersonas = AI_PERSONAS as unknown as Record<string, { create: (gc: GameClient) => AI }>;
    const aiPersona = aiPersonas[persona!];
    if (!aiPersona) {
      throw new Error(`Unknown AI persona: ${persona}`);
    }
    const ai = aiPersona.create(gameClient);
    player = new AIPlayer(gameClient, number, ai);
  }

  if (player) {
    if (id) {
      player.id = id;
    }
    return player;
  }

  throw new Error(`Unknown player type: ${type}`);
}
