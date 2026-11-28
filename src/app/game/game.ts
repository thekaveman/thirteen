import { GameClient } from "./client.js";
import type { Card } from "./deck.js";
import { Card as CardClass, Deck } from "./deck.js";
import type { Player } from "../player/base.js";
import { createPlayer, PLAYER_TYPES } from "../player/index.js";
import { Rules } from "./rules.js";
import { StateManager, type GameState, type LoadedState } from "./state.js";
import { log } from "../utils.js";

export type { GameState, LoadedState } from "./state.js";

export interface LoadResult {
  loaded: boolean;
  loadedPlayerTypes?: string[];
  gameOver?: boolean;
}

export interface GameHooks {
  onGameInit: (_gameClient: GameClient) => void;
  onGameReset: (_gameClient: GameClient) => void;
  onGameStarted: (_gameClient: GameClient) => void;
  onGameWon: (_gameClient: GameClient) => void;
  onGameResigned: (_gameClient: GameClient) => void;
  onPlayerMoved: (_gameClient: GameClient) => void;
  onPlayerPassed: (_gameClient: GameClient) => void;
  onRoundPlayed: (_gameClient: GameClient) => void;
}

export class Game {
  deck: Deck;
  hooks: GameHooks;
  gameState: GameState;
  id: string;
  rules: Rules;
  private stateManager: StateManager;

  /**
   * Initializes a new game.
   * @param deck The Deck instance for this game.
   * @param stateKey The key used to save and load state in localStorage.
   */
  constructor(deck: Deck, stateKey: string = StateManager.STATE_KEY) {
    this.deck = deck;
    this.hooks = {
      onGameInit: () => {},
      onGameReset: () => {},
      onGameStarted: () => {},
      onGameWon: () => {},
      onGameResigned: () => {},
      onPlayerMoved: () => {},
      onPlayerPassed: () => {},
      onRoundPlayed: () => {},
    };
    this.stateManager = new StateManager(stateKey);
    this.gameState = StateManager.createDefault();
    this.id = crypto.randomUUID();
    this.rules = new Rules();
  }

  /**
   * Deals player hands for each player.
   */
  deal(): void {
    this.gameState.playerHands = this.deck.deal(this.gameState.numPlayers);
    this.gameState.playerHands.forEach(CardClass.sort);
  }

  /**
   * Resets all game state flags for a new game.
   * Called by init() and setPlayers() to ensure fresh state.
   */
  #resetForNewGame(): void {
    this.gameState.currentPlayer = 0;
    this.gameState.currentTurn = 0;
    this.gameState.consecutivePasses = 0;
    this.gameState.gameOver = false;
    this.gameState.gameStarted = false;
    this.gameState.lastPlayerToPlay = -1;
    this.gameState.playPile = [];
    this.gameState.roundNumber = 1;
    this.gameState.playerTurns = new Array(this.gameState.numPlayers).fill(0);
    this.#clearSelectedCards();
    this.gameState.playerPassed = new Array(this.gameState.numPlayers).fill(false);
    this.gameState.roundEnded = false;
    this.gameState.resigned = false;
    this.gameState.resignedPlayer = -1;
    this.gameState.resignConfirming = false;
  }

  /**
   * Initializes the game state for a new round or game, preserving cumulative wins and game ID.
   */
  init(): void {
    this.#resetForNewGame();
    this.gameState.roundsWon = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.gamesResigned = new Array(this.gameState.numPlayers).fill(0);
    this.hooks.onGameInit(new GameClient(this));
  }

  /**
   * Loads the game state from localStorage.
   * @param ui An instance of the UI class.
   * @returns True if a saved game was loaded, false otherwise.
   */
  async load(ui: unknown): Promise<LoadResult> {
    let saved: Awaited<ReturnType<typeof this.stateManager.load>>;
    try {
      saved = await this.stateManager.load();
    } catch {
      return { loaded: false };
    }

    if (!ui) return { loaded: false };

    this.id = saved.id;
    this.deck = new Deck(saved.deck.cards);
    this.gameState = saved.gameState;
    this.gameState.playerHands = [...this.gameState.playerHands].map((h) => CardClass.objectsToList(h));
    this.gameState.playPile = CardClass.objectsToList([...this.gameState.playPile]);
    this.gameState.selectedCards = CardClass.objectsToList([...this.gameState.selectedCards]);

    const loadedPlayerIds = saved.gameState.players.map((p: { id: string }) => p.id);
    this.gameState.players = await Promise.all(
      saved.gameState.players.map(async (p: any, i: number) =>
        createPlayer({
          id: loadedPlayerIds[i],
          gameClient: new GameClient(this),
          type: saved.loadedPlayerTypes[i],
          number: i,
          ui: ui as any,
          persona: p.type === PLAYER_TYPES.AI ? p.persona : undefined,
        })
      )
    );

    this.gameState.playerTypes = saved.loadedPlayerTypes;
    log("Game loaded from localStorage.");
    return { loaded: true, loadedPlayerTypes: saved.loadedPlayerTypes, gameOver: this.gameState.gameOver };
  }

  /**
   * Checks if the round should end: all players except lastPlayerToPlay have passed.
   */
  shouldEndRound(): boolean {
    const pp = this.gameState.playerPassed;
    for (let i = 0; i < this.gameState.numPlayers; i++) {
      if (i !== this.gameState.lastPlayerToPlay && !pp[i]) {
        return false;
      }
    }
    return true;
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
    this.gameState.playerPassed = new Array(this.gameState.numPlayers).fill(false);
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
    this.gameState.playerPassed[this.gameState.currentPlayer] = true;
    this.#clearSelectedCards();

    this.hooks.onPlayerPassed(new GameClient(this));

    // Check if round should end (all non-last players have passed)
    // Only check when someone has actually played (lastPlayerToPlay !== -1)
    if (this.gameState.lastPlayerToPlay !== -1 && this.shouldEndRound()) {
      log(`Player ${this.gameState.lastPlayerToPlay + 1} wins round ${this.gameState.roundNumber}.`);
      this.gameState.roundEnded = true;
      this.nextRound();
      this.gameState.currentTurn++;
      this.save();
      return true;
    }

    // Skip passed players to find the next active player, then switch to them
    const nextPlayer = this.#findNextActivePlayer(this.gameState.currentPlayer, this.gameState.lastPlayerToPlay);
    this.gameState.currentPlayer = nextPlayer;
    this.gameState.currentTurn++;
    this.save();
    return true;
  }

  /**
   * Handles a valid play, updating the game state.
   */
  playCards(): void {
    // Reject plays from passed players
    if (this.gameState.playerPassed[this.gameState.currentPlayer]) {
      log("Cannot play cards: this player has passed.");
      return;
    }

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

    // Check for win condition (must happen before round-end check)
    if (currentPlayerHand.length === 0) {
      log(`Player ${this.gameState.currentPlayer + 1} wins the game!`);
      this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
      this.gameState.roundEnded = true;
      this.win();
      // Clear selected cards
      this.#clearSelectedCards();
      this.gameState.currentTurn++;
      this.save();
      return;
    }

    // Reset consecutive passes — we're now in a new play cycle (consecutivePasses was incremented during pass sequence)
    this.gameState.consecutivePasses = 0;
    this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;

    // Clear selected cards
    this.#clearSelectedCards();

    // Check if round should end (all other players have passed)
    // This must happen AFTER consecutivePasses is reset (play cycle started) but BEFORE
    // playerPassed is reset (so the check sees the original pass state from the previous cycle)
    if (this.shouldEndRound()) {
      log(`Player ${this.gameState.lastPlayerToPlay + 1} wins round ${this.gameState.roundNumber}.`);
      this.gameState.roundEnded = true;
      this.nextRound();
      this.gameState.currentTurn++;
      this.save();
      return;
    }

    // Switch to next non-passed player after the last player to play
    if (!this.gameState.gameOver) {
      this.gameState.currentPlayer = this.#findNextActivePlayer(this.gameState.lastPlayerToPlay);
    }
    this.gameState.currentTurn++;
    this.save();
  }

  /**
   * Resets the entire game, including generating a new game ID and clearing cumulative wins.
   */
  reset(): void {
    this.id = crypto.randomUUID();
    this.gameState.numAIPlayers = 0;
    this.gameState.gamesWon = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.gamesPlayed = new Array(this.gameState.numPlayers).fill(0);
    this.gameState.gamesResigned = new Array(this.gameState.numPlayers).fill(0);
    this.init();
    this.hooks.onGameReset(new GameClient(this));
  }

  /**
   * Saves the current game state to localStorage.
   */
  save(): void {
    this.stateManager.save(this.gameState, this.deck, this.id);
  }

  /**
   * Initializes the game's players.
   * @param players The list of players to initialize into the game.
   * @param options Optional configuration.
   * @param options.skipDeal If true, skip resetting game state fields (used when restoring state from save).
   */
  setPlayers(players: Player[], options?: { skipDeal?: boolean }): void {
    if (players) {
      this.gameState.players = players;
      this.gameState.numPlayers = players.length;
      this.gameState.playerTypes = players.map((p) => p.type);
      // Count AI players and save their personas (player 0 is human, rest are AI)
      this.gameState.numAIPlayers = players.length - 1;
      this.gameState.aiPersonas = players.slice(1).map((p) => p.persona);

      // Always resize stats arrays to match current player count
      this.#resizeStatsArray(this.gameState.gamesWon, players.length);
      this.#resizeStatsArray(this.gameState.gamesPlayed, players.length);
      this.#resizeStatsArray(this.gameState.gamesResigned, players.length);
      this.#resizeStatsArray(this.gameState.roundsWon, players.length);

      const skipDeal = options?.skipDeal ?? false;
      if (!skipDeal) {
        this.#resetForNewGame();
        this.gameState.playerHands = players.map(() => []);
      }
      this.save();
    }
  }

  /**
   * Resizes a stats array to the target length.
   * - Grows by pushing zeros if shorter
   * - Truncates if longer
   * @param statsArray The stats array to resize.
   * @param targetLength The target length.
   */
  #resizeStatsArray(statsArray: number[], targetLength: number): void {
    if (statsArray.length < targetLength) {
      while (statsArray.length < targetLength) {
        statsArray.push(0);
      }
    } else if (statsArray.length > targetLength) {
      statsArray.length = targetLength;
    }
  }

  /**
   * Resizes the gamesPlayed array if needed and increments every player's count by 1.
   */
  #incrementGamesPlayed(): void {
    const numPlayers = this.gameState.numPlayers;
    if (this.gameState.gamesPlayed.length < numPlayers) {
      this.gameState.gamesPlayed = new Array(numPlayers).fill(0);
    }
    for (let i = 0; i < numPlayers; i++) {
      this.gameState.gamesPlayed[i]++;
    }
  }

  /**
   * Clears the selected cards array.
   */
  #clearSelectedCards(): void {
    this.gameState.selectedCards = [];
  }

  /**
   * Finds the next active (non-passed) player, wrapping around and stopping at stopIndex.
   * @param startIndex The index to start searching from.
   * @param stopIndex The index to stop at (exclusive). Use -1 for no stop.
   * @returns The next active player index.
   */
  #findNextActivePlayer(startIndex: number, stopIndex: number = -1): number {
    let next = (startIndex + 1) % this.gameState.numPlayers;
    while (next !== stopIndex && this.gameState.playerPassed[next]) {
      next = (next + 1) % this.gameState.numPlayers;
    }
    return next;
  }

  start(): void {
    if (!this.gameState.gameStarted) {
      this.deal();
      this.gameState.currentPlayer = this.rules.findStartingPlayer(this.gameState.playerHands);
      this.gameState.lastPlayerToPlay = this.gameState.currentPlayer;
      this.gameState.gameStarted = true;
      this.save();
      this.hooks.onGameStarted(new GameClient(this));
    }
  }

  /**
   * Marks the game as over and sets the winner
   */
  win(): void {
    this.gameState.gamesWon[this.gameState.currentPlayer]++;
    this.gameState.roundsWon[this.gameState.currentPlayer]++; // Increment roundsWon here too, for the current round
    this.gameState.gameOver = true;
    this.gameState.gameStarted = false;
    this.#incrementGamesPlayed();
    this.save();
    this.hooks.onGameWon(new GameClient(this));
  }

  /**
   * Handles a player resignation. Marks the game as over without counting it as a win.
   * @param playerIndex The index of the resigning player.
   */
  resign(playerIndex: number): void {
    this.gameState.gameOver = true;
    this.gameState.resigned = true;
    this.gameState.resignedPlayer = playerIndex;
    this.gameState.gameStarted = false;

    // Increment games played for all players (resignation counts as participation)
    this.#incrementGamesPlayed();
    // Increment gamesResigned for the resigning player only
    if (this.gameState.gamesResigned.length < this.gameState.numPlayers) {
      this.gameState.gamesResigned = new Array(this.gameState.numPlayers).fill(0);
    }
    this.gameState.gamesResigned[playerIndex]++;
    this.save();
    this.hooks.onGameResigned(new GameClient(this));
  }
}
