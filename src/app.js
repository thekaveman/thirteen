import { log } from "./utils.js";
import { HumanPlayer, AIPlayer } from "./player.js";

export class App {
  /**
   * Creates a new app instance with dependencies.
   * @param {Game} game
   * @param {AI} ai
   * @param {UI} ui
   */
  constructor(game, ai, ui) {
    this.game = game;
    this.ai = ai;
    this.ui = ui;
    this.setTimeout = typeof window !== "undefined" ? window.setTimeout.bind(window) : setTimeout;

    this.ui.init(this.game);
  }

  attachHandlers() {
    const humanPlayer = this.game.gameState.players.find((p) => p.type === "human");
    if (humanPlayer) {
      this.ui.playButton.addEventListener("click", () => this.handleHumanPlay());
      this.ui.passButton.addEventListener("click", () => this.handleHumanPass());
    }
    this.ui.startGameButton.addEventListener("click", () => this.handleStartGameClick());
    this.ui.newGameButton.addEventListener("click", () => this.handleNewGameClick());
  }

  handleAITurn() {
    const aiPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (aiPlayer.type !== "ai") {
      return;
    }

    const move = aiPlayer.takeTurn();

    if (move && move.length > 0) {
      this.game.gameState.selectedCards = move;
      this.game.playCards();
    } else {
      this.game.passTurn();
    }
    this.ui.render();

    this.nextTurn();
  }

  handleNewGameClick() {
    log(`Game initialized`);
    this.init(this.setTimeout);
    this.ui.render();
  }

  handleStartGameClick() {
    log(`Game started`);
    this.game.start();
    this.attachHandlers();
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
      this.attachHandlers();
      return;
    }

    // If no game loaded, or game was over, start a new one.
    this.game.reset();

    // Initial game setup for display (hands dealt, starting player determined)
    const playerTypes = ["human", "ai"];
    const players = playerTypes.map((type, index) => {
      if (type === "ai") {
        return new AIPlayer(this.game, index, this.ai);
      }
      return new HumanPlayer(this.game, index, this.ui);
    });
    // Set up players for a new game
    this.game.setPlayers(players);
    this.game.save();

    // Render initial UI with dealt hands and start button
    this.ui.render();
    this.attachHandlers();
  }

  nextTurn() {
    if (this.game.gameState.gameOver) {
      return;
    }
    const currentPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (currentPlayer.type === "ai") {
      this.setTimeout(() => this.handleAITurn(), 1000);
    }
  }
}
