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
    create: (game) => new RandomAI(game, "random"),
  },
  cautious: {
    name: "cautious",
    friendly_name: "Cautious",
    description: "Plays a combination with the lowest card.",
    icon: "🛡️",
    create: (game) => new LowestCardAI(game, "cautious"),
  },
  aggressive: {
    name: "aggressive",
    friendly_name: "Aggressive",
    description: "Plays a combination with the highest card.",
    icon: "⚔️",
    create: (game) => new HighestCardAI(game, "aggressive"),
  },
  low_stakes: {
    name: "low_stakes",
    friendly_name: "Low Stakes",
    description: "Plays the combination with the lowest total value.",
    icon: "📉",
    create: (game) => new LowestValueAI(game, "low_stakes"),
  },
  high_stakes: {
    name: "high_stakes",
    friendly_name: "High Stakes",
    description: "Plays the combination with the highest total value.",
    icon: "📈",
    create: (game) => new HighestValueAI(game, "high_stakes"),
  },
  passive: {
    name: "passive",
    friendly_name: "Passive",
    description: "Passes whenever possible. When forced to play, plays the lowest card.",
    icon: "🧘",
    create: (game) => new PassAI(game, new LowestCardAI(game, "passive"), "passive"),
  },
  // Combo Personas
  opportunist: {
    name: "opportunist",
    friendly_name: "Opportunist",
    description: "Tries to play high-value combos, otherwise plays low-value cards.",
    icon: "🎯",
    create: (game) =>
      new PrioritizedComboAI(
        game,
        [new HighestValueAI(game, "opportunist"), new HighestCardAI(game, "opportunist"), new LowestCardAI(game, "opportunist")],
        "opportunist"
      ),
  },
  unpredictable: {
    name: "unpredictable",
    friendly_name: "Unpredictable",
    description: "Randomly chooses between different strategies.",
    icon: "🎭",
    create: (game) =>
      new RandomComboAI(
        game,
        [
          new HighestCardAI(game, "unpredictable"),
          new HighestValueAI(game, "unpredictable"),
          new LowestCardAI(game, "unpredictable"),
          new LowestValueAI(game, "unpredictable"),
          new RandomAI(game, "unpredictable"),
        ],
        "unpredictable"
      ),
  },
};
