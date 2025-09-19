// Load tests, configure, and run
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { uiTests } from "./test_ui.js";
import { playerTests } from "./test_player.js";

export const TEST_CONFIG = {
  Deck: deckTests,
  Game: gameTests,
  Player: playerTests,
  UI: uiTests,
};
