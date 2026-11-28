import type { Card } from "./deck.js";
import type { Player } from "../player/base.js";
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
