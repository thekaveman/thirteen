import { Card, Deck } from "./deck.js";
import { PLAYER_TYPES } from "../player/index.js";
import { Rules } from "./rules.js";
import { log } from "../utils.js";

export class Game {
  static STATE_KEY = "13gs";

  /**
   * Initializes a new game.
   * @param {Deck} deck The Deck instance for this game.
   * @param {string} [stateKey=Game.STATE_KEY] The key used to save and load state in localStorage.
   */
  constructor(deck, stateKey = Game.STATE_KEY) {
    this.deck = deck;
    this.hooks = {
      onGameInit: (game) => {},
      onGameReset: (game) => {},
      onGameStarted: (game) => {},
      onGameWon: (game) => {},
      onPlayerMoved: (game) => {},
      onPlayerPassed: (game) => {},
      onRoundPlayed: (game) => {},
    };
    this.gameState = {
      numPlayers: 0,
      players: [],
      playerHands: [],
      playerTurns: [],
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
      playerPersonas: [],
    };
    this.id = crypto.randomUUID();
    this.rules = new Rules();
    this.stateKey = stateKey;
  }

  /**
   * Gets the current player from the game's state.
   * @returns {Player} The current player instance.
   */
  currentPlayer() {
    return this.gameState.players[this.gameState.currentPlayer];
  }

  /**
   * Deals player hands for each player.
   */
  deal() {
    this.gameState.playerHands = this.deck.deal(this.gameState.numPlayers);
    this.gameState.playerHands.forEach(Card.sort);
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
   * Gets the AI player from the game's state.
   * @returns {AIPlayer} The current AI player instance.
   */
  firstAIPlayer() {
    return this.gameState.players.find((p) => p.type === PLAYER_TYPES.AI);
  }

  /**
   * Gets the human player from the game's state.
   * @returns {HumanPlayer} The current human player instance.
   */
  firstHumanPlayer() {
    return this.gameState.players.find((p) => p.type === PLAYER_TYPES.HUMAN);
  }

  /**
   * Initializes the game state for a new round or game, preserving cumulative wins and game ID.
   */
  init() {
    this.gameState.currentPlayer = 0;
    this.gameState.currentTurn = 0;
    this.gameState.consecutivePasses = 0;
    this.gameState.gameOver = false;
    this.gameState.gameStarted = false;
    this.gameState.lastPlayerToPlay = -1;
    this.gameState.playPile = [];
    this.gameState.roundNumber = 1;
    this.gameState.roundsWon = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.playerTurns = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.selectedCards = [];
    this.deal();
    this.hooks.onGameInit(this);
  }

  /**
   * Loads the game state from localStorage.
   * @param {UI} ui An instance of the UI class.
   * @returns {boolean} True if a saved game was loaded, false otherwise.
   */
  load(ui) {
    const savedState = localStorage.getItem(this.stateKey);
    const parsedState = savedState ? JSON.parse(savedState) : null;
    if (parsedState && ui) {
      // Store playerTypes from the parsed state before overwriting this.gameState
      const loadedPlayerTypes = parsedState.gameState.players.map((p) => p.type);
      const loadedPlayerPersonas = parsedState.gameState.players.map((p) => (p.type === PLAYER_TYPES.AI ? p.persona : null));

      this.id = parsedState.id;
      this.stateKey = parsedState.stateKey;
      this.gameState = parsedState.gameState;
      // Re-hydrate deck
      this.deck = new Deck(parsedState.deck.cards);
      // Re-hydrate cards
      this.gameState.playerHands = [...this.gameState.playerHands].map((h) => Card.objectsToList(h));
      this.gameState.playPile = Card.objectsToList([...this.gameState.playPile]);
      this.gameState.selectedCards = Card.objectsToList([...this.gameState.selectedCards]);
      // Assign the stored playerTypes back to gameState
      this.gameState.playerTypes = loadedPlayerTypes;
      this.gameState.playerPersonas = loadedPlayerPersonas;
      log("Game loaded from localStorage.");
      return { loaded: true, loadedPlayerTypes, loadedPlayerPersonas, gameOver: this.gameState.gameOver };
    }
    return { loaded: false };
  }

  /**
   * Switches to the next player.
   */
  nextPlayer() {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.numPlayers;
  }

  /**
   * Ends the current round and starts the next.
   */
  nextRound() {
    if (this.gameState.lastPlayerToPlay !== -1) {
      this.gameState.roundsWon[this.gameState.lastPlayerToPlay]++;
    }
    this.gameState.playPile = [];
    this.gameState.consecutivePasses = 0;
    this.gameState.currentPlayer =
      this.gameState.lastPlayerToPlay !== -1
        ? this.gameState.lastPlayerToPlay
        : this.findStartingPlayer(this.gameState.playerHands);
    this.gameState.roundNumber++;
    this.hooks.onRoundPlayed(this);
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

    this.gameState.playerTurns[this.gameState.currentPlayer]++;
    this.gameState.consecutivePasses++;
    this.gameState.selectedCards = []; // Clear selected cards on pass

    this.hooks.onPlayerPassed(this);

    if (this.gameState.consecutivePasses >= this.gameState.numPlayers - 1) {
      log(`Player ${this.gameState.lastPlayerToPlay + 1} wins round ${this.gameState.roundNumber}.`);
      this.nextRound();
    } else {
      this.nextPlayer();
    }

    this.gameState.currentTurn++;
    this.save();
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

    this.hooks.onPlayerMoved(this);

    // Check for win condition
    if (currentPlayerHand.length === 0) {
      log(`Player ${this.gameState.currentPlayer + 1} wins the game!`);
      this.win();
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
    this.save();
  }

  /**
   * Resets the entire game, including generating a new game ID and clearing cumulative wins.
   */
  reset() {
    this.id = crypto.randomUUID();
    this.gameState.gamesWon = new Array(this.gameState.numPlayers).fill(0);
    this.init();
    this.hooks.onGameReset(this);
  }

  /**
   * Saves the current game state to localStorage.
   */
  save() {
    const serializableGameState = {
      id: this.id,
      deck: { ...this.deck },
      gameState: { ...this.gameState },
      stateKey: this.stateKey,
    };
    serializableGameState.gameState.players = this.gameState.players.map((p) => p.data());
    localStorage.setItem(this.stateKey, JSON.stringify(serializableGameState));
    log("Game saved to localStorage.");
  }

  /**
   * Initializes the game's players.
   * @param {Array<Player>} players The list of players to initialize into the game.
   */
  setPlayers(players) {
    if (players) {
      this.gameState.players = players;
      this.gameState.numPlayers = players.length;
      this.gameState.playerTypes = players.map((p) => p.type);
      this.gameState.playerPersonas = players.map((p) => p.persona);
      this.gameState.roundsWon = new Array(players.length).fill(0);
      if (this.gameState.gamesWon.length !== players.length) {
        this.gameState.gamesWon = new Array(players.length).fill(0);
      }
      this.deal();
      this.gameState.currentPlayer = this.findStartingPlayer(this.gameState.playerHands);
      this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
    }
  }

  /**
   * Marks the game as started.
   */
  start() {
    this.gameState.gameStarted = true;
    this.save();
    this.hooks.onGameStarted(this);
  }

  /**
   * Marks the game as over and sets the winner
   */
  win() {
    this.gameState.gamesWon[this.gameState.currentPlayer]++;
    this.gameState.roundsWon[this.gameState.currentPlayer]++; // Increment roundsWon here too, for the current round
    this.gameState.gameOver = true;
    this.gameState.gameStarted = false;
    this.hooks.onGameWon(this);
  }
}
