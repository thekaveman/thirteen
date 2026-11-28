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

export interface LoadResult {
  loaded: boolean;
  loadedPlayerTypes?: string[];
  gameOver?: boolean;
}

/**
 * Manages game state persistence: serialization, deserialization, and migration.
 */
export class StateManager {
  static VERSION = VERSION;
  static STATE_KEY = "13gs";

  private stateKey: string;

  constructor(stateKey: string = StateManager.STATE_KEY) {
    this.stateKey = stateKey;
  }

  static createDefault(): GameState {
    return {
      version: StateManager.VERSION,
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

  async load(parsedState: unknown, _ui: unknown): Promise<{
    gameState: GameState;
    loadedPlayerTypes: string[];
    gameOver: boolean;
  }> {
    const serializedState = parsedState as SerializedState;
    const gameState = this.migrate(serializedState.gameState as Partial<GameState>);
    const loadedPlayerTypes = gameState.players.map((p: { type: string }) => p.type);
    return { gameState, loadedPlayerTypes, gameOver: gameState.gameOver };
  }

  migrate(gameState: Partial<GameState>): GameState {
    const defaults: Partial<GameState> = {
      version: StateManager.VERSION,
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

    for (const key of Object.keys(defaults) as (keyof GameState)[]) {
      if (!(key in gameState) || gameState[key] === undefined) {
        gameState[key] = defaults[key] as any;
      }
    }

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

    gameState.version = StateManager.VERSION;
    return gameState as GameState;
  }
}
