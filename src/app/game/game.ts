import { GameClient } from "./client.js";
import type { Card } from "./deck.js";
import { Card as CardClass, Deck } from "./deck.js";
import type { Player } from "../player/base.js";
import { PLAYER_TYPES, createPlayer } from "../player/index.js";
import { Rules } from "./rules.js";
import { log } from "../utils.js";

export interface GameState {
  numPlayers: number;
  players: Player[];
  playerHands: Card[][];
  playerTurns: number[];
  playPile: Card[];
  currentPlayer: number;
  currentTurn: number;
  selectedCards: Card[];
  consecutivePasses: number;
  lastPlayerToPlay: number;
  roundNumber: number;
  roundsWon: number[];
  gamesWon: number[];
  gameOver: boolean;
  gameStarted: boolean;
  playerTypes: string[];
}

export interface GameHooks {
  onGameInit: (_gameClient: GameClient) => void;
  onGameReset: (_gameClient: GameClient) => void;
  onGameStarted: (_gameClient: GameClient) => void;
  onGameWon: (_gameClient: GameClient) => void;
  onPlayerMoved: (_gameClient: GameClient) => void;
  onPlayerPassed: (_gameClient: GameClient) => void;
  onRoundPlayed: (_gameClient: GameClient) => void;
}

export interface LoadResult {
  loaded: boolean;
  loadedPlayerTypes?: string[];
  gameOver?: boolean;
}

export class Game {
  static STATE_KEY = "13gs";

  deck: Deck;
  hooks: GameHooks;
  gameState: GameState;
  id: string;
  rules: Rules;
  stateKey: string;

  /**
   * Initializes a new game.
   * @param deck The Deck instance for this game.
   * @param stateKey The key used to save and load state in localStorage.
   */
  constructor(deck: Deck, stateKey: string = Game.STATE_KEY) {
    this.deck = deck;
    this.hooks = {
      onGameInit: () => {},
      onGameReset: () => {},
      onGameStarted: () => {},
      onGameWon: () => {},
      onPlayerMoved: () => {},
      onPlayerPassed: () => {},
      onRoundPlayed: () => {},
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
    };
    this.id = crypto.randomUUID();
    this.rules = new Rules();
    this.stateKey = stateKey;
  }

  /**
   * Deals player hands for each player.
   */
  deal(): void {
    this.gameState.playerHands = this.deck.deal(this.gameState.numPlayers);
    this.gameState.playerHands.forEach(CardClass.sort);
  }

  /**
   * Initializes the game state for a new round or game, preserving cumulative wins and game ID.
   */
  init(): void {
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
    this.hooks.onGameInit(new GameClient(this));
  }

  /**
   * Loads the game state from localStorage.
   * @param ui An instance of the UI class.
   * @returns True if a saved game was loaded, false otherwise.
   */
  async load(ui: unknown): Promise<LoadResult> {
    const savedState = localStorage.getItem(this.stateKey);
    const parsedState = savedState ? JSON.parse(savedState) : null;
    if (parsedState && ui) {
      // Store data from the parsed state before overwriting this.gameState
      const loadedPlayerIds = parsedState.gameState.players.map((p: { id: string }) => p.id);
      const loadedPlayerTypes = parsedState.gameState.players.map((p: { type: string }) => p.type);

      this.id = parsedState.id;
      this.stateKey = parsedState.stateKey;
      this.gameState = parsedState.gameState;
      // Re-hydrate deck
      this.deck = new Deck(parsedState.deck.cards);
      // Re-hydrate cards
      this.gameState.playerHands = [...this.gameState.playerHands].map((h) => CardClass.objectsToList(h));
      this.gameState.playPile = CardClass.objectsToList([...this.gameState.playPile]);
      this.gameState.selectedCards = CardClass.objectsToList([...this.gameState.selectedCards]);
      // Re-hydrate players (async due to dynamic AI persona loading)
      this.gameState.players = await Promise.all(
        parsedState.gameState.players.map(async (p: { id: string }, i: number) =>
          createPlayer({
            id: loadedPlayerIds[i],
            gameClient: new GameClient(this),
            type: loadedPlayerTypes[i],
            number: i,
            ui: ui as any,
            persona: parsedState.gameState.players[i].type === PLAYER_TYPES.AI ? parsedState.gameState.players[i].persona : null,
          }),
        ),
      );
      // Assign the stored playerTypes back to gameState
      this.gameState.playerTypes = loadedPlayerTypes;
      log("Game loaded from localStorage.");
      return { loaded: true, loadedPlayerTypes, gameOver: this.gameState.gameOver };
    }
    return { loaded: false };
  }

  /**
   * Switches to the next player.
   */
  nextPlayer(): void {
    this.gameState.currentPlayer = (this.gameState.currentPlayer + 1) % this.gameState.numPlayers;
  }

  /**
   * Ends the current round and starts the next.
   */
  nextRound(): void {
    if (this.gameState.lastPlayerToPlay !== -1) {
      this.gameState.roundsWon[this.gameState.lastPlayerToPlay]++;
    }
    this.gameState.playPile = [];
    this.gameState.consecutivePasses = 0;
    this.gameState.currentPlayer =
      this.gameState.lastPlayerToPlay !== -1
        ? this.gameState.lastPlayerToPlay
        : this.rules.findStartingPlayer(this.gameState.playerHands);
    this.gameState.roundNumber++;
    this.hooks.onRoundPlayed(new GameClient(this));
  }

  /**
   * Handles a player passing their turn.
   * @returns True if the pass was successful, false otherwise (e.g., cannot pass on first play).
   */
  passTurn(): boolean {
    if (this.gameState.playPile.length === 0) {
      log("Cannot pass on the first play of a round.");
      return false;
    }

    this.gameState.playerTurns[this.gameState.currentPlayer]++;
    this.gameState.consecutivePasses++;
    this.gameState.selectedCards = []; // Clear selected cards on pass

    this.hooks.onPlayerPassed(new GameClient(this));

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
  playCards(): void {
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

    this.hooks.onPlayerMoved(new GameClient(this));

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
  reset(): void {
    this.id = crypto.randomUUID();
    this.gameState.gamesWon = new Array(this.gameState.numPlayers).fill(0);
    this.init();
    this.hooks.onGameReset(new GameClient(this));
  }

  /**
   * Saves the current game state to localStorage.
   */
  save(): void {
    const serializableGameState = {
      id: this.id,
      deck: { ...this.deck },
      gameState: { ...this.gameState },
      stateKey: this.stateKey,
    };
    serializableGameState.gameState.players = this.gameState.players.map((p) => p.data()) as unknown as Player[];
    localStorage.setItem(this.stateKey, JSON.stringify(serializableGameState));
    log("Game saved to localStorage.");
  }

  /**
   * Initializes the game's players.
   * @param players The list of players to initialize into the game.
   */
  setPlayers(players: Player[]): void {
    if (players) {
      this.gameState.players = players;
      this.gameState.numPlayers = players.length;
      this.gameState.playerTypes = players.map((p) => p.type);
      this.gameState.roundsWon = new Array(players.length).fill(0);
      if (this.gameState.gamesWon.length !== players.length) {
        this.gameState.gamesWon = new Array(players.length).fill(0);
      }
      this.deal();
      this.gameState.currentPlayer = this.rules.findStartingPlayer(this.gameState.playerHands);
      this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
      this.save();
    }
  }

  /**
   * Marks the game as started.
   */
  start(): void {
    this.gameState.gameStarted = true;
    this.save();
    this.hooks.onGameStarted(new GameClient(this));
  }

  /**
   * Marks the game as over and sets the winner
   */
  win(): void {
    this.gameState.gamesWon[this.gameState.currentPlayer]++;
    this.gameState.roundsWon[this.gameState.currentPlayer]++; // Increment roundsWon here too, for the current round
    this.gameState.gameOver = true;
    this.gameState.gameStarted = false;
    this.hooks.onGameWon(new GameClient(this));
  }
}
