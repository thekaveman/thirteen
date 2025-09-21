import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, "../src/index.html"), "utf8");
const dom = new JSDOM(html, {
  url: "http://localhost",
  resources: "usable",
  runScripts: "dangerously",
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.alert = () => {}; // Provide a no-op mock for alert

// Populate the document body with the HTML content
dom.window.document.body.innerHTML = html;

// Load game module
import { Game } from "../src/game.js";

// Load deck module
import { Deck } from "../src/deck.js";

// Load player module
import { HumanPlayer, AIPlayer } from "../src/player.js";

// Load UI module
import { UI } from "../src/ui.js";

// Load AI module
import { LowestCardAI } from "../src/ai.js";

// Load app module
import { App } from "../src/app.js";

// Load test utilities
import { assert, runTests, mockSetTimeout, restoreSetTimeout } from "./utils.js";
global.assert = assert; // Make assert globally available for test files

import { TEST_CONFIG } from "./config.js";

let allTestsRun = 0;
let allTestsPassed = 0;
let allTestsFailed = [];

for (const [name, tests] of Object.entries(TEST_CONFIG)) {
  let testsRun = 0;
  let testsPassed = 0;
  // Create a new Game instance for each test suite
  const game = new Game();
  const deck = new Deck();
  const ai = new LowestCardAI(game);
  const ui = new UI(game);
  game.gameState.playerTypes = ["human", "human"];

  const app = new App(deck, game, ai, ui);

  // Mock setTimeout for app initialization
  mockSetTimeout();
  app.init((handler, delay) => {
    // This handler is called by app.init, but we don't want it to actually set a timeout
    // We just want to ensure the app's internal setTimeout is mocked.
  });
  restoreSetTimeout();

  process.stdout.write(`\n== Running tests: ${name} [${tests.length}]\n`);
  const mockResults = {
    innerHTML: "",
    appendChild: (li) => {
      allTestsRun++;
      testsRun++;
      const text = li.textContent;
      const color = li.style.color;
      if (color === "red") {
        process.stderr.write("> " + text + "\n");
        allTestsFailed.push(text);
      } else {
        allTestsPassed++;
        testsPassed++;
      }
    },
  };
  runTests(tests, mockResults, { gameInstance: game });
  process.stdout.write(`Result: [${testsPassed} / ${testsRun}] passed\n`);
}

if (allTestsPassed != allTestsRun) {
  const testsFailed = allTestsRun - allTestsPassed;
  allTestsFailed.forEach((test) => {
    process.stderr.write(`\n${test}`);
  });
  process.stderr.write(`\nSome tests failed [${testsFailed} / ${allTestsRun}]\n`);
  process.exit(1);
} else {
  process.stdout.write(`\nAll tests passed [${allTestsPassed} / ${allTestsRun}]\n`);
  process.exit(0);
}
