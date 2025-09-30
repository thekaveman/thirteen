import { LowestCardAI } from "./ai.js";
import { Analytics } from "./analytics.js";
import { Deck } from "./deck.js";
import { Game } from "./game.js";
import { UI } from "./ui.js";
import { log } from "./utils.js";

export class App {
  /**
   * Creates a new app instance with dependencies.
   * @param {Game} game
   * @param {AI} ai
   * @param {UI} ui
   * @param {Analytics} analytics
   */
  constructor(game, ai, ui, analytics = new Analytics()) {
    this.analytics = analytics;
    this.game = game;
    this.attachHooks(); // attach analytics hooks

    this.ai = ai;
    this.ui = ui;
    this.setTimeout = typeof window !== "undefined" ? window.setTimeout.bind(window) : setTimeout;

    this.ui.init(this.game);
    this.attachHandlers(); // attach handlers once after UI is initialized
  }

  attachHandlers() {
    this.ui.playButton.addEventListener("click", () => this.handleHumanPlay());
    this.ui.passButton.addEventListener("click", () => this.handleHumanPass());
    this.ui.startGameButton.addEventListener("click", () => this.handleStartGameClick());
    this.ui.newGameButton.addEventListener("click", () => this.handleNewGameClick());
    this.ui.resetButton.addEventListener("click", () => this.handleResetButtonClick());
  }

  attachHooks() {
    this.game.hooks = {
      onGameInit: (game) => this.analytics.gameInit(game),
      onGameReset: (game) => this.analytics.gameReset(game),
      onGameStarted: (game) => this.analytics.gameStarted(game),
      onGameWon: (game) => this.analytics.gameWon(game),
      onPlayerMoved: (game) => this.analytics.playerMoved(game),
      onPlayerPassed: (game) => this.analytics.playerPassed(game),
      onRoundPlayed: (game) => this.analytics.roundPlayed(game),
    };
  }

  /**
   * Clears localStorage.
   */
  clearStorage() {
    localStorage.clear();
  }

  handleAITurn() {
    log("handleAITurn called.");
    const aiPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (aiPlayer.type !== "ai") {
      log("handleAITurn: Not an AI player, returning.");
      return;
    }

    log("handleAITurn: Calling aiPlayer.takeTurn().");
    const move = aiPlayer.takeTurn();
    log(`handleAITurn: aiPlayer.takeTurn() returned: ${JSON.stringify(move)}`);

    if (move && move.length > 0) {
      log("handleAITurn: AI is playing cards.");
      this.game.gameState.selectedCards = move;
      this.game.playCards();
    } else {
      log("handleAITurn: AI is passing turn.");
      this.game.passTurn();
    }

    this.ui.render();

    this.nextTurn();
  }

  handleNewGameClick() {
    log(`Game initialized`);
    this.init(this.setTimeout);
  }

  handleResetButtonClick() {
    log(`Game reset`);
    this.clearStorage();
    this.game.reset();
    this.init();
  }

  handleStartGameClick() {
    log(`Game started`);
    this.game.start();
    this.ui.render();
    this.nextTurn();
  }

  handleHumanPlay() {
    const humanPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    humanPlayer.handlePlayButtonClick();
    this.nextTurn();
  }

  handleHumanPass() {
    const humanPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    humanPlayer.handlePassButtonClick();
    this.nextTurn();
  }

  init(currentSetTimeout = null) {
    if (currentSetTimeout != null) {
      this.setTimeout = currentSetTimeout;
    }

    // Attempt to load game state
    if (this.game.load(this.ai, this.ui) && !this.game.gameState.gameOver) {
      // Render loaded UI
      this.ui.render();
      return;
    }

    // If no game loaded, or game was over, start a new one.
    this.game.init();

    // Initial game setup for display (hands dealt, starting player determined)
    this.game.gameState.playerTypes = ["human", "ai"];
    this.game.setPlayers(this.game.createPlayers(this.ai, this.ui));
    this.game.save();

    // Render initial UI with dealt hands and start button
    this.ui.render();
  }

  nextTurn() {
    log(
      `nextTurn called. Current player: ${this.game.gameState.currentPlayer}, type: ${
        this.game.gameState.players[this.game.gameState.currentPlayer]?.type
      }`
    );
    if (this.game.gameState.gameOver) {
      return;
    }
    const currentPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (currentPlayer.type === "ai") {
      this.setTimeout(() => this.handleAITurn(), 1000);
    } else {
      log("Human player's turn. Waiting for user input.");
      // If it's a human player's turn, do nothing and wait for user input
      return;
    }
  }
}

export const init = function (stateKey = Game.STATE_KEY) {
  const deck = new Deck();
  const game = new Game(deck, stateKey);
  const app = new App(game, new LowestCardAI(game), new UI(game));
  app.init();
};
