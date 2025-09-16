import { assert } from "./utils.js";
import { gameState, resetGame } from "../src/game.js";
import ui from "../src/ui.js";

let originalUiRender;

/**
  Setup function to run before each test
*/
function testSetup() {
  originalUiRender = ui.render;
  ui.render = () => {};
  // Initialize UI elements
  ui.init();
  // Reset game state for a clean test environment
  resetGame();
  // Ensure buttons are in a known state for tests that check them
  ui.playButton.disabled = false;
  ui.passButton.disabled = false;
  ui.newGameButton.style.display = "none";
}

/**
  Teardown function to run after each test
*/
function testTeardown() {
  ui.render = originalUiRender;
}

function test_createCardElement() {
  const card = { rank: "A", suit: "♠", value: 48 };
  const cardElement = ui.createCardElement(card);

  assert(cardElement.textContent === "A♠ ", "Should create a card element with the correct text content");
  assert(cardElement.classList.contains("card"), "Should have the card class");
  assert(cardElement.classList.contains("black"), "Should have the black class for a spade");
  assert(cardElement.dataset.card === JSON.stringify(card), "Should have the card data attribute");
}

function test_handleCardClick_preventsSelectionOfOtherPlayersCards() {
  // Setup initial game state
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  gameState.playerHands = [
    [{ rank: "3", suit: "♠", value: 0 }], // Player 0's hand
    [{ rank: "4", suit: "♦", value: 1 }], // Player 1's hand
  ];
  gameState.selectedCards = [];

  // Mock DOM elements for player hands and cards
  const player0HandDiv = document.createElement("div");
  player0HandDiv.id = "player0-hand";
  const player1HandDiv = document.createElement("div");
  player1HandDiv.id = "player1-hand";

  // Render hands to attach event listeners
  ui.renderPlayerHand(0, player0HandDiv);
  ui.renderPlayerHand(1, player1HandDiv);

  // Simulate clicking a card from Player 1's hand (not current player)
  const otherPlayerCardElement = player1HandDiv.querySelector(".card");
  const otherPlayerCard = JSON.parse(otherPlayerCardElement.dataset.card);
  const event = { target: otherPlayerCardElement };

  ui.handleCardClick(event);

  assert(gameState.selectedCards.length === 0, "Should not select card from other player's hand");
  assert(!otherPlayerCardElement.classList.contains("selected"), "Other player's card should not have 'selected' class");
}

function test_handleCardClick_selectsAndDeselectsCard() {
  // Setup initial game state for the current player
  gameState.currentPlayer = 0;
  gameState.playerHands = [
    [{ rank: "A", suit: "♠", value: 48 }], // Player 0's hand
    [], // Other players' hands can be empty for this test
  ];
  gameState.selectedCards = [];

  const tmp = document.createElement(`div`);
  const card = { rank: "A", suit: "♠", value: 48 };
  const event = { target: { dataset: { card: JSON.stringify(card) }, classList: tmp.classList } };

  ui.handleCardClick(event);
  assert(gameState.selectedCards.length === 1, "Should select one card");
  assert(gameState.selectedCards[0].value === card.value, "Should select the correct card");

  ui.handleCardClick(event);
  assert(gameState.selectedCards.length === 0, "Should deselect the card");
}

function test_handleInvalidPlay_showsMessage() {
  ui.handleInvalidPlay();
}

function test_handlePassButtonClick_endsRoundCorrectly() {
  gameState.numPlayers = 3;
  gameState.currentPlayer = 2; // Player 3 is passing
  gameState.lastPlayerToPlay = 1; // Player 2 was the last to play
  gameState.consecutivePasses = 1; // Player 1 already passed
  gameState.roundNumber = 1;
  gameState.playPile = [{ rank: "A", suit: "♠", value: 48 }];

  ui.handlePassButtonClick();

  assert(gameState.playPile.length === 0, "Should clear the play pile");
  assert(gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(gameState.currentPlayer === 1, "Should set the current player to the round winner");
  assert(gameState.roundNumber === 2, "Should increment the round number");
}

function test_handlePassButtonClick_firstPlayOfRound() {
  gameState.playPile = []; // Empty play pile indicates the start of a round
  const originalState = { ...gameState };

  ui.handlePassButtonClick();

  assert(gameState.currentPlayer === originalState.currentPlayer, "Should not change current player");
  assert(gameState.consecutivePasses === originalState.consecutivePasses, "Should not change consecutive passes");
}

function test_handlePassButtonClick_incrementsPassesAndSwitchesPlayer() {
  gameState.numPlayers = 3;
  gameState.currentPlayer = 0;
  gameState.consecutivePasses = 0;
  gameState.playPile = [{ rank: "3", suit: "♠", value: 0 }]; // Not the first play
  gameState.selectedCards = [{ rank: "A", suit: "♠", value: 48 }];

  ui.handlePassButtonClick();

  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.consecutivePasses === 1, "Should increment consecutive passes");
}

function test_handlePlayButtonClick_callsInvalidPlayHandler() {
  const originalHandleInvalidPlay = ui.handleInvalidPlay;

  let invalidPlayHandlerCalled = false;
  ui.handleInvalidPlay = () => {
    invalidPlayHandlerCalled = true;
  };

  // Set up an invalid game state to make isValidPlay return false.
  gameState.numPlayers = 2;
  gameState.playerHands = [[], []];
  gameState.selectedCards = [{ rank: "3", suit: "♠", value: 0 }];
  gameState.playPile = [{ rank: "A", suit: "♠", value: 48 }];

  ui.handlePlayButtonClick();

  assert(invalidPlayHandlerCalled, "Should call handleInvalidPlay on invalid move");

  ui.handleInvalidPlay = originalHandleInvalidPlay;
}

function test_handlePlayButtonClick_updatesGameStateOnValidPlay() {
  // Set up a valid game state to make isValidPlay return true.
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  const cardToPlay = { rank: "4", suit: "♠", value: 4 };
  gameState.playerHands = [[cardToPlay], []];
  gameState.selectedCards = [cardToPlay];
  gameState.playPile = [];
  gameState.currentTurn = 1;
  gameState.consecutivePasses = 1; // Should be reset
  gameState.gameOver = false; // Ensure game is not over initially

  ui.handlePlayButtonClick();

  assert(gameState.playerHands[0].length === 0, "Should remove card from player's hand");
  assert(gameState.playPile.length === 1, "Should add card to play pile");
  assert(gameState.playPile[0].value === 4, "Should add correct card to play pile");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.currentPlayer === 0, "Current player should remain the winner");
  assert(gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(gameState.lastPlayerToPlay === 0, "Should set the last player to play");
  assert(gameState.gameOver === true, "Should set gameOver to true when player wins");
}

function test_render_displaysGameInfo() {
  ui.gameContent.innerHTML = "";
  ui.playersHands.innerHTML = "";

  gameState.roundNumber = 5;
  gameState.roundsWon = [2, 3];
  gameState.gamesWon = [1, 0];
  gameState.playerHands = [[], []];

  ui.render();

  assert(ui.gameContent.innerHTML.includes("Round 5"), "Should display the current round number");

  const player1Hand = ui.playersHands.querySelector("#player0-hand");
  const player1RoundsWon = player1Hand.querySelector(".rounds-won");
  assert(player1RoundsWon.textContent === "Rounds won: 2", "Should display player 1 rounds won");
  const player1GamesWon = player1Hand.querySelector(".games-won");
  assert(player1GamesWon.textContent === "Games won: 1", "Should display player 1 games won");

  const player2Hand = ui.playersHands.querySelector("#player1-hand");
  const player2RoundsWon = player2Hand.querySelector(".rounds-won");
  assert(player2RoundsWon.textContent === "Rounds won: 3", "Should display player 2 rounds won");
  const player2GamesWon = player2Hand.querySelector(".games-won");
  assert(player2GamesWon.textContent === "Games won: 0", "Should display player 2 games won");
}
test_render_displaysGameInfo.beforeEach = () => {
  ui.render = originalUiRender;
};

function test_renderPlayArea_clearsGameContentBeforeRendering() {
  gameState.playPile = [];
  gameState.roundNumber = 1;

  ui.renderPlayArea();

  assert(ui.gameContent.innerHTML.includes("<h2>Play Area (Round 1)</h2>"), "Should clear the play area before rendering");
}

function test_renderPlayerHand_rendersCards() {
  const playerHandDiv = document.createElement("div");
  gameState.playerHands = [[{ rank: "A", suit: "♠", value: 48 }]];
  gameState.roundsWon = [0];
  gameState.gamesWon = [0];

  ui.renderPlayerHand(0, playerHandDiv);

  const cardElement = playerHandDiv.querySelector(".card");
  assert(cardElement, "Should render a card element");
}

function test_renderPlayerHands_rendersCorrectNumberOfHands() {
  ui.playersHands.innerHTML = "";
  gameState.playerHands = [[], [], []];

  ui.renderPlayerHands();

  const playerHandElements = ui.playersHands.querySelectorAll(".player-hand");
  assert(playerHandElements.length === 3, "Should render the correct number of player hands");
}

function test_updateButtonStates_gameOver() {
  gameState.gameOver = true;

  ui.updateButtonStates();

  assert(ui.playButton.disabled, "Play button should be disabled");
  assert(ui.passButton.disabled, "Pass button should be disabled");
  assert(ui.newGameButton.style.display === "block", "New game button should be visible");
}

function test_updateButtonStates_gameNotOver() {
  gameState.gameOver = false;

  ui.updateButtonStates();

  assert(!ui.playButton.disabled, "Play button should be enabled");
  assert(!ui.passButton.disabled, "Pass button should be enabled");
  assert(ui.newGameButton.style.display === "none", "New game button should be hidden");
}

export const uiTests = [
  test_createCardElement,
  test_handleCardClick_selectsAndDeselectsCard,
  test_handleCardClick_preventsSelectionOfOtherPlayersCards,
  test_handleInvalidPlay_showsMessage,
  test_handlePassButtonClick_endsRoundCorrectly,
  test_handlePassButtonClick_firstPlayOfRound,
  test_handlePassButtonClick_incrementsPassesAndSwitchesPlayer,
  test_handlePlayButtonClick_callsInvalidPlayHandler,
  test_handlePlayButtonClick_updatesGameStateOnValidPlay,
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
    test.beforeEach = function () {
      testSetup();
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
