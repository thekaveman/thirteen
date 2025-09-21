import { log } from "./utils.js";
import { HumanPlayer, AIPlayer } from "./player.js";

export class App {
  /**
   * Creates a new app instance with dependencies.
   * @param {Deck} deck
   * @param {Game} game
   * @param {AI} ai
   * @param {UI} ui
   */
  constructor(deck, game, ai, ui) {
    this.deck = deck;
    this.game = game;
    this.ai = ai;
    this.ui = ui;
    this.setTimeout = typeof window !== "undefined" ? window.setTimeout : setTimeout;
  }

  init(currentSetTimeout = null) {
    if (currentSetTimeout != null) {
      this.setTimeout = currentSetTimeout;
    }
    this.game.reset();
    this.game.start(this.deck);
    this.game.gameState.players = this.game.gameState.playerTypes.map((type, index) => {
      if (type === "ai") {
        return new AIPlayer(this.game, index, this.ai);
      }
      return new HumanPlayer(this.game, index, this.ui);
    });

    log(`New game started`);

    this.ui.init(this.game);
    this.ui.render();

    const humanPlayer = this.game.gameState.players.find((p) => p.type === "human");
    if (humanPlayer) {
      this.ui.playButton.addEventListener("click", () => this.handleHumanPlay());
      this.ui.passButton.addEventListener("click", () => this.handleHumanPass());
    }

    this.ui.newGameButton.addEventListener("click", () => this.init());

    this.nextTurn();
  }

  nextTurn() {
    const currentPlayer = this.game.gameState.players[this.game.gameState.currentPlayer];
    if (currentPlayer.type === "ai") {
      this.setTimeout(() => this.handleAITurn(), 1000);
    }
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
}
