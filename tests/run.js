import { log } from "../src/utils.js";
import { runTests } from "./utils.js";
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { uiTests } from "./test_ui.js";

const TEST_CONFIG = {
  Deck: deckTests,
  Game: gameTests,
  UI: uiTests,
};

window.onload = () => {
  log("Running tests");

  const body = document.getElementById("root");

  for (const [name, tests] of Object.entries(TEST_CONFIG)) {
    log("Running tests: " + name);
    const heading = document.createElement("h2");
    const results = document.createElement("ul");
    heading.textContent = name;
    runTests(tests, results);
    body.appendChild(heading);
    body.appendChild(results);
  }

  log("Testing complete");
};
