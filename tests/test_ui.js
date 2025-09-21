import { assert, mockSetTimeout, restoreSetTimeout } from "./utils.js";
import { Card } from "../src/deck.js";
import { HumanPlayer, AIPlayer } from "../src/player.js";
import { UI } from "../src/ui.js";
import { MockDeck, MockGame } from "./mocks.js";

const TEST_UI_ID = "test-ui";

/**
  Setup function to run before each test
*/
function testSetup() {
  const game = new MockGame(MockDeck);
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
  const players = [new HumanPlayer(game, 0, uiInstance), new AIPlayer(game, 1, uiInstance), new HumanPlayer(game, 2, uiInstance)];
  game.setPlayers(players);
  game.start();

  // Set consistent initial game state for UI tests
  game.gameState.playerHands = [
    [new Card("3", "♠"), new Card("4", "♦")],
    [new Card("5", "♣"), new Card("6", "♥")],
    [new Card("7", "♣"), new Card("8", "♥")],
  ];
  game.gameState.roundsWon = [0, 0, 0];
  game.gameState.gamesWon = [0, 0, 0];
  game.gameState.currentPlayer = 0; // Default current player for UI tests

  uiInstance.init(game);

  // Ensure buttons are in a known state for tests that check them
  uiInstance.playButton.style.display = "block";
  uiInstance.passButton.style.display = "block";
  uiInstance.newGameButton.style.display = "none";
  uiInstance.startGameButton.style.display = "none";

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

  assert(ui.gameContent.innerHTML.includes("<h2>Play Area (Round 1) <span class=\"combination-type-indicator\">Open</span></h2>"), "Should clear the play area before rendering");
  testTeardown();
}

function test_renderPlayerHand_rendersCards() {
  const ui = testSetup();
  const playerHandDiv = document.createElement("div");

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

  assert(ui.playButton.style.display === "none", "Play button should be hidden");
  assert(ui.passButton.style.display === "none", "Pass button should be hidden");
  assert(ui.newGameButton.style.display === "block", "New game button should be visible");
  assert(ui.startGameButton.style.display === "none", "Start game button should be hidden");
  testTeardown();
}

function test_updateButtonStates_gameNotOver() {
  const ui = testSetup();
  ui.game.gameState.gameOver = false;
  ui.game.gameState.currentTurn = 1; // Simulate game in progress

  ui.updateButtonStates();

  assert(ui.playButton.style.display === "block", "Play button should be visible");
  assert(ui.passButton.style.display === "block", "Pass button should be visible");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
  assert(ui.startGameButton.style.display === "none", "Start game button should be hidden");
  testTeardown();
}

function test_updateButtonStates_gameNotStarted() {
  const ui = testSetup();
  ui.game.gameState.gameOver = false;
  ui.game.gameState.currentTurn = 0; // Simulate game not started
  ui.game.gameState.currentPlayer = 0; // Human player is first

  ui.updateButtonStates();

  assert(ui.playButton.style.display === "block", "Play button should be visible");
  assert(ui.passButton.style.display === "block", "Pass button should be visible");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
  assert(ui.startGameButton.style.display === "none", "Start game button should be hidden");
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
  test_updateButtonStates_gameNotStarted,
];
