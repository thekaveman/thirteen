import { log } from "../src/utils.js";
import { TEST_CONFIG } from "./config.js";
import { runTests, mockSetTimeout, restoreSetTimeout } from "./utils.js";
import { LowestCardAI } from "../src/ai.js";
import { App } from "../src/app.js";
import { Deck } from "../src/deck.js";
import { Game } from "../src/game.js";
import { UI } from "../src/ui.js";

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

    // Create a new Game instance for each test suite
    const deck = new Deck();
    const game = new Game(deck);
    const ai = new LowestCardAI(game);
    const ui = new UI(game);
    const app = new App(game, ai, ui);

    // Mock setTimeout for app initialization
    mockSetTimeout();
    app.init((handler, delay) => {
      // This handler is called by app.init, but we don't want it to actually set a timeout
      // We just want to ensure the app's internal setTimeout is mocked.
    });
    restoreSetTimeout();

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

      runTests(tests, resultsList, { gameInstance: game });

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
      overallResults.style.color = "green";
    } else {
      overallResults.textContent = `Some tests failed [${allTestsRun - allTestsPassed} / ${allTestsRun}]`;
      overallResults.style.color = "red";
    }
    lastRun.appendChild(overallResults);

    log("Testing complete");
  };
}
