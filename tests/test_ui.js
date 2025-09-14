import { assert } from "./utils.js";
import { gameState } from "../src/game.js";
import ui from "../src/ui.js";

function test_handleCardClick_selectsAndDeselectsCard() {
  const tmp = document.createElement(`div`);
  const card = { rank: "A", suit: "♠", value: 48 };
  const event = { target: { dataset: { card: JSON.stringify(card) }, classList: tmp.classList } };
  gameState.selectedCards = [];

  ui.handleCardClick(event);
  assert(gameState.selectedCards.length === 1, "Should select one card");
  assert(gameState.selectedCards[0].value === card.value, "Should select the correct card");

  ui.handleCardClick(event);
  assert(gameState.selectedCards.length === 0, "Should deselect the card");
}

function test_handlePassButtonClick_switchesPlayerAndClearsSelectedCards() {
  const originalRender = ui.render;
  ui.render = () => {};

  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  gameState.selectedCards = [{ rank: "A", suit: "♠", value: 48 }];

  ui.handlePassButtonClick();

  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");

  ui.render = originalRender;
}

function test_handleInvalidPlay_showsAlert() {
  const originalAlert = window.alert;
  let alertCalled = false;
  window.alert = () => {
    alertCalled = true;
  };

  ui.handleInvalidPlay();

  assert(alertCalled, "handleInvalidPlay: Should call alert()");

  window.alert = originalAlert;
}

function test_handlePlayButtonClick_callsValidPlayHandler() {
  const originalRender = ui.render;
  const originalHandleValidPlay = ui.handleValidPlay;

  let validPlayHandlerCalled = false;
  ui.render = () => {}; // Mock render to avoid DOM errors
  ui.handleValidPlay = () => {
    validPlayHandlerCalled = true;
  };

  // This is the tricky part. We need to ensure isValidPlay returns true.
  // Since we can't mock it, we set up a valid game state.
  gameState.selectedCards = [{ rank: "4", suit: "♠", value: 4 }];
  gameState.playPile = [];
  gameState.currentTurn = 1;

  ui.handlePlayButtonClick();

  assert(validPlayHandlerCalled, "handlePlayButtonClick: Should call handleValidPlay on valid move");

  ui.render = originalRender;
  ui.handleValidPlay = originalHandleValidPlay;
}

function test_handlePlayButtonClick_callsInvalidPlayHandler() {
  // Setup
  const originalRender = ui.render;
  const originalHandleInvalidPlay = ui.handleInvalidPlay;

  let invalidPlayHandlerCalled = false;
  ui.render = () => {}; // Mock render to avoid DOM errors
  ui.handleInvalidPlay = () => {
    invalidPlayHandlerCalled = true;
  };

  // Set up an invalid game state to make isValidPlay return false.
  gameState.selectedCards = [{ rank: "3", suit: "♠", value: 0 }];
  gameState.playPile = [{ rank: "A", suit: "♠", value: 48 }];

  // Execute
  ui.handlePlayButtonClick();

  // Assert
  assert(invalidPlayHandlerCalled, "handlePlayButtonClick: Should call handleInvalidPlay on invalid move");

  // Teardown
  ui.render = originalRender;
  ui.handleInvalidPlay = originalHandleInvalidPlay;
}

function test_handleValidPlay_updatesGameState() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  const cardToPlay = { rank: "4", suit: "♠", value: 4 };
  gameState.playerHands = [[cardToPlay], []];
  gameState.selectedCards = [cardToPlay];
  gameState.playPile = [];
  gameState.currentTurn = 1;

  ui.handleValidPlay();

  assert(gameState.playerHands[0].length === 0, "handleValidPlay: Should remove card from player's hand");
  assert(gameState.playPile.length === 1, "handleValidPlay: Should add card to play pile");
  assert(gameState.playPile[0].value === 4, "handleValidPlay: Should add correct card to play pile");
  assert(gameState.selectedCards.length === 0, "handleValidPlay: Should clear selected cards");
  assert(gameState.currentPlayer === 1, "handleValidPlay: Should switch to the next player");
}

export const uiTests = [
  test_handleCardClick_selectsAndDeselectsCard,
  test_handleInvalidPlay_showsAlert,
  test_handlePassButtonClick_switchesPlayerAndClearsSelectedCards,
  test_handlePlayButtonClick_callsValidPlayHandler,
  test_handlePlayButtonClick_callsInvalidPlayHandler,
  test_handleValidPlay_updatesGameState,
];
