import { COMBINATION_TYPES, RANKS } from "./constants.js";
import { Card, Deck } from "./deck.js";
import { log } from "./utils.js";

export class Game {
  /**
   * Initializes a new game.
   */
  constructor(deck) {
    this.deck = deck;
    this.gameState = {
      numPlayers: 0,
      players: [],
      playerHands: [],
      playPile: [],
      currentPlayer: 0,
      currentTurn: 0,
      selectedCards: [],
      consecutivePasses: 0,
      lastPlayerToPlay: -1,
      roundNumber: 1,
      roundsWon: [],
      gamesWon: [],
      gameOver: false,
      gameStarted: false,
      playerTypes: [],
    };
  }

  setPlayers(players) {
    this.gameState.players = players;
    this.gameState.numPlayers = players.length;
    this.gameState.playerTypes = players.map((p) => p.type);
    this.gameState.roundsWon = new Array(players.length).fill(0);
    this.gameState.gamesWon = new Array(players.length).fill(0);
    this.deck.shuffle();
    this.gameState.playerHands = this.deck.deal(this.gameState.numPlayers);
    this.gameState.playerHands.forEach(Card.sort);
    this.gameState.currentPlayer = this.findStartingPlayer(this.gameState.playerHands);
    this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
  }

  /**
   * Finds the player who should start the game based on the lowest card.
   * @param {Array<Array<Card>>} hands An array of sorted player hands.
   * @returns {number} The index of the player who should start.
   */
  findStartingPlayer(hands) {
    let startingPlayer = 0;
    const lowestCard = Card.findLowest(hands);
    if (lowestCard) {
      const lowestCardValue = lowestCard.value;

      for (let i = 0; i < hands.length; i++) {
        if (hands[i][0].value == lowestCardValue) {
          startingPlayer = i;
        }
      }
    }

    return startingPlayer;
  }

  /**
   * Determines the combination type of a set of cards.
   * @param {Array<Card>} cards The cards to check.
   * @returns {string} The combination type.
   */
  getCombinationType(cards) {
    if (this.isSingle(cards)) return COMBINATION_TYPES.SINGLE;
    if (this.isPair(cards)) return COMBINATION_TYPES.PAIR;
    if (this.isTriple(cards)) return COMBINATION_TYPES.TRIPLE;
    if (this.isStraight(cards)) return COMBINATION_TYPES.STRAIGHT;
    if (this.isConsecutivePairs(cards)) return COMBINATION_TYPES.CONSECUTIVE_PAIRS;
    if (this.isFourOfAKind(cards)) return COMBINATION_TYPES.FOUR_OF_A_KIND;
    return COMBINATION_TYPES.INVALID;
  }

  /**
   * Checks if a combination of cards is a bomb that can beat a pair of 2s.
   * A bomb against a pair of 2s is four consecutive pairs.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the cards form a bomb that beats a pair of 2s.
   */
  isBombForPairOfTwos(cards) {
    const combinationType = this.getCombinationType(cards);
    if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS && cards.length === 8) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a combination of cards is a bomb that can beat a single 2.
   * A bomb against a single 2 is either a four-of-a-kind or three consecutive pairs.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the cards form a bomb that beats a single 2.
   */
  isBombForSingleTwo(cards) {
    const combinationType = this.getCombinationType(cards);
    if (combinationType === COMBINATION_TYPES.FOUR_OF_A_KIND) {
      return true;
    }
    if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS && cards.length === 6) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a combination is consecutive pairs.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is consecutive pairs.
   */
  isConsecutivePairs(cards) {
    if (cards.length < 6 || cards.length % 2 !== 0) {
      return false;
    }
    const pairs = [];
    for (let i = 0; i < cards.length; i += 2) {
      const pair = [cards[i], cards[i + 1]];
      if (!this.isPair(pair)) {
        return false;
      }
      pairs.push(pair);
    }
    for (let i = 0; i < pairs.length - 1; i++) {
      const rankIndex1 = RANKS.indexOf(pairs[i][0].rank);
      const rankIndex2 = RANKS.indexOf(pairs[i + 1][0].rank);
      if (rankIndex2 !== rankIndex1 + 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if a combination is a four-of-a-kind.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is a four-of-a-kind.
   */
  isFourOfAKind(cards) {
    return cards.length === 4 && Card.allSameRank(cards);
  }

  /**
   * Checks if a combination is a pair.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is a pair.
   */
  isPair(cards) {
    return cards.length === 2 && Card.allSameRank(cards);
  }

  /**
   * Checks if a combination is a single card.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is a single.
   */
  isSingle(cards) {
    return cards.length === 1;
  }

  /**
   * Checks if a combination is a straight.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is a straight.
   */
  isStraight(cards) {
    if (cards.length < 3) {
      return false;
    }
    if (cards.some((card) => card.rank === "2")) {
      return false;
    }
    for (let i = 0; i < cards.length - 1; i++) {
      const rankIndex1 = RANKS.indexOf(cards[i].rank);
      const rankIndex2 = RANKS.indexOf(cards[i + 1].rank);
      if (rankIndex2 !== rankIndex1 + 1) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if a combination is a triple.
   * @param {Array<Card>} cards The cards to check.
   * @returns {boolean} True if the combination is a triple.
   */
  isTriple(cards) {
    return cards.length === 3 && Card.allSameRank(cards);
  }

  /**
   * Checks if a play is valid according to the game rules.
   * @param {Array<Card>} selectedCards The cards the player has selected.
   * @param {Array<Card>} playPile The cards currently in the play pile.
   * @param {Array<Card>} playerHand The hand of the player making the play.
   * @returns {boolean} True if the play is valid.
   */
  isValidPlay(selectedCards, playPile, playerHand, currentTurn, allPlayerHands) {
    // Check if all selected cards are in the current player's hand
    for (const selectedCard of selectedCards) {
      if (!playerHand.some((card) => card.rank === selectedCard.rank && card.suit === selectedCard.suit)) {
        return false;
      }
    }

    const playPileCombinationType = this.getCombinationType(playPile);
    const selectedCombinationType = this.getCombinationType(selectedCards);

    if (selectedCombinationType === COMBINATION_TYPES.INVALID) {
      return false;
    }

    // Bomb logic: A bomb can only be played on a 2 or a pair of 2s.
    if (
      selectedCombinationType === COMBINATION_TYPES.FOUR_OF_A_KIND ||
      selectedCombinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS
    ) {
      if (playPile.length === 0) return false; // Bombs cannot be played on an empty pile

      const topCard = playPile[playPile.length - 1];
      if (topCard.rank !== "2") return false; // Bombs can only be played on 2s

      if (playPile.length === 1) {
        return this.isBombForSingleTwo(selectedCards);
      }

      if (playPile.length === 2) {
        return this.isBombForPairOfTwos(selectedCards);
      }

      return false; // Bombs cannot be played on other combinations
    }

    // Standard play validation
    if (playPile.length === 0) {
      if (currentTurn === 0) {
        const lowestCard = Card.findLowest(allPlayerHands);
        return selectedCards.some((card) => card.value === lowestCard.value);
      }
      return true;
    }

    if (selectedCombinationType !== playPileCombinationType) {
      return false;
    }

    if (selectedCards.length !== playPile.length) {
      return false;
    }

    const highestSelectedCard = selectedCards.reduce((max, card) => (card.value > max.value ? card : max));
    const highestPlayPileCard = playPile.reduce((max, card) => (card.value > max.value ? card : max));

    return highestSelectedCard.value > highestPlayPileCard.value;
  }

  /**
   * Switches to the next player.
   */
  nextPlayer() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.numPlayers;
  }

  /**
   * Handles a player passing their turn.
   * @returns {boolean} True if the pass was successful, false otherwise (e.g., cannot pass on first play).
   */
  passTurn() {
    if (this.gameState.playPile.length === 0) {
      log("Cannot pass on the first play of a round.");
      return false;
    }

    this.gameState.consecutivePasses++;
    this.gameState.selectedCards = []; // Clear selected cards on pass

    if (this.gameState.consecutivePasses >= this.gameState.numPlayers - 1) {
      log(`Player ${this.gameState.lastPlayerToPlay + 1} wins round ${this.gameState.roundNumber}.`);
      this.gameState.roundsWon[this.gameState.lastPlayerToPlay]++;
      this.gameState.playPile = [];
      this.gameState.consecutivePasses = 0;
      this.gameState.currentPlayer = this.gameState.lastPlayerToPlay;
      this.gameState.roundNumber++;
    } else {
      this.nextPlayer();
    }

    this.gameState.currentTurn++;
    return true;
  }

  /**
   * Handles a valid play, updating the game state.
   */
  playCards() {
    // Move selected cards to play pile
    this.gameState.playPile = [...this.gameState.selectedCards];

    // Remove selected cards from player's hand
    const currentPlayerHand = this.gameState.playerHands[this.gameState.currentPlayer];
    this.gameState.selectedCards.forEach((selectedCard) => {
      const cardIndex = currentPlayerHand.findIndex((card) => card.value === selectedCard.value);
      if (cardIndex > -1) {
        currentPlayerHand.splice(cardIndex, 1);
      }
    });

    // Check for win condition
    if (currentPlayerHand.length === 0) {
      log(`Player ${this.gameState.currentPlayer + 1} wins the game!`);
      this.gameState.gamesWon[this.gameState.currentPlayer]++;
      this.gameState.roundsWon[this.gameState.currentPlayer]++; // Increment roundsWon here
      this.gameState.gameOver = true;
    }

    this.gameState.consecutivePasses = 0;
    this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;

    // Clear selected cards
    this.gameState.selectedCards = [];

    // Switch to next player
    if (!this.gameState.gameOver) {
      this.nextPlayer();
    }
    this.gameState.currentTurn++;
  }

  /**
   * Resets the game state to its initial values.
   */
  reset() {
    this.gameState.playerHands = [];
    this.gameState.playPile = [];
    this.gameState.currentPlayer = 0;
    this.gameState.currentTurn = 0;
    this.gameState.selectedCards = [];
    this.gameState.consecutivePasses = 0;
    this.gameState.lastPlayerToPlay = -1;
    this.gameState.roundNumber = 1;
    this.gameState.roundsWon = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.gameOver = false;
    this.gameState.gameStarted = false;
  }

  /**
   * Initializes the game by dealing hands and setting the starting player.
   */
  start() {
    this.gameState.gameStarted = true;
    this.gameState.currentPlayer = this.findStartingPlayer(this.gameState.playerHands);
    this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
  }
}
