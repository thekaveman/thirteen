import {
  HighestCardAI,
  HighestValueAI,
  LowestCardAI,
  LowestValueAI,
  PassAI,
  PrioritizedComboAI,
  RandomAI,
  RandomComboAI,
} from "./index.js";

export const AI_PERSONAS = {
  // Simple Personas
  random: {
    name: "random",
    friendly_name: "Random",
    description: "Plays a random valid move.",
    icon: "🎲",
    create: (gameClient) => new RandomAI(gameClient, "random"),
  },
  cautious: {
    name: "cautious",
    friendly_name: "Cautious",
    description: "Plays a combination with the lowest card.",
    icon: "🛡️",
    create: (gameClient) => new LowestCardAI(gameClient, "cautious"),
  },
  aggressive: {
    name: "aggressive",
    friendly_name: "Aggressive",
    description: "Plays a combination with the highest card.",
    icon: "⚔️",
    create: (gameClient) => new HighestCardAI(gameClient, "aggressive"),
  },
  low_stakes: {
    name: "low_stakes",
    friendly_name: "Low Stakes",
    description: "Plays the combination with the lowest total value.",
    icon: "📉",
    create: (gameClient) => new LowestValueAI(gameClient, "low_stakes"),
  },
  high_stakes: {
    name: "high_stakes",
    friendly_name: "High Stakes",
    description: "Plays the combination with the highest total value.",
    icon: "📈",
    create: (gameClient) => new HighestValueAI(gameClient, "high_stakes"),
  },
  passive: {
    name: "passive",
    friendly_name: "Passive",
    description: "Passes whenever possible. When forced to play, plays the lowest card.",
    icon: "🧘",
    create: (gameClient) => new PassAI(gameClient, new LowestCardAI(gameClient, "passive"), "passive"),
  },
  // Combo Personas
  opportunist: {
    name: "opportunist",
    friendly_name: "Opportunist",
    description: "Tries to play high-value combos, otherwise plays low-value cards.",
    icon: "🎯",
    create: (gameClient) =>
      new PrioritizedComboAI(
        gameClient,
        [
          new HighestValueAI(gameClient, "opportunist"),
          new HighestCardAI(gameClient, "opportunist"),
          new LowestCardAI(gameClient, "opportunist"),
        ],
        "opportunist"
      ),
  },
  unpredictable: {
    name: "unpredictable",
    friendly_name: "Unpredictable",
    description: "Randomly chooses between different strategies.",
    icon: "🎭",
    create: (gameClient) =>
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
        "unpredictable"
      ),
  },
};
