import { assert, mockSetTimeout, restoreSetTimeout } from "./utils.js";
import { Card } from "../src/deck.js";
import { HumanPlayer } from "../src/player.js";
import { UI } from "../src/ui.js";
import { MockDeck, MockGame } from "./mocks.js";

const TEST_UI_ID = "test-ui";

/**
  Setup function to run before each test
*/
function testSetup() {
  const game = new MockGame();
  const uiInstance = new UI(game);

  // Mock setTimeout and clearTimeout
  mockSetTimeout();

  // create mock UI elements
  const container = document.createElement("div");
  container.id = TEST_UI_ID;
  container.style.display = "none";

  for (const [_, value] of Object.entries(uiInstance.id)) {
    const el = document.createElement("div");
    el.id = value;
    container.appendChild(el);
  }
  document.body.appendChild(container);

  // Reset game state for a clean test environment
  game.reset();
  const playerTypes = ["human", "human"];
  const players = playerTypes.map((type, index) => new HumanPlayer(game, index, uiInstance));
  game.start(MockDeck, players);

  uiInstance.init(game);

  // Ensure buttons are in a known state for tests that check them
  uiInstance.playButton.disabled = false;
  uiInstance.passButton.disabled = false;
  uiInstance.newGameButton.style.display = "none";

  return uiInstance; // Return the ui instance
}

/**
  Teardown function to run after each test
*/
function testTeardown() {
  const testUI = document.getElementById(TEST_UI_ID);
  if (testUI) {
    testUI.remove();
  }
  // Restore original setTimeout and clearTimeout
  restoreSetTimeout();
}

function test_createCardElement() {
  const ui = testSetup();
  const card = new Card("A", "♠");
  const cardElement = ui.createCardElement(card);

  assert(cardElement.textContent.includes(card.rank), "Should create a card element with the correct rank");
  assert(cardElement.textContent.includes(card.suit), "Should create a card element with the correct suit");
  assert(cardElement.classList.contains("card"), "Should have the card class");
  assert(cardElement.classList.contains("black"), "Should have the black class for a spade");
  assert(cardElement.dataset.card === JSON.stringify(card), "Should have the card data attribute");
  testTeardown();
}

function test_render_displaysGameInfo() {
  const ui = testSetup();
  ui.gameContent.innerHTML = "";
  ui.playersHands.innerHTML = "";

  ui.game.gameState.roundNumber = 5;
  ui.game.gameState.roundsWon = [2, 3];
  ui.game.gameState.gamesWon = [1, 0];
  ui.game.gameState.playerHands = [[], []];

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
  testTeardown();
}

function test_renderPlayArea_clearsGameContentBeforeRendering() {
  const ui = testSetup();
  ui.game.gameState.playPile = [];
  ui.game.gameState.roundNumber = 1;

  ui.renderPlayArea();

  assert(ui.gameContent.innerHTML.includes("<h2>Play Area (Round 1)</h2>"), "Should clear the play area before rendering");
  testTeardown();
}

function test_renderPlayerHand_rendersCards() {
  const ui = testSetup();
  const playerHandDiv = document.createElement("div");
  ui.game.gameState.playerHands = [[new Card("A", "♠")]];
  ui.game.gameState.roundsWon = [0];
  ui.game.gameState.gamesWon = [0];
  ui.game.gameState.players = ui.game.gameState.playerTypes.map((type, index) => new HumanPlayer(ui.game, index, ui));

  // Ensure player 0 is the current player for this test
  ui.game.gameState.currentPlayer = 0;

  ui.renderPlayerHand(0, playerHandDiv);

  const cardElement = playerHandDiv.querySelector(".card");
  assert(cardElement, "Should render a card element");
  testTeardown();
}

function test_renderPlayerHands_rendersCorrectNumberOfHands() {
  const ui = testSetup();
  ui.playersHands.innerHTML = "";
  ui.game.gameState.playerHands = [[], [], []];

  ui.renderPlayerHands();

  const playerHandElements = ui.playersHands.querySelectorAll(".player-hand");
  assert(playerHandElements.length === 3, "Should render the correct number of player hands");
  testTeardown();
}

function test_updateButtonStates_gameOver() {
  const ui = testSetup();
  ui.game.gameState.gameOver = true;

  ui.updateButtonStates();

  assert(ui.playButton.disabled, "Play button should be disabled");
  assert(ui.passButton.disabled, "Pass button should be disabled");
  assert(ui.newGameButton.style.display === "block", "New game button should be visible");
  testTeardown();
}

function test_updateButtonStates_gameNotOver() {
  const ui = testSetup();
  ui.game.gameState.gameOver = false;

  ui.updateButtonStates();

  assert(!ui.playButton.disabled, "Play button should be enabled");
  assert(!ui.passButton.disabled, "Pass button should be enabled");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
  testTeardown();
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
