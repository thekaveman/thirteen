import type { Card } from "./deck.js";
import type { Player } from "../player/base.js";
import { log } from "../utils.js";
import { VERSION } from "../version.js";

export interface GameState {
  version: string;
  numPlayers: number;
  numAIPlayers: number;
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
  gamesPlayed: number[];
  gamesResigned: number[];
  aiPersonas: (string | null)[];
  gameOver: boolean;
  gameStarted: boolean;
  playerTypes: string[];
  playerPassed: boolean[];
  roundEnded: boolean;
  resigned: boolean;
  resignedPlayer: number;
  resignConfirming: boolean;
}

/**
 * Creates a fresh GameState with all default values.
 */
export function createDefaultGameState(): GameState {
  return {
    version: VERSION,
    numPlayers: 0,
    numAIPlayers: 0,
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
    gamesPlayed: [],
    gamesResigned: [],
    aiPersonas: [],
    gameOver: false,
    gameStarted: false,
    playerTypes: [],
    playerPassed: [],
    roundEnded: false,
    resigned: false,
    resignedPlayer: -1,
    resignConfirming: false,
  };
}

// ---------------------------------------------------------------------------
// Persistence types
// ---------------------------------------------------------------------------

interface SerializableGameState {
  [key: string]: unknown;
  players: unknown[];
}

interface SerializedState {
  id: string;
  deck: { cards: { rank: string; suit: string }[] };
  gameState: SerializableGameState;
  stateKey: string;
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/**
 * Migrates a loaded (potentially outdated) gameState to the current schema.
 * Missing fields are filled in with sensible defaults; existing values are never overwritten.
 */
export function migrateGameState(gameState: Partial<GameState>): GameState {
  const defaults: Partial<GameState> = {
    version: VERSION,
    numPlayers: gameState.numPlayers ?? 0,
    numAIPlayers: gameState.numAIPlayers ?? 0,
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
    gamesPlayed: [],
    gamesResigned: [],
    aiPersonas: [],
    gameOver: false,
    gameStarted: false,
    playerTypes: [],
    playerPassed: [],
    roundEnded: false,
    resigned: false,
    resignedPlayer: -1,
    resignConfirming: false,
  };

  // Fill in any missing scalar/boolean/object fields
  for (const key of Object.keys(defaults) as (keyof GameState)[]) {
    if (!(key in gameState) || gameState[key] === undefined) {
      gameState[key] = defaults[key] as any;
    }
  }

  // Special-casing for arrays that depend on numPlayers
  const n = gameState.numPlayers ?? 0;

  const arraysThatNeedPlayerSize = [
    "playerTurns",
    "playerPassed",
    "roundsWon",
    "gamesWon",
    "gamesPlayed",
    "gamesResigned",
    "aiPersonas",
  ] as const;

  for (const arrName of arraysThatNeedPlayerSize) {
    const arr = gameState[arrName];
    if (!Array.isArray(arr)) {
      if (arrName === "aiPersonas") {
        gameState[arrName] = new Array(n).fill(null);
      } else if (arrName === "playerPassed") {
        gameState[arrName] = new Array(n).fill(false);
      } else {
        gameState[arrName] = new Array(n).fill(0);
      }
    } else if (arr.length < n) {
      while (arr.length < n) {
        if (arrName === "playerPassed") {
          (arr as unknown[]).push(false);
        } else if (arrName === "aiPersonas") {
          (arr as unknown[]).push(null);
        } else {
          (arr as unknown[]).push(0);
        }
      }
    } else if (arr.length > n) {
      arr.length = n;
    }
  }

  gameState.version = VERSION;
  return gameState as GameState;
}

// ---------------------------------------------------------------------------
// StateManager
// ---------------------------------------------------------------------------

export interface LoadResult {
  loaded: boolean;
  loadedPlayerTypes?: string[];
  gameOver?: boolean;
}

/**
 * Manages game state persistence: serialization, deserialization, and migration.
 */
export class StateManager {
  private stateKey: string;

  constructor(stateKey: string) {
    this.stateKey = stateKey;
  }

  /**
   * Saves the current game state to localStorage.
   */
  save(gameState: GameState, deck: { cards: { rank: string; suit: string }[] }, id: string): void {
    const serializableGameState: SerializableGameState = { ...gameState };
    serializableGameState.players = gameState.players.map((p) => p.data());

    const data: SerializedState = {
      id,
      deck: { cards: deck.cards },
      gameState: serializableGameState,
      stateKey: this.stateKey,
    };
    localStorage.setItem(this.stateKey, JSON.stringify(data));
    log("Game saved to localStorage.");
  }

  /**
   * Loads and migrates the game state from a parsed localStorage object.
   * Returns raw data that the caller uses to reconstruct the game instance.
   */
  async load(parsedState: unknown, _ui: unknown): Promise<{
    gameState: GameState;
    loadedPlayerTypes: string[];
    gameOver: boolean;
  }> {
    const serializedState = parsedState as SerializedState;

    // Migrate the loaded state to the current schema (fills in missing fields)
    const gameState = migrateGameState(serializedState.gameState as Partial<GameState>);

    // Extract player types for rehydration
    const loadedPlayerTypes = gameState.players.map((p: { type: string }) => p.type);

    return {
      gameState,
      loadedPlayerTypes,
      gameOver: gameState.gameOver,
    };
  }

  /**
   * Convenience wrapper: migrates a gameState and returns it.
   */
  migrate(gameState: Partial<GameState>): GameState {
    return migrateGameState(gameState);
  }
}
