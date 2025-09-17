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

// Load game state (mock if necessary, or ensure it's reset for each test)
import { gameState } from "../src/game.js";
global.gameState = gameState;

// Load UI module
import ui from "../src/ui.js";
global.ui = ui;

// Load test utilities
import { assert, runTests } from "./utils.js";
global.assert = assert; // Make assert globally available for test files

// Load tests, configure, and run
import { deckTests } from "./test_deck.js";
import { gameTests } from "./test_game.js";
import { uiTests } from "./test_ui.js";

const TEST_CONFIG = {
  Deck: deckTests,
  Game: gameTests,
  UI: uiTests,
};

let testsRun = 0;
let testsPassed = 0;

for (const [name, tests] of Object.entries(TEST_CONFIG)) {
  process.stdout.write(`\n== Running tests: ${name}\n`);
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
  runTests(tests, mockResults);
}

if (testsPassed != testsRun) {
  const testsFailed = testsRun - testsPassed;
  process.stderr.write(`\nSome tests failed [${testsFailed} / ${testsRun}]\n`);
  process.exit(1);
} else {
  process.stdout.write(`\nAll tests passed [${testsPassed} / ${testsRun}]\n`);
  process.exit(0);
}
