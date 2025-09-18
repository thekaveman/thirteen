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

let allTestsRun = 0;
let allTestsPassed = 0;

if (typeof window !== "undefined") {
  window.onload = () => {
    log("Running tests");

    const body = document.getElementById("root");

    const lastRun = document.getElementById("last-run");
    const ts = document.createElement("p");
    ts.textContent = new Date().toLocaleString();
    lastRun.appendChild(ts);

    const rerunButton = document.getElementById("rerun-button");
    rerunButton.addEventListener("click", () => {
      window.location.reload();
    });

    for (const [name, tests] of Object.entries(TEST_CONFIG)) {
      log(`Running tests: ${name} [${tests.length}]`);
      let testsRun = 0;
      let testsPassed = 0;
      tests.forEach((test) => {
        test.beforeEach = () => {
          allTestsRun++;
          testsRun++;
        };
        test.afterEach = (result) => {
          if (result) {
            allTestsPassed++;
            testsPassed++;
          }
        };
      });
      const heading = document.createElement("h2");
      const results = document.createElement("div");
      const resultsList = document.createElement("ul");
      const resultText = document.createElement("p");

      runTests(tests, resultsList);

      heading.textContent = `${name} [${testsRun}]`;
      body.appendChild(heading);

      if (testsRun == testsPassed) {
        resultText.textContent = `All tests passed [${testsPassed} / ${testsRun}]`;
      } else {
        resultText.textContent = `Some tests failed [${testsRun - testsPassed} / ${testsRun}]`;
      }
      results.appendChild(resultsList);
      results.appendChild(resultText);
      body.appendChild(results);
    }

    const overallResults = document.createElement("p");
    if (allTestsRun == allTestsPassed) {
      overallResults.textContent = `All tests passed [${allTestsPassed} / ${allTestsRun}]`;
    } else {
      overallResults.textContent = `Some tests failed [${allTestsRun - allTestsPassed} / ${allTestsRun}]`;
    }
    lastRun.appendChild(overallResults);

    lastRun.log("Testing complete");
  };
}
