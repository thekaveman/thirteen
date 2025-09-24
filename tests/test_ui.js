import {
  assert,
  mockSetTimeout,
  restoreSetTimeout,
  mockAddEventListener,
  restoreAddEventListener,
  getAddEventListenerCalls,
} from "./utils.js";
import { Card } from "../src/app/deck.js";
import { HumanPlayer, AIPlayer } from "../src/app/player.js";
import { UI } from "../src/app/ui.js";
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
  mockAddEventListener();

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
  restoreAddEventListener();
  localStorage.clear();
}

function test_createCardElement() {
  const ui = testSetup();
  const cardBlack = new Card("A", "♠");
  const cardRed = new Card("K", "♦");

  const cardElementBlack = ui.createCardElement(cardBlack);
  assert(cardElementBlack.textContent.includes(cardBlack.rank), "Should create a card element with the correct rank");
  assert(cardElementBlack.textContent.includes(cardBlack.suit), "Should create a card element with the correct suit");
  assert(cardElementBlack.classList.contains("card"), "Should have the card class");
  assert(cardElementBlack.classList.contains("black"), "Should have the black class for a spade");
  assert(cardElementBlack.dataset.card === JSON.stringify(cardBlack), "Should have the card data attribute");

  const cardElementRed = ui.createCardElement(cardRed);
  assert(cardElementRed.classList.contains("red"), "Should have the red class for a diamond");

  testTeardown();
}

function test_render_displaysGameInfo() {
  const ui = testSetup();
  ui.gameContent.innerHTML = "";
  ui.playersHands.innerHTML = "";

  ui.game.gameState.roundNumber = 5;
  ui.game.gameState.roundsWon = [2, 3, 0];
  ui.game.gameState.gamesWon = [1, 0, 0];
  ui.game.gameState.playerHands = [[new Card("3", "♠")], [new Card("4", "♦")], [new Card("5", "♣")]];
  ui.game.gameState.currentPlayer = 0; // Player 1 is current
  ui.game.gameState.players[0].type = "human";
  ui.game.gameState.players[1].type = "ai";
  ui.game.gameState.players[2].type = "human";

  ui.render();

  assert(ui.gameContent.innerHTML.includes("Round 5"), "Should display the current round number");

  const player1HandDiv = document.getElementById("player-hand-0");
  assert(player1HandDiv.querySelector("h2").textContent.includes("Player 1 (Your Turn)"), "Player 1 should show 'Your Turn'");
  assert(player1HandDiv.classList.contains("current"), "Player 1 hand should have 'current' class");
  assert(player1HandDiv.querySelector(".rounds-won").textContent === "Rounds won: 2", "Should display player 1 rounds won");
  assert(player1HandDiv.querySelector(".games-won").textContent === "Games won: 1", "Should display player 1 games won");
  assert(player1HandDiv.querySelector(".card-count").textContent === "Cards remaining: 1", "Should display player 1 card count");

  const player2HandDiv = document.getElementById("player-hand-1");
  assert(player2HandDiv.querySelector("h2").textContent.includes("Player 2 (AI)"), "Player 2 should show 'AI'");
  assert(!player2HandDiv.classList.contains("current"), "Player 2 hand should not have 'current' class");
  assert(player2HandDiv.querySelector(".rounds-won").textContent === "Rounds won: 3", "Should display player 2 rounds won");
  assert(player2HandDiv.querySelector(".games-won").textContent === "Games won: 0", "Should display player 2 games won");
  assert(player2HandDiv.querySelector(".card-count").textContent === "Cards remaining: 1", "Should display player 2 card count");

  testTeardown();
}

function test_renderPlayArea_clearsGameContentBeforeRendering() {
  const ui = testSetup();
  ui.game.gameState.playPile = [];
  ui.game.gameState.roundNumber = 1;

  ui.renderPlayArea();

  assert(
    ui.gameContent.innerHTML.includes('<h2>Play Area (Round 1) <span class="combination-type">🟢</span></h2>'),
    "Should clear the play area before rendering"
  );
  testTeardown();
}

function test_renderPlayerHand_rendersCards() {
  const ui = testSetup();
  const playerHandDiv = document.createElement("div");
  ui.game.gameState.playerHands[0] = [new Card("A", "♠"), new Card("K", "♦")];
  ui.game.gameState.currentPlayer = 0;
  ui.game.gameState.players[0].type = "human";

  ui.renderPlayerHand(0, playerHandDiv);

  const cardElements = playerHandDiv.querySelectorAll(".card");
  assert(cardElements.length === 2, "Should render all cards in the hand");
  assert(cardElements[0].textContent === "A♠", "First card should be A♠");
  assert(cardElements[1].textContent === "K♦", "Second card should be K♦");
  assert(cardElements[0].dataset.card === JSON.stringify(new Card("A", "♠")), "Card data attribute should be correct");
  assert(cardElements[0].hasAttribute("data-card"), "Card element should have data-card attribute");

  // Test event listener
  const calls = getAddEventListenerCalls();
  const clickListenerAdded = calls.some((call) => call.event === "click" && call.target === cardElements[0]);
  assert(clickListenerAdded, "Click event listener should be attached to human player's cards");

  testTeardown();
}

function test_renderPlayerHands_rendersCorrectNumberOfHands() {
  const ui = testSetup();
  ui.playersHands.innerHTML = "";
  ui.game.gameState.playerHands = [[], [], []];
  ui.game.gameState.players[0].type = "human";
  ui.game.gameState.players[1].type = "ai";
  ui.game.gameState.players[2].type = "human";
  ui.game.gameState.currentPlayer = 1; // AI is current player

  ui.renderPlayerHands();

  const playerHandElements = ui.playersHands.querySelectorAll(".player-hand");
  assert(playerHandElements.length === 3, "Should render the correct number of player hands");

  assert(document.getElementById("player-hand-0").classList.contains("human"), "Player 0 hand should have 'human' class");
  assert(
    !document.getElementById("player-hand-0").classList.contains("current"),
    "Player 0 hand should not have 'current' class"
  );

  assert(document.getElementById("player-hand-1").classList.contains("ai"), "Player 1 hand should have 'ai' class");
  assert(document.getElementById("player-hand-1").classList.contains("current"), "Player 1 hand should have 'current' class");

  assert(document.getElementById("player-hand-2").classList.contains("human"), "Player 2 hand should have 'human' class");
  assert(
    !document.getElementById("player-hand-2").classList.contains("current"),
    "Player 2 hand should not have 'current' class"
  );

  testTeardown();
}

function test_renderSelectedCards_appliesSelectedClass() {
  const ui = testSetup();
  ui.game.gameState.currentPlayer = 0;

  // Set up player hands and render them using the UI's own rendering logic
  const card1 = new Card("3", "♠");
  const card2 = new Card("4", "♦");
  ui.game.gameState.playerHands[ui.game.gameState.currentPlayer] = [card1, card2];
  ui.renderPlayerHands();

  const currentPlayerHandDiv = document.getElementById(`player-hand-${ui.game.gameState.currentPlayer}`);
  const cardElements = currentPlayerHandDiv.querySelectorAll(".card");
  const cardElement1 = cardElements[0];
  const cardElement2 = cardElements[1];

  ui.game.gameState.selectedCards = [card1];
  ui.renderSelectedCards();

  assert(cardElement1.classList.contains("selected"), "Selected card should have 'selected' class");
  assert(!cardElement2.classList.contains("selected"), "Non-selected card should not have 'selected' class");

  // Test deselecting
  ui.game.gameState.selectedCards = [];
  ui.renderSelectedCards();
  assert(!cardElement1.classList.contains("selected"), "Deselected card should not have 'selected' class");

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
  ui.game.gameState.gameStarted = false; // Explicitly set game not started
  ui.game.gameState.currentPlayer = 0; // Human player is first

  ui.updateButtonStates();

  assert(ui.playButton.style.display === "none", "Play button should be hidden");
  assert(ui.passButton.style.display === "none", "Pass button should be hidden");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
  assert(ui.startGameButton.style.display === "block", "Start game button should be visible");
  testTeardown();
}

export const uiTests = [
  test_createCardElement,
  test_render_displaysGameInfo,
  test_renderPlayArea_clearsGameContentBeforeRendering,
  test_renderPlayerHand_rendersCards,
  test_renderPlayerHands_rendersCorrectNumberOfHands,
  test_renderSelectedCards_appliesSelectedClass,
  test_updateButtonStates_gameOver,
  test_updateButtonStates_gameNotOver,
  test_updateButtonStates_gameNotStarted,
];
