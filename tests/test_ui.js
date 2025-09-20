import { assert } from "./utils.js";
import { createCard } from "../src/deck.js";
import { Player } from "../src/player.js";
import { UI } from "../src/ui.js";

const TEST_UI_ID = "test-ui";

let humanPlayer;
let game; // Declare a global variable to hold the game instance
let ui;

const mockDeck = {
  createDeck: () => [
    createCard("3", "♠"),
    createCard("4", "♦"),
    createCard("5", "♣"),
    createCard("6", "♥"),
    createCard("7", "♠"),
    createCard("8", "♦"),
    createCard("9", "♣"),
    createCard("10", "♥"),
    createCard("J", "♠"),
    createCard("Q", "♦"),
    createCard("K", "♣"),
    createCard("A", "♥"),
    createCard("2", "♠"),
    createCard("3", "♦"),
    createCard("4", "♣"),
    createCard("5", "♥"),
    createCard("6", "♠"),
    createCard("7", "♦"),
    createCard("8", "♣"),
    createCard("9", "♥"),
    createCard("10", "♠"),
    createCard("J", "♦"),
    createCard("Q", "♣"),
    createCard("K", "♥"),
    createCard("A", "♠"),
    createCard("2", "♦"),
  ],
  deal: () => [
    [
      createCard("3", "♠"),
      createCard("4", "♦"),
      createCard("5", "♣"),
      createCard("6", "♥"),
      createCard("7", "♠"),
      createCard("8", "♦"),
      createCard("9", "♣"),
      createCard("10", "♥"),
      createCard("J", "♠"),
      createCard("Q", "♦"),
      createCard("K", "♣"),
      createCard("A", "♥"),
      createCard("2", "♠"),
    ],
    [
      createCard("3", "♦"),
      createCard("4", "♣"),
      createCard("5", "♥"),
      createCard("6", "♠"),
      createCard("7", "♦"),
      createCard("8", "♣"),
      createCard("9", "♥"),
      createCard("10", "♠"),
      createCard("J", "♦"),
      createCard("Q", "♣"),
      createCard("K", "♥"),
      createCard("A", "♠"),
      createCard("2", "♦"),
    ],
  ],
  shuffleDeck: () => {},
  sortHand: () => {},
};

let originalSetTimeout;
let originalClearTimeout;
let setTimeoutCalls = [];

/**
  Setup function to run before each test
*/
function testSetup(context) {
  game = context.gameInstance; // Store game instance globally for tests

  // Mock setTimeout and clearTimeout
  originalSetTimeout = global.setTimeout;
  originalClearTimeout = global.clearTimeout;
  setTimeoutCalls = [];
  global.setTimeout = (handler, delay) => {
    setTimeoutCalls.push({ handler, delay });
    return setTimeoutCalls.length - 1; // Return a mock timeout ID
  };
  global.clearTimeout = (id) => {
    if (setTimeoutCalls[id]) {
      setTimeoutCalls[id].cleared = true;
    }
  };

  // create mock UI elements
  ui = new UI(game);

  const container = document.createElement("div");
  container.id = TEST_UI_ID;
  container.style.display = "none";

  for (const [_, value] of Object.entries(ui.id)) {
    const el = document.createElement("div");
    el.id = value;
    container.appendChild(el);
  }
  document.body.appendChild(container);

  ui.init(game);

  // Reset game state for a clean test environment
  game.reset();
  const deck = mockDeck.createDeck();
  game.start(deck);

  game.playerTypes = ["human", "human"];
  game.players = game.playerTypes.map((type) => new Player(type, game, null, ui));
  humanPlayer = game.players[0];

  // Ensure buttons are in a known state for tests that check them
  ui.playButton.disabled = false;
  ui.passButton.disabled = false;
  ui.newGameButton.style.display = "none";
}

/**
  Teardown function to run after each test
*/
function testTeardown() {
  const testUI = document.getElementById(TEST_UI_ID);
  if (testUI) {
    testUI.remove();
  }
  ui = null;
  // Restore original setTimeout and clearTimeout
  global.setTimeout = originalSetTimeout;
  global.clearTimeout = originalClearTimeout;
}

function test_createCardElement() {
  const card = createCard("A", "♠");
  const cardElement = ui.createCardElement(card);

  assert(cardElement.textContent.includes(card.rank), "Should create a card element with the correct rank");
  assert(cardElement.textContent.includes(card.suit), "Should create a card element with the correct suit");
  assert(cardElement.classList.contains("card"), "Should have the card class");
  assert(cardElement.classList.contains("black"), "Should have the black class for a spade");
  assert(cardElement.dataset.card === JSON.stringify(card), "Should have the card data attribute");
}

function test_render_displaysGameInfo() {
  ui.gameContent.innerHTML = "";
  ui.playersHands.innerHTML = "";

  game.gameState.roundNumber = 5;
  game.gameState.roundsWon = [2, 3];
  game.gameState.gamesWon = [1, 0];
  game.gameState.playerHands = [[], []];

  ui.render();

  assert(ui.gameContent.innerHTML.includes("Round 5"), "Should display the current round number");

  const player1Hand = document.getElementById("player-hand-0");
  const player1RoundsWon = player1Hand.querySelector(".rounds-won");
  assert(player1RoundsWon.textContent === "Rounds won: 2", "Should display player 1 rounds won");
  const player1GamesWon = player1Hand.querySelector(".games-won");
  assert(player1GamesWon.textContent === "Games won: 1", "Should display player 1 games won");

  const player2Hand = document.getElementById("player-hand-1");
  const player2RoundsWon = player2Hand.querySelector(".rounds-won");
  assert(player2RoundsWon.textContent === "Rounds won: 3", "Should display player 2 rounds won");
  const player2GamesWon = player2Hand.querySelector(".games-won");
  assert(player2GamesWon.textContent === "Games won: 0", "Should display player 2 games won");
}

function test_renderPlayArea_clearsGameContentBeforeRendering() {
  game.gameState.playPile = [];
  game.gameState.roundNumber = 1;

  ui.renderPlayArea();

  assert(ui.gameContent.innerHTML.includes("<h2>Play Area (Round 1)</h2>"), "Should clear the play area before rendering");
}

function test_renderPlayerHand_rendersCards() {
  const playerHandDiv = document.createElement("div");
  game.gameState.playerHands = [[createCard("A", "♠")]];
  game.gameState.roundsWon = [0];
  game.gameState.gamesWon = [0];

  ui.renderPlayerHand(0, playerHandDiv);

  const cardElement = playerHandDiv.querySelector(".card");
  assert(cardElement, "Should render a card element");
}

function test_renderPlayerHands_rendersCorrectNumberOfHands() {
  ui.playersHands.innerHTML = "";
  game.gameState.playerHands = [[], [], []];

  ui.renderPlayerHands();

  const playerHandElements = ui.playersHands.querySelectorAll(".player-hand");
  assert(playerHandElements.length === 3, "Should render the correct number of player hands");
}

function test_updateButtonStates_gameOver() {
  game.gameState.gameOver = true;

  ui.updateButtonStates();

  assert(ui.playButton.disabled, "Play button should be disabled");
  assert(ui.passButton.disabled, "Pass button should be disabled");
  assert(ui.newGameButton.style.display === "block", "New game button should be visible");
}

function test_updateButtonStates_gameNotOver() {
  game.gameState.gameOver = false;

  ui.updateButtonStates();

  assert(!ui.playButton.disabled, "Play button should be enabled");
  assert(!ui.passButton.disabled, "Pass button should be enabled");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
}

export const uiTests = [
  test_createCardElement,
  test_render_displaysGameInfo,
  test_renderPlayArea_clearsGameContentBeforeRendering,
  test_renderPlayerHand_rendersCards,
  test_renderPlayerHands_rendersCorrectNumberOfHands,
  test_updateButtonStates_gameOver,
  test_updateButtonStates_gameNotOver,
];

uiTests.forEach((test) => {
  if (!test.beforeEach) {
    test.beforeEach = testSetup;
  } else {
    const funcBefore = test.beforeEach;
    test.beforeEach = function (context) {
      testSetup(context);
      funcBefore();
    };
  }

  if (!test.afterEach) {
    test.afterEach = testTeardown;
  } else {
    const funcAfter = test.afterEach;
    test.afterEach = function () {
      funcAfter();
      testTeardown();
    };
  }
});
