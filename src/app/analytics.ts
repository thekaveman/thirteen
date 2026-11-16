import type { AmplitudeBrowser } from "@amplitude/analytics-browser";
import { init, Identify } from "@amplitude/analytics-browser";
import type { GameClient } from "./game/client.js";
import type { HumanPlayer } from "./player/human.js";
import { PLAYER_TYPES } from "./player/index.js";

// Extend Window interface to include amplitude
declare global {
  interface Window {
    amplitude: AmplitudeBrowser;
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
  rounds?: number;
  rounds_won?: number;
}

export class Analytics {
  api: AmplitudeBrowser | { track(eventType: string, payload: unknown): void };

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
      // Use this.api.Identify when available for testability
      const IdentifyConstructor = ((this.api as any).Identify as typeof Identify) || Identify;
      const id = new IdentifyConstructor();
      const player = gameClient.getFirstHumanPlayer() as HumanPlayer | undefined;
      if (!player) return;

      id.setOnce("player", player.id);
      id.setOnce("type", player.type);
      id.setOnce("persona", player.type === PLAYER_TYPES.AI ? (player.persona as any) : null);
      id.setOnce("data", JSON.stringify(player.data()));
      id.set("game", gameClient.getId());
      id.add("games_played", 1);

      if ("identify" in this.api) {
        (this.api as AmplitudeBrowser).identify(id);
      }
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
   * Tracks a game initialized event.
   * @param gameClient The game instance sending this event.
   */
  gameInit(gameClient: GameClient): void {
    this.#send("game_initialized", gameClient);
  }

  /**
   * Tracks a game reset event.
   * @param gameClient The game instance sending this event.
   */
  gameReset(gameClient: GameClient): void {
    this.#send("game_reset", gameClient);
  }

  /**
   * Tracks a game start event.
   * @param gameClient The game instance sending this event.
   */
  gameStarted(gameClient: GameClient): void {
    const data = gameClient.getAnalyticsData() as AnalyticsEventData;
    this.#send("game_started", gameClient, {
      human_player: data.human_player,
      ai_player: data.ai_player,
      current_player: data.current_player,
    });
    this.#idPlayer(gameClient);
  }

  /**
   * Tracks a game won event.
   * @param gameClient The game instance sending this event.
   */
  gameWon(gameClient: GameClient): void {
    const data = gameClient.getAnalyticsData() as AnalyticsEventData;
    this.#send("game_won", gameClient, {
      human_player: data.human_player,
      ai_player: data.ai_player,
      current_player: data.current_player,
      game_rounds: data.game_rounds,
      game_turns: data.game_turns,
      player_rounds_won: data.player_rounds_won,
      player_turns: data.player_turns,
      player_games_won: data.player_games_won,
    });
  }

  /**
   * Tracks a round played event.
   * @param gameClient The game instance sending this event.
   */
  roundPlayed(gameClient: GameClient): void {
    const data = gameClient.getAnalyticsData() as AnalyticsEventData;
    this.#send("round_played", gameClient, {
      rounds: data.rounds,
      rounds_won: data.rounds_won,
    });
  }

  /**
   * Tracks when a player makes a move.
   * @param gameClient The game instance sending this event.
   */
  playerMoved(gameClient: GameClient): void {
    const data = gameClient.getAnalyticsData() as AnalyticsEventData;
    this.#send("player_moved", gameClient, {
      current_player: data.current_player,
      combination: data.combination,
      move: data.move,
      pile: data.pile,
      round: data.round,
    });
  }

  /**
   * Tracks when a player passes their turn.
   * @param gameClient The game instance sending this event.
   */
  playerPassed(gameClient: GameClient): void {
    const data = gameClient.getAnalyticsData() as AnalyticsEventData;
    this.#send("player_passed", gameClient, {
      current_player: data.current_player,
      combination: data.combination,
      consecutive_passes: data.consecutive_passes,
      pile: data.pile,
      round: data.round,
    });
  }
}
