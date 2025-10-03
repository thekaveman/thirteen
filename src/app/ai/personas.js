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
    create: (game) => new RandomAI(game),
  },
  lowest_card: {
    name: "Cautious",
    description: "Plays a combination with the lowest card.",
    create: (game) => new LowestCardAI(game),
  },
  highest_card: {
    name: "Aggressive",
    description: "Plays a combination with the highest card.",
    create: (game) => new HighestCardAI(game),
  },
  lowest_value: {
    name: "Low Stakes",
    description: "Plays the combination with the lowest total value.",
    create: (game) => new LowestValueAI(game),
  },
  highest_value: {
    name: "High Stakes",
    description: "Plays the combination with the highest total value.",
    create: (game) => new HighestValueAI(game),
  },
  passer: {
    name: "Passer",
    description: "Passes whenever possible. When forced to play, plays the lowest card.",
    create: (game) => new PassAI(game, new LowestCardAI(game)),
  },
  // Combo Personas
  opportunist: {
    name: "Opportunist",
    description: "Tries to play high-value combos, otherwise plays low-value cards.",
    create: (game) => new PrioritizedComboAI(game, [new HighestValueAI(game), new HighestCardAI(game), new LowestCardAI(game)]),
  },
  unpredictable: {
    name: "Unpredictable",
    description: "Randomly chooses between different strategies.",
    create: (game) => new RandomComboAI(game, [new HighestCardAI(game), new LowestCardAI(game), new RandomAI(game)]),
  },
};
