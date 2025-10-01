import { Game } from "./game.js";

export class Analytics {
  constructor() {
    this.api =
      typeof window != "undefined"
        ? window.amplitude
        : {
            track(eventType, payload) {
              console.warn(`Coudn't send analytics for ${eventType}:`, payload);
            },
          };
  }

  /**
   * Private method to initialize player data in the central service.
   * @param {Game} game The game instance sending this event.
   */
  async #idPlayer(game) {
    try {
      const id = new this.api.Identify();
      const player = game.firstHumanPlayer();

      id.setOnce("player", player.id);
      id.setOnce("type", player.type);
      id.set("game", player.game.id);
      id.add("games_played", 1);

      this.api.identify(id);
    } catch (error) {
      console.error(`Error initializing player:`, error);
    }
  }

  /**
   * Private method to send analytics data to a central service.
   * @param {string} eventType The type of event (e.g., "game_started", "game_won").
   * @param {Game} game The game instance sending this event.
   * @param {object} payload The data associated with the event.
   */
  async #send(eventType, game, payload = {}) {
    try {
      payload.game = {
        id: game.id,
        ended: game.gameState.gameOver,
        round: game.gameState.roundNumber,
        started: game.gameState.gameStarted,
        turn: game.gameState.currentTurn,
        hands: game.gameState.playerHands,
        players: game.gameState.players.map((p) => p.data()),
      };
      payload.timestamp = new Date().toISOString();
      this.api.track(eventType, payload);
    } catch (error) {
      console.error(`Error sending analytics for ${eventType}:`, error);
    }
  }

  /**
   * Tracks a game initialized event.
   * @param {Game} game The game instance sending this event.
   */
  gameInit(game) {
    this.#send("game_initialized", game);
  }

  /**
   * Tracks a game reset event.
   * @param {Game} game The game instance sending this event.
   */
  gameReset(game) {
    this.#send("game_reset", game);
  }

  /**
   * Tracks a game start event.
   * @param {Game} game The game instance sending this event.
   */
  gameStarted(game) {
    this.#send("game_started", game, {
      event: {
        player: game.currentPlayer().id,
        type: game.currentPlayer().type,
      },
    });
    this.#idPlayer(game);
  }

  /**
   * Tracks a game won event.
   * @param {Game} game The game instance sending this event.
   */
  gameWon(game) {
    this.#send("game_won", game, {
      event: {
        player: game.currentPlayer().id,
        type: game.currentPlayer().type,
        rounds: game.gameState.roundNumber,
        rounds_won: game.gameState.roundsWon[game.gameState.currentPlayer],
        player_turns: game.gameState.playerTurns[game.gameState.currentPlayer],
        total_turns: game.gameState.currentTurn,
        games_won: game.gameState.gamesWon[game.gameState.currentPlayer],
      },
    });
  }

  /**
   * Tracks a round played event.
   * @param {Game} game The game instance sending this event.
   */
  roundPlayed(game) {
    this.#send("round_played", game, {
      event: {
        rounds: game.gameState.roundNumber,
        rounds_won: game.gameState.roundsWon[game.gameState.currentPlayer],
      },
    });
  }

  /**
   * Tracks when a player makes a move.
   * @param {Game} game The game instance sending this event.
   */
  playerMoved(game) {
    this.#send("player_moved", game, {
      event: {
        player: game.currentPlayer().id,
        type: game.currentPlayer().type,
        combination: game.getCombinationType(game.gameState.playPile),
        move: game.gameState.selectedCards,
        pile: game.gameState.playPile,
        round: game.gameState.roundNumber,
      },
    });
  }

  /**
   * Tracks when a player passes their turn.
   * @param {Game} game The game instance sending this event.
   */
  playerPassed(game) {
    this.#send("player_passed", game, {
      event: {
        player: game.currentPlayer().id,
        type: game.currentPlayer().type,
        combination: game.getCombinationType(game.gameState.playPile),
        passes: game.gameState.consecutivePasses,
        pile: game.gameState.playPile,
        round: game.gameState.roundNumber,
      },
    });
  }
}
