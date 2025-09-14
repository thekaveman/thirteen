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
  ui.render();
}

startGame();
