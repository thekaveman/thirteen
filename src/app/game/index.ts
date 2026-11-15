export { Card, Deck } from "./deck";
export { GameClient } from "./client.js";
export { Game } from "./game.js";
export { Rules } from "./rules";

export const SUITS: readonly string[] = ["♠", "♣", "♦", "♥"];
export const RANKS: readonly string[] = ["3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A", "2"];
export const COMBINATION_TYPES = {
  SINGLE: "single",
  PAIR: "pair",
  TRIPLE: "triple",
  STRAIGHT: "straight",
  CONSECUTIVE_PAIRS: "consecutive_pairs",
  FOUR_OF_A_KIND: "four_of_a_kind",
  INVALID: "invalid",
} as const;
