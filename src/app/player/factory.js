import { AI_PERSONAS } from "../ai/personas.js";
import { Game } from "../game/index.js";
import { UI } from "../ui.js";
import { AIPlayer } from "./ai.js";
import { Player } from "./base.js";
import { HumanPlayer } from "./human.js";
import { PLAYER_TYPES } from "./index.js";

/**
 * Creates a player instance based on the provided configuration.
 * @param {object} config The player configuration.
 * @param {Game} config.game The game instance.
 * @param {string} config.type The type of player ('human' or 'ai').
 * @param {number} config.number The player number.
 * @param {UI} [config.ui] The UI instance (for human players).
 * @param {string} [config.persona] The AI persona to use (for AI players).
 * @returns {Player} The created player instance.
 */
export function createPlayer(config) {
  const { game, type, number, ui, persona } = config;

  if (type === PLAYER_TYPES.HUMAN) {
    return new HumanPlayer(game, number, ui);
  }

  if (type === PLAYER_TYPES.AI) {
    const aiPersona = AI_PERSONAS[persona];
    if (!aiPersona) {
      throw new Error(`Unknown AI persona: ${persona}`);
    }
    const ai = aiPersona.create(game);
    return new AIPlayer(game, number, ai);
  }

  throw new Error(`Unknown player type: ${type}`);
}
