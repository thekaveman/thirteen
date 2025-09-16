import { JSDOM } from "jsdom";

// Set up JSDOM environment
const dom = new JSDOM(
  `<!DOCTYPE html><html><body><div id="root"></div><div id="play-area"><div id="game-content"></div></div><div id="game-messages"></div><div id="players-hands"></div><div id="game-controls"><button id="play-button"></button><button id="pass-button"></button><button id="new-game-button"></button></div></body></html>`,
  {
    url: "http://localhost",
    resources: "usable",
    runScripts: "dangerously",
  }
);
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Node = dom.window.Node;
global.alert = () => {}; // Provide a no-op mock for alert

// Load UI module
import ui from "../src/ui.js";
global.ui = ui;
ui.init();

// Load UI module (mock if necessary)

// Load test utilities
import { assert, runTests } from "./utils.js";
global.assert = assert; // Make assert globally available for test files

// Load game state (mock if necessary, or ensure it's reset for each test)
import { gameState } from "../src/game.js";
global.gameState = gameState;

// Load test files
import { TEST_CONFIG } from "./run.js";

let allTestsPassed = true;

for (const [name, tests] of Object.entries(TEST_CONFIG)) {
  process.stdout.write(`\n--- Running ${name} Tests ---\n`);
  const mockResults = {
    innerHTML: "",
    appendChild: (li) => {
      const text = li.textContent;
      const color = li.style.color;
      if (color === "red") {
        allTestsPassed = false;
        process.stderr.write(text + '\n');
      } else {
        process.stdout.write(text + '\n');
      }
    },
  };
  runTests(tests, mockResults);
}

if (!allTestsPassed) {
  process.stderr.write("\nSome tests failed!\n");
  process.exit(1);
} else {
  process.stdout.write("\nAll tests passed!\n");
  process.exit(0);
}