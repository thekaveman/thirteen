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
import { createDeck } from "../src/deck.js";

// Load player module
import { HumanPlayer, AIPlayer } from "../src/player.js";

// Load UI module
import { UI } from "../src/ui.js";

// Load AI module
import { LowestCardAI } from "../src/ai.js";

// Load app module
import { App } from "../src/app.js";

// Load test utilities
import { assert, runTests } from "./utils.js";
global.assert = assert; // Make assert globally available for test files

import { TEST_CONFIG } from "./config.js";

let testsRun = 0;
let testsPassed = 0;

for (const [name, tests] of Object.entries(TEST_CONFIG)) {
  // Create a new Game instance for each test suite
  const gameInstance = new Game();
  const deck = createDeck();
  const app = new App(deck, gameInstance, LowestCardAI, UI);

  app.init();

  process.stdout.write(`\n== Running tests: ${name} [${tests.length}]\n`);
  const mockResults = {
    innerHTML: "",
    appendChild: (li) => {
      testsRun++;
      const text = li.textContent;
      const color = li.style.color;
      if (color === "red") {
        process.stderr.write("> " + text + "\n");
      } else {
        testsPassed++;
        process.stdout.write("> " + text + "\n");
      }
    },
  };
  runTests(tests, mockResults, { gameInstance });

if (testsPassed != testsRun) {
  const testsFailed = testsRun - testsPassed;
  process.stderr.write(`\nSome tests failed [${testsFailed} / ${testsRun}]\n`);
  process.exit(1);
} else {
  process.stdout.write(`\nAll tests passed [${testsPassed} / ${testsRun}]\n`);
  process.exit(0);
}
