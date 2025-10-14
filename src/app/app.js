import { Analytics } from "./analytics.js";
import { Deck, Game, GameClient } from "./game/index.js";
import { createPlayer, PLAYER_TYPES } from "./player/index.js";
import { UI } from "./ui.js";
import { AI_PERSONAS } from "./ai/personas.js";
import { log } from "./utils.js";

export class App {
  /**
   * Creates a new app instance with dependencies.
   * @param {GameClient} gameClient
   * @param {UI} ui
   * @param {Analytics} analytics
   */
  constructor(gameClient, ui, analytics = new Analytics()) {
    this.analytics = analytics;
    this.gameClient = gameClient;
    this.attachHooks(); // attach analytics hooks

    this.ui = ui;
    this.setTimeout = typeof window !== "undefined" ? setTimeout.bind(window) : setTimeout;

    this.ui.init();
    this.ui.on("playClicked", () => this.handleHumanPlay());
    this.ui.on("passClicked", () => this.handleHumanPass());
    this.ui.on("newGameClicked", () => this.handleNewGameClick());
    this.ui.on("resetClicked", () => this.handleResetButtonClick());
    this.ui.on("startClicked", () => this.handleStartGameClick());
    this.ui.on("aiChanged", (selectedAI) => this.handleAISelection(selectedAI));
    this.ui.on("cardClicked", (card) => this.handleCardClick(card));

    this.humanPlayer = createPlayer({ gameClient: this.gameClient, type: PLAYER_TYPES.HUMAN, number: 0 });
    this.selectedAI = "random"; // Default AI persona
    this.aiPlayers = {};
    // Populate aiPlayers
    for (const personaKey in AI_PERSONAS) {
      this.aiPlayers[personaKey] = createPlayer({
        gameClient: this.gameClient,
        type: PLAYER_TYPES.AI,
        number: 1, // Assuming AI is always player 1
        persona: personaKey,
      });
    }
  }


  attachHooks() {
    this.gameClient.attachHooks(this.analytics);
  }

  /**
   * Clears localStorage.
   */
  clearStorage() {
    localStorage.clear();
  }

  handleAISelection(selectedAI) {
    this.selectedAI = selectedAI;
    this.gameClient.setAIPersona(1, this.selectedAI);
    this.gameClient.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);
    this.ui.render();
  }

  handleAITurn() {
    const aiPlayer = this.gameClient.getCurrentPlayer();
    if (aiPlayer.type !== PLAYER_TYPES.AI) {
      return;
    }

    log(`handleAITurn: Calling takeTurn() for ${aiPlayer.ai.persona}`);
    const move = aiPlayer.takeTurn();
    log(`handleAITurn: takeTurn() for ${aiPlayer.ai.persona} returned: ${JSON.stringify(move)}`);

    if (move && move.length > 0) {
      log(`handleAITurn: ${aiPlayer.ai.persona} is playing cards.`);
      this.gameClient.play(move);
    } else {
      log(`handleAITurn: ${aiPlayer.ai.persona} is passing turn.`);
      this.gameClient.pass();
    }

    this.ui.render();
    this.nextTurn();
  }

  handleCardClick(card) {
    this.gameClient.toggleCardSelection(card);
    this.ui.renderSelectedCards();
  }

  handleNewGameClick() {
    log(`Game initialized`);
    this.init();
  }

  handleResetButtonClick() {
    log(`Game reset`);
    this.clearStorage();
    this.gameClient.reset();
    this.init();
  }

  handleStartGameClick() {
    log(`Game started`);
    this.gameClient.start();
    this.ui.render();
    this.nextTurn();
  }

  handleHumanPlay() {
    this.ui.clearMessage();
    const selectedCards = this.gameClient.getSelectedCards();
    if (this.gameClient.isValidPlay(selectedCards)) {
      this.gameClient.play(selectedCards);
    } else {
      log("Invalid play", selectedCards);
      this.ui.displayMessage("Invalid play", "error");
    }
    this.ui.render();
    this.nextTurn();
  }

  handleHumanPass() {
    this.ui.clearMessage();
    const passSuccessful = this.gameClient.pass();
    if (!passSuccessful) {
      this.ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    this.ui.render();
    this.nextTurn();
  }

  init() {
    // Attempt to load game state
    const loadedGameState = this.gameClient.load(this.ui);
    if (loadedGameState.loaded && !loadedGameState.gameOver) {
      // If game loaded, update selectedAI from loaded state
      if (loadedGameState.loadedPlayerPersonas && loadedGameState.loadedPlayerPersonas[1]) {
        this.selectedAI = loadedGameState.loadedPlayerPersonas[1];
      }
      this.gameClient.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);
      this.ui.render();
      return;
    }

    // If no game loaded, or game was over, start a new one.
    this.gameClient.init();

    // Initial game setup for display (hands dealt, starting player determined)
    this.gameClient.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);

    // Render initial UI with dealt hands and start button
    this.ui.render();
  }

  nextTurn() {
    log(
      `nextTurn called. Current player: ${this.gameClient.getCurrentPlayerIndex()}, type: ${
        this.gameClient.getCurrentPlayer()?.type
      }`
    );
    if (this.gameClient.isGameOver()) {
      return;
    }
    const currentPlayer = this.gameClient.getCurrentPlayer();
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
    const gameClient = new GameClient(game);
    const app = new App(gameClient, new UIClass(gameClient), new AnalyticsClass());

    app.ui.render();
    app.init();
    return app;
  }
}
