import { createDeck, shuffleDeck, deal } from "./deck.js";
import { gameState, findStartingPlayer, sortHand, resetGame } from "./game.js";
import ui from "./ui.js";
import { log } from "./utils.js";

/**
 * Starts the game.
 */
function startGame() {
  log(`New game started`);

  resetGame();

  const deck = createDeck();
  shuffleDeck(deck);

  gameState.playerHands = deal(deck, gameState.numPlayers);
  gameState.playerHands.forEach(sortHand);
  gameState.currentPlayer = findStartingPlayer(gameState.playerHands);
  gameState.lastPlayerToPlay = gameState.currentPlayer;

  ui.init();
  ui.render();

  ui.playButton.addEventListener("click", ui.handlePlayButtonClick);
  ui.passButton.addEventListener("click", ui.handlePassButtonClick);
  ui.newGameButton.addEventListener("click", startGame);
}

startGame();
