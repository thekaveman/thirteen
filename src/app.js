import { createDeck, deal, shuffleDeck, sortHand } from "./deck.js";
import { gameState, findStartingPlayer, resetGame } from "./game.js";
import ui from "./ui.js";
import humanPlayer from "./ui-human.js";
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

  ui.playButton.addEventListener("click", humanPlayer.handlePlayButtonClick);
  ui.passButton.addEventListener("click", humanPlayer.handlePassButtonClick);
  ui.newGameButton.addEventListener("click", startGame);
}

startGame();
