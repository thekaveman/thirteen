import type { Analytics as AnalyticsClass } from "./analytics.js";
import { Analytics } from "./analytics.js";
import type { Card } from "./game/deck.js";
import type { Deck } from "./game/deck.js";
import type { Game } from "./game/game.js";
import type { GameClient } from "./game/client.js";
import { Deck as DeckClass, Game as GameClass, GameClient as GameClientClass } from "./game/index.js";
import type { Player } from "./player/base.js";
import type { AIPlayer } from "./player/ai.js";
import { createPlayer, PLAYER_TYPES } from "./player/index.js";
import { AI_PERSONAS } from "./ai/personas.js";
import { log } from "./utils.js";
import { UI as UI } from "./ui.js";

export interface AppOptions {
  stateKey?: string;
  DeckClass?: typeof Deck;
  GameClass?: typeof Game;
  UIClass?: typeof UI;
  AnalyticsClass?: typeof Analytics;
}

export class App {
  analytics: AnalyticsClass;
  gameClient: GameClient;
  ui: UI;
  setTimeout: ((_fn: () => void, _ms: number) => number) | undefined;
  humanPlayer!: Player | null;
  selectedAI: string;
  aiPlayers: Player[];
  numAIPlayers: number;

  /**
   * Creates a new app instance with dependencies.
   * @param gameClient The game client instance.
   * @param ui The UI instance.
   * @param analytics The analytics instance.
   */
  constructor(gameClient: GameClient, ui: UI, analytics: AnalyticsClass = new Analytics()) {
    this.analytics = analytics;
    this.gameClient = gameClient;
    this.attachHooks(); // attach analytics hooks

    this.ui = ui;
    this.setTimeout =
      typeof window !== "undefined" ? setTimeout.bind(window) : undefined;

    this.ui.init();
    this.ui.on("playClicked", () => this.handleHumanPlay());
    this.ui.on("passClicked", () => this.handleHumanPass());
    this.ui.on("newGameClicked", () => this.handleNewGameClick());
    this.ui.on("cancelClicked", () => this.handleCancelClick());
    this.ui.on("resetClicked", () => this.handleResetButtonClick());
    this.ui.on("startClicked", () => this.handleStartGameClick());
    this.ui.on("aiChanged", (selectedAI: unknown) => this.handleAISelection(selectedAI as string));
    this.ui.on("cardClicked", (card: unknown) => this.handleCardClick(card as Card));

    this.selectedAI = "random";
    this.aiPlayers = [];
    this.numAIPlayers = 1;
  }

  attachHooks(): void {
    this.gameClient.attachHooks(this.analytics);
  }

  /**
   * Clears localStorage.
   */
  clearStorage(): void {
    localStorage.clear();
  }

  /**
   * Creates a new AI player with the "Random" persona.
   * @returns The created AI player.
   */
  async addAIPlayer(): Promise<Player> {
    const aiPlayer = await createPlayer({
      gameClient: this.gameClient,
      type: PLAYER_TYPES.AI,
      number: this.numAIPlayers,
      persona: "random",
      id: crypto.randomUUID(),
    });
    this.aiPlayers.push(aiPlayer);
    this.numAIPlayers++;
    return aiPlayer;
  }

  /**
   * Removes the last AI player.
   */
  removeAIPlayer(): void {
    if (this.aiPlayers.length > 0) {
      this.aiPlayers.pop();
      this.numAIPlayers--;
    }
  }

  handleAISelection(selectedAI: string): void {
    this.selectedAI = selectedAI;
    // Update AI player persona if it exists
    const ai = this.aiPlayers[0];
    if (ai && ai.type === PLAYER_TYPES.AI) {
      this.gameClient.setAIPersona(1, selectedAI);
    }
    if (this.humanPlayer && this.aiPlayers.length > 0) {
      this.gameClient.setPlayers([this.humanPlayer, ...this.aiPlayers]);
      this.ui.render();
    }
  }

  handleAITurn(): void {
    const aiPlayer = this.gameClient.getCurrentPlayer() as AIPlayer;
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

  handleCardClick(card: Card): void {
    this.gameClient.toggleCardSelection(card);
    this.ui.renderSelectedCards();
  }

  handleNewGameClick(): void {
    log("Game initialized");
    this.init();
  }

  handleCancelClick(): void {
    log("Cancel clicked - clearing selected cards");
    this.gameClient.clearSelectedCards();
    this.ui.renderSelectedCards();
  }

  handleResetButtonClick(): void {
    log("Game reset");
    this.clearStorage();
    this.gameClient.reset();
    this.init();
  }

  handleStartGameClick(): void {
    log("Game started");
    // Set up all players (human + AI) and start the game
    const humanPlayer = this.gameClient.getFirstHumanPlayer();
    if (!humanPlayer) return;

    this.gameClient.start();
    this.ui.render();
    this.nextTurn();
  }

  handleHumanPlay(): void {
    this.ui.clearMessage();
    if (!this.gameClient.isGameStarted()) {
      this.gameClient.start();
      this.ui.render();
    }
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

  handleHumanPass(): void {
    this.ui.clearMessage();
    if (!this.gameClient.isGameStarted()) {
      this.gameClient.start();
      this.ui.render();
    }
    const passSuccessful = this.gameClient.pass();
    if (!passSuccessful) {
      this.ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    this.ui.render();
    this.nextTurn();
  }

  async init(): Promise<void> {
    // Create human player
    this.humanPlayer = await createPlayer({
      gameClient: this.gameClient,
      type: PLAYER_TYPES.HUMAN,
      number: 0,
      id: crypto.randomUUID(),
    });

    // Attempt to load game state
    const loadedGameState = await this.gameClient.load(this.ui);
    if (loadedGameState.loaded && !loadedGameState.gameOver) {
      // Restore AI configuration from saved state
      this.numAIPlayers = this.gameClient.getNumAIPlayers();
      const aiPersonas = this.gameClient.getAIPersonas();

      // Create AI players with saved personas
      this.aiPlayers = [];
      for (let i = 0; i < this.numAIPlayers; i++) {
        const persona = aiPersonas[i];
        const aiPlayer = await createPlayer({
          gameClient: this.gameClient,
          type: PLAYER_TYPES.AI,
          number: i + 1,
          persona: persona || "random",
          id: crypto.randomUUID(),
        });
        this.aiPlayers.push(aiPlayer);
      }

      this.gameClient.setPlayers([this.humanPlayer, ...this.aiPlayers], { skipDeal: true });
      this.ui.render();
      return;
    }

    // No saved game, or game is over: start a new one
    this.gameClient.init();

    // Use saved AI configuration if available, otherwise create a default one
    const savedNumAIPlayers = this.gameClient.getNumAIPlayers();
    if (savedNumAIPlayers > 0) {
      this.numAIPlayers = savedNumAIPlayers;
      const aiPersonas = this.gameClient.getAIPersonas();

      this.aiPlayers = [];
      for (let i = 0; i < this.numAIPlayers; i++) {
        const persona = aiPersonas[i] || "random";
        const aiPlayer = await createPlayer({
          gameClient: this.gameClient,
          type: PLAYER_TYPES.AI,
          number: i + 1,
          persona,
          id: crypto.randomUUID(),
        });
        this.aiPlayers.push(aiPlayer);
      }
    } else {
      this.numAIPlayers = 1;
      const aiPlayer = await createPlayer({
        gameClient: this.gameClient,
        type: PLAYER_TYPES.AI,
        number: 1,
        persona: "random",
        id: crypto.randomUUID(),
      });
      this.aiPlayers = [aiPlayer];
    }

    this.gameClient.setPlayers([this.humanPlayer, ...this.aiPlayers]);

    // Render initial UI with dealt hands and start button
    this.ui.render();
  }

  nextTurn(): void {
    log(
      `nextTurn called. Current player: ${this.gameClient.getCurrentPlayerIndex()}, type: ${
        this.gameClient.getCurrentPlayer()!.type
      }`,
    );
    if (this.gameClient.isGameOver()) {
      return;
    }
    const currentPlayer = this.gameClient.getCurrentPlayer();
    if (currentPlayer.type === PLAYER_TYPES.AI) {
      if (this.setTimeout) {
        this.setTimeout(() => this.handleAITurn(), 1000);
      }
    } else {
      log("Human player's turn. Waiting for user input.");
      // If it's a human player's turn, do nothing and wait for user input
      return;
    }
  }

  /**
   * Factory function to create an App instance with customizable dependencies.
   * @param options Options for creating the app.
   * @returns A new App instance.
   */
  static async create(options: AppOptions = {}): Promise<App> {
    const {
      stateKey = GameClass.STATE_KEY,
      DeckClass: DeckCls = DeckClass,
      GameClass: GameCls = GameClass,
      UIClass: UICls = UI,
      AnalyticsClass: AnalyticsCls = Analytics,
    } = options;

    const deck = new DeckCls();
    const game = new GameCls(deck, stateKey);
    const gameClient = new GameClientClass(game);
    const app = new App(gameClient, new UICls(gameClient), new AnalyticsCls());

    await app.init();
    return app;
  }
}
