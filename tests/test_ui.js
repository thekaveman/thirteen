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

export const uiTests = [
  test_handleCardClick_selectsAndDeselectsCard,
  test_handlePassButtonClick_switchesPlayerAndClearsSelectedCards,
];
