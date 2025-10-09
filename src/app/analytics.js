import { GameClient } from "./game/index.js";
import { PLAYER_TYPES } from "./player/index.js";

export class Analytics {
  constructor() {
    this.api =
      typeof window != "undefined" && window.amplitude
        ? window.amplitude
        : {
            track(eventType, payload) {
              console.warn(`Coudn't send analytics for ${eventType}:`, payload);
            },
          };
  }

  /**
   * Private method to initialize player data in the central service.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  async #idPlayer(gameClient) {
    try {
      const id = new this.api.Identify();
      const player = gameClient.getFirstHumanPlayer();

      id.setOnce("player", player.id);
      id.setOnce("type", player.type);
      id.setOnce("persona", player.type === PLAYER_TYPES.AI ? player.persona : null);
      id.setOnce("data", player.data());
      id.set("game", gameClient.getId());
      id.add("games_played", 1);

      this.api.identify(id);
    } catch (error) {
      console.error(`Error initializing player:`, error);
    }
  }

  /**
   * Private method to send analytics data to a central service.
   * @param {string} eventType The type of event (e.g., "game_started", "game_won").
   * @param {GameClient} gameClient The game instance sending this event.
   * @param {object} payload The data associated with the event.
   */
  async #send(eventType, gameClient, payload = {}) {
    try {
      const data = gameClient.getAnalyticsData();
      const event = { timestamp: new Date().toISOString() };
      event.game = {
        id: data.id,
        ended: data.ended,
        round: data.round,
        started: data.started,
        turn: data.turn,
        hands: data.hands,
        players: data.players,
      };
      event.event = payload;
      this.api.track(eventType, event);
    } catch (error) {
      console.error(`Error sending analytics for ${eventType}:`, error);
    }
  }

  /**
   * Tracks a game initialized event.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  gameInit(gameClient) {
    this.#send("game_initialized", gameClient);
  }

  /**
   * Tracks a game reset event.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  gameReset(gameClient) {
    this.#send("game_reset", gameClient);
  }

  /**
   * Tracks a game start event.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  gameStarted(gameClient) {
    const data = gameClient.getAnalyticsData();
    this.#send("game_started", gameClient, {
      human_player: data.human_player,
      ai_player: data.ai_player,
      current_player: data.current_player,
    });
    this.#idPlayer(gameClient);
  }

  /**
   * Tracks a game won event.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  gameWon(gameClient) {
    const data = gameClient.getAnalyticsData();
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
   * @param {GameClient} gameClient The game instance sending this event.
   */
  roundPlayed(gameClient) {
    const data = gameClient.getAnalyticsData();
    this.#send("round_played", gameClient, {
      rounds: data.rounds,
      rounds_won: data.rounds_won,
    });
  }

  /**
   * Tracks when a player makes a move.
   * @param {GameClient} gameClient The game instance sending this event.
   */
  playerMoved(gameClient) {
    const data = gameClient.getAnalyticsData();
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
   * @param {GameClient} gameClient The game instance sending this event.
   */
  playerPassed(gameClient) {
    const data = gameClient.getAnalyticsData();
    this.#send("player_passed", gameClient, {
      current_player: data.current_player,
      combination: data.combination,
      consecutive_passes: data.consecutive_passes,
      pile: data.pile,
      round: data.round,
    });
  }
}
