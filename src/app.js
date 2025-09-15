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
  ui.toggleNewGameButton(false);

  const deck = createDeck();
  shuffleDeck(deck);
  gameState.playerHands = deal(deck, gameState.numPlayers);
  gameState.playerHands.forEach(sortHand);
  gameState.currentPlayer = findStartingPlayer(gameState.playerHands);
  gameState.lastPlayerToPlay = gameState.currentPlayer;
  ui.render();

  document.getElementById("play-button").addEventListener("click", () => {
    ui.handlePlayButtonClick();
    if (gameState.gameOver) {
      ui.toggleNewGameButton(true);
    }
  });
  document.getElementById("pass-button").addEventListener("click", ui.handlePassButtonClick);
  document.getElementById("new-game-button").addEventListener("click", startGame);
}

startGame();
