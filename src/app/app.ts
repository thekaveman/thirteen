import type { Analytics as AnalyticsClass } from "./analytics";
import { Analytics } from "./analytics";
import type { Card } from "./game/deck";
import type { Deck } from "./game/deck";
import type { Game } from "./game/game";
import type { GameClient } from "./game/client";
import { Deck as DeckClass, Game as GameClass, GameClient as GameClientClass } from "./game/index";
import type { Player } from "./player/base";
import type { AIPlayer } from "./player/ai";
import { createPlayer, PLAYER_TYPES } from "./player/index";
import type { UI as UIClassType } from "./ui";
import { AI_PERSONAS } from "./ai/personas";
import { log } from "./utils";
import { UI as UI } from "./ui";

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
  setTimeoutFn: ((fn: () => void, ms: number) => number) | undefined;
  humanPlayer: Player;
  selectedAI: string;
  aiPlayers: Record<string, Player>;

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
    this.setTimeoutFn =
      typeof window !== "undefined" ? setTimeout.bind(window) : undefined;

    this.ui.init();
    this.ui.on("playClicked", () => this.handleHumanPlay());
    this.ui.on("passClicked", () => this.handleHumanPass());
    this.ui.on("newGameClicked", () => this.handleNewGameClick());
    this.ui.on("resetClicked", () => this.handleResetButtonClick());
    this.ui.on("startClicked", () => this.handleStartGameClick());
    this.ui.on("aiChanged", (selectedAI: unknown) => this.handleAISelection(selectedAI as string));
    this.ui.on("cardClicked", (card: unknown) => this.handleCardClick(card as Card));

    this.humanPlayer = createPlayer({ gameClient: this.gameClient, type: PLAYER_TYPES.HUMAN, number: 0, id: crypto.randomUUID() });
    this.selectedAI = "random"; // Default AI persona
    this.aiPlayers = {};
    // Populate aiPlayers
    for (const personaKey of Object.keys(AI_PERSONAS)) {
      this.aiPlayers[personaKey] = createPlayer({
        gameClient: this.gameClient,
        type: PLAYER_TYPES.AI,
        number: 1, // Assuming AI is always player 1
        persona: personaKey,
        id: crypto.randomUUID(),
      });
    }
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

  handleAISelection(selectedAI: string): void {
    this.selectedAI = selectedAI;
    this.gameClient.setAIPersona(1, this.selectedAI);
    this.gameClient.setPlayers([this.humanPlayer, this.aiPlayers[this.selectedAI]]);
    this.ui.render();
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

  handleResetButtonClick(): void {
    log("Game reset");
    this.clearStorage();
    this.gameClient.reset();
    this.init();
  }

  handleStartGameClick(): void {
    log("Game started");
    this.gameClient.start();
    this.ui.render();
    this.nextTurn();
  }

  handleHumanPlay(): void {
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

  handleHumanPass(): void {
    this.ui.clearMessage();
    const passSuccessful = this.gameClient.pass();
    if (!passSuccessful) {
      this.ui.displayMessage("You cannot pass on the first play of a round.", "error");
    }
    this.ui.render();
    this.nextTurn();
  }

  init(): void {
    // Attempt to load game state
    const loadedGameState = this.gameClient.load(this.ui);
    if (loadedGameState.loaded && !loadedGameState.gameOver) {
      // If game loaded, update selectedAI from loaded state
      if (loadedGameState.loadedPlayerPersonas && loadedGameState.loadedPlayerPersonas[1]) {
        this.selectedAI = loadedGameState.loadedPlayerPersonas[1] as string;
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
      if (this.setTimeoutFn) {
        this.setTimeoutFn(() => this.handleAITurn(), 1000);
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
  static create(options: AppOptions = {}): App {
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

    app.ui.render();
    app.init();
    return app;
  }
}
