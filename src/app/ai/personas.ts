import type { GameClient } from "../game/client.js";
import type { Card } from "../game/deck.js";
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
  create: (gameClient: GameClient) => AI;
}

export const AI_PERSONAS: Record<string, AIPersonaMetadata> = {
  // Simple Personas
  random: {
    name: "random",
    friendly_name: "Random",
    description: "Plays a random valid move.",
    icon: "\uD83C\uDFB2",
    create: (gameClient: GameClient) => new RandomAI(gameClient, "random"),
  },
  cautious: {
    name: "cautious",
    friendly_name: "Cautious",
    description: "Plays a combination with the lowest card.",
    icon: "\uD83D\uDEE1\uFE0F",
    create: (gameClient: GameClient) => new LowestCardAI(gameClient, "cautious"),
  },
  aggressive: {
    name: "aggressive",
    friendly_name: "Aggressive",
    description: "Plays a combination with the highest card.",
    icon: "\u2694\uFE0F",
    create: (gameClient: GameClient) => new HighestCardAI(gameClient, "aggressive"),
  },
  low_stakes: {
    name: "low_stakes",
    friendly_name: "Low Stakes",
    description: "Plays the combination with the lowest total value.",
    icon: "\uD83D\uDCC9",
    create: (gameClient: GameClient) => new LowestValueAI(gameClient, "low_stakes"),
  },
  high_stakes: {
    name: "high_stakes",
    friendly_name: "High Stakes",
    description: "Plays the combination with the highest total value.",
    icon: "\uD83D\uDCC8",
    create: (gameClient: GameClient) => new HighestValueAI(gameClient, "high_stakes"),
  },
  passive: {
    name: "passive",
    friendly_name: "Passive",
    description: "Passes whenever possible. When forced to play, plays the lowest card.",
    icon: "\uD83E\uDDD8",
    create: (gameClient: GameClient) =>
      new PassAI(gameClient, new LowestCardAI(gameClient, "passive"), "passive"),
  },
  // Combo Personas
  opportunist: {
    name: "opportunist",
    friendly_name: "Opportunist",
    description: "Tries to play high-value combos, otherwise plays low-value cards.",
    icon: "\uD83C\uDFAF",
    create: (gameClient: GameClient) =>
      new PrioritizedComboAI(
        gameClient,
        [
          new HighestValueAI(gameClient, "opportunist"),
          new HighestCardAI(gameClient, "opportunist"),
          new LowestCardAI(gameClient, "opportunist"),
        ],
        "opportunist",
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
          new HighestCardAI(gameClient, "unpredictable"),
          new HighestValueAI(gameClient, "unpredictable"),
          new LowestCardAI(gameClient, "unpredictable"),
          new LowestValueAI(gameClient, "unpredictable"),
          new PassAI(gameClient, new LowestCardAI(gameClient, "unpredictable"), "unpredictable"),
          new RandomAI(gameClient, "unpredictable"),
        ],
        "unpredictable",
      ),
  },
};
