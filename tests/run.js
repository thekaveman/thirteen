import { log } from "../src/utils.js";
import { runTests } from "./utils.js";
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { uiTests } from "./test_ui.js";

export const TEST_CONFIG = {
  Deck: deckTests,
  Game: gameTests,
  UI: uiTests,
};

if (typeof window !== "undefined") {
  window.onload = () => {
    log("Running tests");

    const body = document.getElementById("root");

    const lastRun = document.getElementById("last-run");
    lastRun.textContent = new Date().toLocaleString();

    const rerunButton = document.getElementById("rerun-button");
    rerunButton.addEventListener("click", () => {
      window.location.reload();
    });

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
}
