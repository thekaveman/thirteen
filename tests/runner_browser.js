import { init } from "../src/app/app.js";
import { log } from "../src/app/utils.js";
import { TEST_CONFIG } from "./config.js";
import { runTests, mockSetTimeout, restoreSetTimeout } from "./utils.js";

if (typeof window !== "undefined") {
  let allTestsRun = 0;
  let allTestsPassed = 0;

  const stateKey = `${Game.STATE_KEY}-tests`;
  window.localStorage.removeItem(stateKey);

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

  // Dynamically load the game-container from src/index.html
  fetch("../src/index.html")
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const gameContainer = doc.getElementById("game-container");
      if (gameContainer) {
        gameContainer.style.display = "none"; // Hide the game UI
        document.body.appendChild(gameContainer);
      }

      // Mock setTimeout for app initialization
      mockSetTimeout();
      init();
      restoreSetTimeout();

      for (const [name, tests] of Object.entries(TEST_CONFIG)) {
        log(`Running tests: ${name} [${tests.length}]`);
        let testsRun = 0;
        let testsPassed = 0;
        tests.forEach((test) => {
          test.beforeEach = () => {
            window.localStorage.removeItem(stateKey);
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
        overallResults.style.color = "green";
      } else {
        overallResults.textContent = `Some tests failed [${allTestsRun - allTestsPassed} / ${allTestsRun}]`;
        overallResults.style.color = "red";
      }
      lastRun.appendChild(overallResults);

      log("Testing complete");
    })
    .catch((error) => {
      console.error("Error loading game container:", error);
    })
    .finally(() => {
      window.localStorage = originalLocalStorage;
    });
}
