import { Analytics } from "./analytics.js";
import { Deck, Game } from "./game/index.js";
import { createPlayer, PLAYER_TYPES } from "./player/index.js";
import { UI } from "./ui.js";
import { AI_PERSONAS } from "./ai/personas.js";
import { log } from "./utils.js";

export class App {
  /**
   * Creates a new app instance with dependencies.
   * @param {Game} game
   * @param {UI} ui
   * @param {Analytics} analytics
   */
  constructor(game, ui, analytics = new Analytics()) {
    this.analytics = analytics;
    this.game = game;
    this.attachHooks(); // attach analytics hooks

    this.ui = ui;
    this.setTimeout = typeof window !== "undefined" ? setTimeout.bind(window) : setTimeout;

    this.ui.init(this.game);
    this.attachHandlers(); // attach handlers once after UI is initialized

    this.humanPlayer = createPlayer({ game: this.game, type: PLAYER_TYPES.HUMAN, number: 0, ui: this.ui });
    this.selectedAI = "random"; // Default AI persona
    this.aiPlayers = {};
    // Populate aiPlayers
    for (const personaKey in AI_PERSONAS) {
      this.aiPlayers[personaKey] = createPlayer({
        game: this.game,
        type: PLAYER_TYPES.AI,
        number: 1, // Assuming AI is always player 1
        persona: personaKey,
      });
    }
  }

  attachHandlers() {
    this.ui.aiDropdown.addEventListener("change", () => this.handleAISelection());
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

  handleAISelection() {
    this.selectedAI = this.ui.aiDropdown.value;
    this.game.gameState.playerPersonas[1] = this.selectedAI;
    this.game.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);
    this.ui.render();
  }

  handleAITurn() {
    const aiPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (aiPlayer.type !== PLAYER_TYPES.AI) {
      return;
    }

    log(`handleAITurn: Calling takeTurn() for ${aiPlayer.ai.persona}`);
    const move = aiPlayer.takeTurn();
    log(`handleAITurn: takeTurn() for ${aiPlayer.ai.persona} returned: ${JSON.stringify(move)}`);

    if (move && move.length > 0) {
      log(`handleAITurn: ${aiPlayer.ai.persona} is playing cards.`);
      this.game.gameState.selectedCards = move;
      this.game.playCards();
    } else {
      log(`handleAITurn: ${aiPlayer.ai.persona} is passing turn.`);
      this.game.passTurn();
    }

    this.ui.render();
    this.nextTurn();
  }

  handleNewGameClick() {
    log(`Game initialized`);
    this.init();
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

  init() {
    // Attempt to load game state
    const loadedGameState = this.game.load(this.ui);
    if (loadedGameState.loaded && !loadedGameState.gameOver) {
      // If game loaded, update selectedAI from loaded state
      if (loadedGameState.loadedPlayerPersonas && loadedGameState.loadedPlayerPersonas[1]) {
        this.selectedAI = loadedGameState.loadedPlayerPersonas[1];
      }
      this.game.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);
      this.ui.render();
      return;
    }

    // If no game loaded, or game was over, start a new one.
    this.game.init();

    // Initial game setup for display (hands dealt, starting player determined)
    this.game.gameState.playerTypes = [PLAYER_TYPES.HUMAN, PLAYER_TYPES.AI];
    this.game.gameState.playerPersonas = [null, this.selectedAI];
    this.game.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);

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
    if (currentPlayer.type === PLAYER_TYPES.AI) {
      this.setTimeout(() => this.handleAITurn(), 1000);
    } else {
      log("Human player's turn. Waiting for user input.");
      // If it's a human player's turn, do nothing and wait for user input
      return;
    }
  }

  /**
   * Factory function to create an App instance with customizable dependencies.
   * @param {object} [options={}] - Options for creating the app.
   * @param {string} [options.stateKey=Game.STATE_KEY] - The key for saving game state.
   * @param {typeof Deck} [options.DeckClass=Deck] - The Deck class to use.
   * @param {typeof Game} [options.GameClass=Game] - The Game class to use.
   * @param {typeof UI} [options.UIClass=UI] - The UI class to use.
   * @param {typeof Analytics} [options.AnalyticsClass=Analytics] - The Analytics class to use.
   * @returns {App} A new App instance.
   */
  static create(options = {}) {
    const { stateKey = Game.STATE_KEY, DeckClass = Deck, GameClass = Game, UIClass = UI, AnalyticsClass = Analytics } = options;

    const deck = new DeckClass();
    const game = new GameClass(deck, stateKey);
    const app = new App(game, new UIClass(game), new AnalyticsClass());

    app.ui.render();
    app.init();
    return app;
  }
}
