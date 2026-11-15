export { AI } from "./base";
export { ComboAI } from "./combo";
export { HighestCardAI } from "./highest_card";
export { HighestValueAI } from "./highest_value";
export { LowestCardAI } from "./lowest_card";
export { LowestValueAI } from "./lowest_value";
export { PassAI } from "./pass";
export { AI_PERSONAS } from "./personas";
export { PrioritizedComboAI } from "./prioritized_combo";
export { RandomAI } from "./random";
export { RandomComboAI } from "./random_combo";

export const AI_TYPES = {
  LOWEST_CARD: "lowest_card",
  HIGHEST_CARD: "highest_card",
  LOWEST_VALUE: "lowest_value",
  HIGHEST_VALUE: "highest_value",
  RANDOM: "random",
  PASS: "pass",
  PRIORITIZED_COMBO: "prioritized_combo",
  RANDOM_COMBO: "random_combo",
} as const;
