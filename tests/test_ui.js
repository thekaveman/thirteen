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

function test_handleInvalidPlay_showsAlert() {
  const originalAlert = window.alert;
  let alertCalled = false;
  window.alert = () => {
    alertCalled = true;
  };

  ui.handleInvalidPlay();

  assert(alertCalled, "Should call alert()");

  window.alert = originalAlert;
}

function test_handlePassButtonClick_endsRoundCorrectly() {
  const originalRender = ui.render;
  ui.render = () => {};

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

  ui.render = originalRender;
}

function test_handlePassButtonClick_firstPlayOfRound() {
  const originalAlert = window.alert;
  const originalRender = ui.render;
  let alertCalled = false;
  window.alert = () => {
    alertCalled = true;
  };
  ui.render = () => {};

  gameState.playPile = []; // Empty play pile indicates the start of a round
  const originalState = { ...gameState };

  ui.handlePassButtonClick();

  assert(alertCalled, "Should call alert()");
  assert(gameState.currentPlayer === originalState.currentPlayer, "Should not change current player");
  assert(gameState.consecutivePasses === originalState.consecutivePasses, "Should not change consecutive passes");

  window.alert = originalAlert;
  ui.render = originalRender;
}

function test_handlePassButtonClick_incrementsPassesAndSwitchesPlayer() {
  const originalRender = ui.render;
  const originalAlert = window.alert;
  let alertCalled = false;
  window.alert = () => {
    alertCalled = true;
  };
  ui.render = () => {};

  gameState.numPlayers = 3;
  gameState.currentPlayer = 0;
  gameState.consecutivePasses = 0;
  gameState.playPile = [{ rank: "3", suit: "♠", value: 0 }]; // Not the first play
  gameState.selectedCards = [{ rank: "A", suit: "♠", value: 48 }];

  ui.handlePassButtonClick();

  assert(!alertCalled, "Should not call alert()");
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  assert(gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(gameState.consecutivePasses === 1, "Should increment consecutive passes");

  window.alert = originalAlert;
  ui.render = originalRender;
}

function test_handlePlayButtonClick_callsInvalidPlayHandler() {
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

  ui.handlePlayButtonClick();

  assert(invalidPlayHandlerCalled, "Should call handleInvalidPlay on invalid move");

  ui.render = originalRender;
  ui.handleInvalidPlay = originalHandleInvalidPlay;
}

function test_handlePlayButtonClick_updatesGameStateOnValidPlay() {
  const originalRender = ui.render;
  ui.render = () => {}; // Mock render to avoid DOM errors

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

  ui.render = originalRender;
}

export const uiTests = [
  test_handleCardClick_selectsAndDeselectsCard,
  test_handleInvalidPlay_showsAlert,
  test_handlePassButtonClick_endsRoundCorrectly,
  test_handlePassButtonClick_firstPlayOfRound,
  test_handlePassButtonClick_incrementsPassesAndSwitchesPlayer,
  test_handlePlayButtonClick_callsInvalidPlayHandler,
  test_handlePlayButtonClick_updatesGameStateOnValidPlay,
];
