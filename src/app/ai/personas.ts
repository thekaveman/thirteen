import type { GameClient } from "../game/client.js";
import { AI } from "./base.js";
import { HighestCardAI } from "./highest_card.js";
import { HighestValueAI } from "./highest_value.js";
import { LowestCardAI } from "./lowest_card.js";
import { LowestValueAI } from "./lowest_value.js";
import { PassAI } from "./pass.js";
import { PrioritizedComboAI } from "./prioritized_combo.js";
import { RandomAI } from "./random.js";
import { RandomComboAI } from "./random_combo.js";

export interface AIPersonaMetadata {
  name: string;
  friendly_name: string;
  description: string;
  icon: string;
  create: (_gameClient: GameClient) => AI;
}

export const AI_PERSONAS: Record<string, AIPersonaMetadata> = {
  random: {
    name: "random",
    friendly_name: "Random",
    description: "Plays a random valid move with no strategy or pattern.",
    icon: "\uD83C\uDFB2",
    create: (gameClient: GameClient) => new RandomAI(gameClient, AI_PERSONAS.random.name),
  },
  conservative: {
    name: "conservative",
    friendly_name: "Conservative",
    description: "Plays the combination with the lowest card to conserve stronger cards.",
    icon: "\uD83D\uDEE1\uFE0F",
    create: (gameClient: GameClient) => new LowestCardAI(gameClient, AI_PERSONAS.conservative.name),
  },
  aggressive: {
    name: "aggressive",
    friendly_name: "Aggressive",
    description: "Commits the highest card or combination available. Plays to take control early.",
    icon: "\u2694\uFE0F",
    create: (gameClient: GameClient) => new HighestCardAI(gameClient, AI_PERSONAS.aggressive.name),
  },
  passive: {
    name: "passive",
    friendly_name: "Passive",
    description: "Passes whenever possible. Only plays when forced by the game rules.",
    icon: "\uD83E\uDDD8",
    create: (gameClient: GameClient) =>
      new PassAI(gameClient, new LowestCardAI(gameClient, AI_PERSONAS.passive.name), AI_PERSONAS.passive.name),
  },
  // Combo Personas
  opportunist: {
    name: "opportunist",
    friendly_name: "Opportunist",
    description: "Favors high-value moves but falls back to lower-value plays when needed.",
    icon: "\uD83C\uDFAF",
    create: (gameClient: GameClient) =>
      new PrioritizedComboAI(
        gameClient,
        [
          new HighestValueAI(gameClient, AI_PERSONAS.opportunist.name),
          new HighestCardAI(gameClient, AI_PERSONAS.opportunist.name),
          new LowestCardAI(gameClient, AI_PERSONAS.opportunist.name),
        ],
        AI_PERSONAS.opportunist.name,
      ),
  },
  unpredictable: {
    name: "unpredictable",
    friendly_name: "Unpredictable",
    description: "Randomly chooses between different strategies.",
    icon: "\uD83C\uDFAD",
    create: (gameClient: GameClient) =>
      new RandomComboAI(
        gameClient,
        [
          new HighestCardAI(gameClient, AI_PERSONAS.unpredictable.name),
          new HighestValueAI(gameClient, AI_PERSONAS.unpredictable.name),
          new LowestCardAI(gameClient, AI_PERSONAS.unpredictable.name),
          new LowestValueAI(gameClient, AI_PERSONAS.unpredictable.name),
          new PassAI(gameClient, new LowestCardAI(gameClient, AI_PERSONAS.unpredictable.name), AI_PERSONAS.unpredictable.name),
          new RandomAI(gameClient, AI_PERSONAS.unpredictable.name),
        ],
        AI_PERSONAS.unpredictable.name,
      ),
  },
};
