import type { GameClient } from "./game/client.js";
import type { HumanPlayer } from "./player/human.js";
import { PLAYER_TYPES } from "./player/index.js";

// Minimal Amplitude interface — matches the CDN-loaded global
interface AmplitudeBrowser {
  Identify: new () => {
    setOnce(_key: string, _value: unknown): unknown;
    set(_key: string, _value: unknown): unknown;
    add(_key: string, _value: unknown): unknown;
  };
  identify(_id: unknown): void;
  track(_eventType: string, _payload: unknown): void;
}

// Extend Window interface to include amplitude from CDN
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    amplitude?: AmplitudeBrowser;
  }
}

// Analytics event data type
interface AnalyticsEventData {
  id: string;
  ended: boolean;
  round: number;
  started: boolean;
  turn: number;
  hands: unknown[][];
  players: unknown[];
  combination: string;
  move: unknown[];
  pile: unknown[];
  consecutive_passes: number;
  current_player: unknown;
  human_player: unknown;
  ai_player: unknown;
  game_rounds: number;
  game_turns: number;
  player_rounds_won: number;
  player_turns: number;
  player_games_won: number;
  player_games_played: number;
  version: string;
  rounds?: number;
  rounds_won?: number;
}

export class Analytics {
  api: AmplitudeBrowser | { track(_eventType: string, _payload: unknown): void };

  constructor() {
    if (typeof window !== "undefined" && window.amplitude) {
      this.api = window.amplitude;
    } else {
      this.api = {
        track(eventType: string, payload: unknown) {
          console.warn(`Couldn't send analytics for ${eventType}:`, payload);
        },
      };
    }
  }

  /**
   * Private method to initialize player data in the central service.
   * @param gameClient The game instance sending this event.
   */
  #idPlayer(gameClient: GameClient): void {
    try {
      // Only identify if the API has an Identify constructor (CDN or mock)
      const ampApi = this.api as AmplitudeBrowser;
      if (!ampApi.Identify) return;
      const id = new ampApi.Identify();
      const player = gameClient.getFirstHumanPlayer() as HumanPlayer | undefined;
      if (!player) return;

      id.setOnce("player", player.id);
      id.setOnce("type", player.type);
      id.setOnce("persona", player.type === PLAYER_TYPES.AI ? (player.persona as any) : null);
      id.setOnce("data", JSON.stringify(player.data()));
      id.set("game", gameClient.getId());
      id.add("games_played", 1);
      ampApi.identify(id);
    } catch (error) {
      console.error("Error initializing player:", error);
    }
  }

  /**
   * Private method to send analytics data to a central service.
   * @param eventType The type of event (e.g., "game_started", "game_won").
   * @param gameClient The game instance sending this event.
   * @param payload The data associated with the event.
   */
  #send(eventType: string, gameClient: GameClient, payload: object = {}): void {
    try {
      const data = gameClient.getAnalyticsData() as AnalyticsEventData;
      const event: {
        timestamp: string;
        game: {
          id: string;
          ended: boolean;
          round: number;
          started: boolean;
          turn: number;
          hands: unknown[][];
          players: unknown[];
        };
        event: object;
      } = {
        timestamp: new Date().toISOString(),
        game: {
          id: data.id,
          ended: data.ended,
          round: data.round,
          started: data.started,
          turn: data.turn,
          hands: data.hands,
          players: data.players,
        },
        event: payload,
      };
      this.api.track(eventType, event);
    } catch (error) {
      console.error(`Error sending analytics for ${eventType}:`, error);
    }
  }

  /**
   * Tracks the game initialization event.
   * @param gameClient The game instance sending this event.
   */
  gameInit(gameClient: GameClient): void {
    this.#idPlayer(gameClient);
    this.#send("game_initialized", gameClient, { id: gameClient.getId() });
  }

  /**
   * Tracks the game reset event.
   * @param gameClient The game instance sending this event.
   */
  gameReset(gameClient: GameClient): void {
    this.#send("game_reset", gameClient, { id: gameClient.getId() });
  }

  /**
   * Tracks the game start event.
   * @param gameClient The game instance sending this event.
   */
  gameStarted(gameClient: GameClient): void {
    this.#idPlayer(gameClient);
    this.#send("game_started", gameClient, {
      id: gameClient.getId(),
      round: gameClient.getRoundNumber(),
      turn: gameClient.getCurrentTurn(),
    });
  }

  /**
   * Tracks the game won event.
   * @param gameClient The game instance sending this event.
   */
  gameWon(gameClient: GameClient): void {
    this.#send("game_won", gameClient, {
      id: gameClient.getId(),
      round: gameClient.getRoundNumber(),
    });
  }

  /**
   * Tracks the game resigned event.
   * @param gameClient The game instance sending this event.
   */
  gameResigned(gameClient: GameClient): void {
    this.#send("game_resigned", gameClient, {
      id: gameClient.getId(),
      round: gameClient.getRoundNumber(),
    });
  }

  /**
   * Tracks the player moved event.
   * @param gameClient The game instance sending this event.
   */
  playerMoved(gameClient: GameClient): void {
    this.#send("player_moved", gameClient, {
      id: gameClient.getId(),
      turn: gameClient.getCurrentTurn(),
    });
  }

  /**
   * Tracks the player passed event.
   * @param gameClient The game instance sending this event.
   */
  playerPassed(gameClient: GameClient): void {
    this.#send("player_passed", gameClient, {
      id: gameClient.getId(),
      turn: gameClient.getCurrentTurn(),
    });
  }

  /**
   * Tracks the round played event.
   * @param gameClient The game instance sending this event.
   */
  roundPlayed(gameClient: GameClient): void {
    this.#send("round_played", gameClient, {
      id: gameClient.getId(),
      round: gameClient.getRoundNumber(),
      turn: gameClient.getCurrentTurn(),
    });
  }
}
