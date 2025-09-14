import { log, runTests } from "./utils.js";

const TEST_CONFIG = {};

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
