// Load tests, configure, and run
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { playerTests } from "./test_player.js";
import { aiTests } from "./test_ai.js";
import { uiTests } from "./test_ui.js";
import { appTests } from "./test_app.js";

export const TEST_CONFIG = {
  Deck: deckTests,
  Game: gameTests,
  Player: playerTests,
  AI: aiTests,
  UI: uiTests,
  App: appTests,
};
