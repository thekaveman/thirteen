export { AIPlayer } from "./ai";
export { Player } from "./base";
export { createPlayer } from "./factory";
export { HumanPlayer } from "./human";

export const PLAYER_TYPES = {
  AI: "ai",
  HUMAN: "human",
} as const;
