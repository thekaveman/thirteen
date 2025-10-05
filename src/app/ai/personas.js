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
    name: "Random",
    description: "Plays a random valid move.",
    create: (game) => new RandomAI(game, "random"),
  },
  cautious: {
    name: "Cautious",
    description: "Plays a combination with the lowest card.",
    create: (game) => new LowestCardAI(game, "cautious"),
  },
  aggressive: {
    name: "Aggressive",
    description: "Plays a combination with the highest card.",
    create: (game) => new HighestCardAI(game, "aggressive"),
  },
  low_stakes: {
    name: "Low Stakes",
    description: "Plays the combination with the lowest total value.",
    create: (game) => new LowestValueAI(game, "low_stakes"),
  },
  high_stakes: {
    name: "High Stakes",
    description: "Plays the combination with the highest total value.",
    create: (game) => new HighestValueAI(game, "high_stakes"),
  },
  passive: {
    name: "Passive",
    description: "Passes whenever possible. When forced to play, plays the lowest card.",
    create: (game) => new PassAI(game, new LowestCardAI(game, "passive"), "passive"),
  },
  // Combo Personas
  opportunist: {
    name: "Opportunist",
    description: "Tries to play high-value combos, otherwise plays low-value cards.",
    create: (game) =>
      new PrioritizedComboAI(
        game,
        [new HighestValueAI(game, "opportunist"), new HighestCardAI(game, "opportunist"), new LowestCardAI(game, "opportunist")],
        "opportunist"
      ),
  },
  unpredictable: {
    name: "Unpredictable",
    description: "Randomly chooses between different strategies.",
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
