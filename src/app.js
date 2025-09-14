import { createDeck, shuffleDeck, deal } from "./deck.js";
import { gameState, findStartingPlayer, sortHand } from "./game.js";
import ui from "./ui.js";

/**
 * Starts the game.
 */
function startGame() {
  console.log(`${new Date()}: New game started`);

  const deck = createDeck();
  shuffleDeck(deck);
  gameState.playerHands = deal(deck, gameState.numPlayers);
  gameState.playerHands.forEach(sortHand);
  gameState.currentPlayer = findStartingPlayer(gameState.playerHands);
  gameState.lastPlayerToPlay = gameState.currentPlayer;
  ui.render();

  document.getElementById("play-button").addEventListener("click", ui.handlePlayButtonClick);
  document.getElementById("pass-button").addEventListener("click", ui.handlePassButtonClick);
}

startGame();
