// Load tests, configure, and run
import { aiTests } from "./test_ai.js";
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { playerTests } from "./test_player.js";
import { uiTests } from "./test_ui.js";

export const TEST_CONFIG = {
  AI: aiTests,
  Deck: deckTests,
  Game: gameTests,
  Player: playerTests,
  UI: uiTests,
};
