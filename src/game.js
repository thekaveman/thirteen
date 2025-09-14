export const gameState = {
  numPlayers: 2,
  playerHands: [],
  playPile: [],
  currentPlayer: 0,
  currentTurn: 0,
  selectedCards: [],
};

/**
 * Finds the lowest card in the entire game.
 * @param {Array<Array<object>>} hands An array of player hands.
 * @returns {object} The lowest card object.
 */
export function findLowestCardInGame(hands) {
  let lowestCard = null;
  let lowestCardValue = Infinity;

  hands.forEach((hand) => {
    hand.forEach((card) => {
      if (card.value < lowestCardValue) {
        lowestCardValue = card.value;
        lowestCard = card;
      }
    });
  });

  return lowestCard;
}

/**
 * Finds the player who should start the game based on the lowest card.
 * @param {Array<Array<object>>} hands An array of player hands.
 * @returns {number} The index of the player who should start.
 */
export function findStartingPlayer(hands) {
  let startingPlayer = 0;
  let lowestCardValue = hands[0][0].value;

  for (let i = 1; i < hands.length; i++) {
    if (hands[i][0].value < lowestCardValue) {
      lowestCardValue = hands[i][0].value;
      startingPlayer = i;
    }
  }

  return startingPlayer;
}

/**
 * Sorts a player's hand by card value.
 * @param {Array<object>} hand The hand to sort.
 */
export function sortHand(hand) {
  hand.sort((a, b) => a.value - b.value);
}

/**
 * Switches to the next player.
 */
export function switchToNextPlayer() {
  gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.numPlayers;
}
