import { Card } from "./deck.js";
import { Game } from "./game.js";
import type { Player } from "../player/base.js";
import type { HumanPlayer } from "../player/human.js";
import type { AIPlayer } from "../player/ai.js";
import { PLAYER_TYPES } from "../player/index.js";

export class GameClient {
  game: Game;

  /**
   * Creates a new GameClient instance.
   * @param game The game instance to interact with.
   */
  constructor(game: Game) {
    this.game = game;
  }

  /**
   * Attaches analytics hooks to the game instance.
   * @param analytics The analytics instance to use.
   */
  attachHooks(analytics: {
    gameInit: (_gc: GameClient) => void;
    gameReset: (_gc: GameClient) => void;
    gameStarted: (_gc: GameClient) => void;
    gameWon: (_gc: GameClient) => void;
    gameResigned: (_gc: GameClient) => void;
    playerMoved: (_gc: GameClient) => void;
    playerPassed: (_gc: GameClient) => void;
    roundPlayed: (_gc: GameClient) => void;
  }): void {
    this.game.hooks = {
      onGameInit: () => analytics.gameInit(this),
      onGameReset: () => analytics.gameReset(this),
      onGameStarted: () => analytics.gameStarted(this),
      onGameWon: () => analytics.gameWon(this),
      onGameResigned: () => analytics.gameResigned(this),
      onPlayerMoved: () => analytics.playerMoved(this),
      onPlayerPassed: () => analytics.playerPassed(this),
      onRoundPlayed: () => analytics.roundPlayed(this),
    };
  }

  /**
   * Clears the selected cards array.
   */
  clearSelectedCards(): void {
    this.game.gameState.selectedCards = [];
  }

  /**
   * Returns all data required for analytics events
   */
  getAnalyticsData(): {
    id: string;
    ended: boolean;
    round: number;
    started: boolean;
    turn: number;
    hands: Card[][];
    players: Array<{ id: string; type: string; number: number; persona: string | null; game: string }>;
    combination: string;
    move: Card[];
    pile: Card[];
    consecutive_passes: number;
    current_player: { id: string; type: string; number: number; persona: string | null; game: string };
    human_player: { id: string; type: string; number: number; persona: string | null; game: string } | undefined;
    ai_player: { id: string; type: string; number: number; persona: string | null; game: string } | undefined;
    game_rounds: number;
    game_turns: number;
    player_rounds_won: number;
    player_turns: number;
    player_games_won: number;
    player_games_played: number;
    version: string;
  } {
    return {
      id: this.getId(),
      ended: this.isGameOver(),
      round: this.getRoundNumber(),
      started: this.isGameStarted(),
      turn: this.getCurrentTurn(),
      hands: this.getPlayerHands() as Card[][],
      players: (this.getPlayers() as Player[]).map((p) => p.data()),
      combination: this.getPlayPileCombinationType(),
      move: this.getSelectedCards(),
      pile: this.getPlayPile(),
      consecutive_passes: this.getConsecutivePasses(),
      current_player: this.getCurrentPlayer().data() as { id: string; type: string; number: number; persona: string | null; game: string },
      human_player: this.getFirstHumanPlayer()?.data() as { id: string; type: string; number: number; persona: string | null; game: string } | undefined,
      ai_player: this.getFirstAIPlayer()?.data() as { id: string; type: string; number: number; persona: string | null; game: string } | undefined,
      game_rounds: this.getRoundNumber(),
      game_turns: this.getCurrentTurn(),
      player_rounds_won: this.getRoundsWon(this.getCurrentPlayerIndex()) as number,
      player_turns: this.getPlayerTurns(this.getCurrentPlayerIndex()) as number,
      player_games_won: this.getGamesWon(this.getCurrentPlayerIndex()) as number,
      player_games_played: this.getGamesPlayed(this.getCurrentPlayerIndex()) as number,
      version: this.game.gameState.version,
    };
  }

  /**
   * Gets the combination type of a set of cards.
   * @param cards The cards to check.
   * @returns The combination type.
   */
  getCombinationType(cards: readonly Card[]): string {
    return this.game.rules.getCombinationType(cards);
  }

  /**
   * Gets the number of consecutive passes.
   */
  getConsecutivePasses(): number {
    return this.game.gameState.consecutivePasses;
  }

  /**
   * Gets the index of the last player to play.
   */
  getLastPlayerToPlay(): number {
    return this.game.gameState.lastPlayerToPlay;
  }

  /**
   * Gets the current player.
   */
  getCurrentPlayer(): Player {
    return this.game.gameState.players[this.getCurrentPlayerIndex()];
  }

  /**
   * Gets the index of the current player.
   */
  getCurrentPlayerIndex(): number {
    return this.game.gameState.currentPlayer;
  }

  /**
   * Gets the current turn number.
   */
  getCurrentTurn(): number {
    return this.game.gameState.currentTurn;
  }

  /**
   * Gets the first AI player.
   */
  getFirstAIPlayer(): AIPlayer | undefined {
    return this.game.gameState.players.find(
      (p: Player): p is AIPlayer => p.type === PLAYER_TYPES.AI,
    ) as AIPlayer | undefined;
  }

  /**
   * Gets the first human player.
   */
  getFirstHumanPlayer(): HumanPlayer | undefined {
    return this.game.gameState.players.find(
      (p: Player): p is HumanPlayer => p.type === PLAYER_TYPES.HUMAN,
    ) as HumanPlayer | undefined;
  }

  /**
   * Gets the number of games won by each player.
   * @param playerIndex Optional index of the player.
   */
  getGamesWon(playerIndex: number = -1): number | number[] {
    const gamesWon = this.game.gameState.gamesWon;
    if (playerIndex > -1) {
      return gamesWon[playerIndex];
    }
    return gamesWon;
  }

  /**
   * Gets the number of games played by each player.
   * @param playerIndex Optional index of the player.
   */
  getGamesPlayed(playerIndex: number = -1): number | number[] {
    const gamesPlayed = this.game.gameState.gamesPlayed;
    if (playerIndex > -1) {
      return gamesPlayed[playerIndex] ?? 0;
    }
    return gamesPlayed;
  }

  /**
   * Gets the game ID.
   */
  getId(): string {
    return this.game.id;
  }

  /**
   * Gets the player hands or hand for a specific player.
   * @param playerIndex Optional index of the player.
   */
  getPlayerHands(playerIndex: number = -1): Card[] | Card[][] {
    const hands = this.game.gameState.playerHands;
    if (playerIndex > -1) {
      return hands[playerIndex];
    }
    return hands;
  }

  /**
   * Gets the player personas.
   * @param playerIndex Optional index of the player.
   */
  getPlayerPersonas(playerIndex: number = -1): string | null | (string | null)[] {
    const personas = this.game.gameState.players.map((p) => p.persona);
    if (playerIndex > -1) {
      return personas[playerIndex];
    }
    return personas;
  }

  /**
   * Gets the list of players or a specific player by index.
   * @param playerIndex Optional index for a player in the list of players.
   */
  getPlayers(playerIndex: number = -1): Player | Player[] {
    const players = this.game.gameState.players;
    if (playerIndex > -1) {
      return players[playerIndex];
    }
    return players;
  }

  /**
   * Gets the number of AI players.
   */
  getNumAIPlayers(): number {
    return this.game.gameState.numAIPlayers;
  }

  /**
   * Gets the AI personas array.
   */
  getAIPersonas(): (string | null)[] {
    return this.game.gameState.aiPersonas;
  }

  /**
   * Gets the AI persona for a given AI slot index (0-based).
   * @param aiSlotIndex The index of the AI player (0-based).
   */
  getAIPersona(aiSlotIndex: number): string | null {
    return this.game.gameState.aiPersonas[aiSlotIndex] ?? null;
  }

  /**
   * Gets the turn count for each player or the given player.
   * @param playerIndex Optional player index in the list of players.
   */
  getPlayerTurns(playerIndex: number = -1): number | number[] {
    const playerTurns = this.game.gameState.playerTurns;
    if (playerIndex > -1) {
      return playerTurns[playerIndex];
    }
    return playerTurns;
  }

  /**
   * Gets the play pile.
   */
  getPlayPile(): Card[] {
    return this.game.gameState.playPile;
  }

  /**
   * Gets the combination type of the current play pile.
   */
  getPlayPileCombinationType(): string {
    return this.getCombinationType(this.getPlayPile());
  }

  /**
   * Gets the current round number.
   */
  getRoundNumber(): number {
    return this.game.gameState.roundNumber;
  }

  /**
   * Gets the number of rounds won by each player or the given player.
   * @param playerIndex in the list of players.
   */
  getRoundsWon(playerIndex: number = -1): number | number[] {
    const roundsWon = this.game.gameState.roundsWon;
    if (playerIndex > -1) {
      return roundsWon[playerIndex];
    }
    return roundsWon;
  }

  /**
   * Gets the selected cards.
   */
  getSelectedCards(): Card[] {
    return this.game.gameState.selectedCards;
  }

  /**
   * Initializes the game state for a new round or game.
   */
  init(): void {
    this.game.init();
  }

  /**
   * Checks if a card is currently selected.
   * @param card The card to check.
   * @returns True if the card is selected, False otherwise.
   */
  isCardSelected(card: Card): boolean {
    return this.getSelectedCards().some((selectedCard) => selectedCard.value === card.value);
  }

  /**
   * Checks if the game is over.
   */
  isGameOver(): boolean {
    return this.game.gameState.gameOver;
  }

  /**
   * Checks if the game has started.
   */
  isGameStarted(): boolean {
    return this.game.gameState.gameStarted;
  }

  /**
   * Checks if a play is valid.
   * @param cards The cards to check.
   * @param playPile The current play pile.
   * @param hand The player's hand.
   * @param currentTurn The current turn number.
   * @param allPlayerHands All players' hands.
   */
  isValidPlay(
    cards: readonly Card[],
    playPile?: readonly Card[],
    hand?: readonly Card[],
    currentTurn?: number,
    allPlayerHands?: readonly Card[][],
  ): boolean {
    return this.game.rules.isValidPlay(
      cards,
      playPile ?? this.getPlayPile(),
      hand ?? this.getPlayerHands(this.getCurrentPlayerIndex()) as Card[],
      currentTurn ?? this.getCurrentTurn(),
      allPlayerHands ?? this.getPlayerHands() as Card[][],
    );
  }

  /**
   * Loads the game state from localStorage.
   * @param ui An instance of the UI class.
   * @returns True if a saved game was loaded, false otherwise.
   */
  async load(ui: unknown): Promise<{ loaded: boolean; loadedPlayerTypes?: string[]; gameOver?: boolean }> {
    return this.game.load(ui);
  }

  /**
   * Ends the current round and starts the next.
   */
  nextRound(): void {
    this.game.nextRound();
  }

  /**
   * Checks if the round should end: all players except lastPlayerToPlay have passed.
   */
  shouldEndRound(): boolean {
    return this.game.shouldEndRound();
  }

  /**
   * Handles a player passing their turn.
   * @returns True if the pass was successful, false otherwise.
   */
  pass(): boolean {
    return this.game.passTurn();
  }

  /**
   * Plays a move for the current player.
   * @param move The cards to play.
   */
  play(move: readonly Card[]): void {
    this.game.gameState.selectedCards = [...move];
    this.game.playCards();
  }

  /**
   * Resets the entire game.
   */
  reset(): void {
    this.game.reset();
  }

  /**
   * Updates the persona of an AI player.
   * @param playerIndex The index of the player to update.
   * @param persona The new persona to set.
   */
  setAIPersona(playerIndex: number, persona: string): void {
    const player = this.game.gameState.players[playerIndex];
    if (player && player.type === PLAYER_TYPES.AI) {
      player.persona = persona;
      (player as AIPlayer).ai.persona = persona;
    }
  }

  /**
   * Sets the current player index.
   * @param playerIndex The new current player index.
   */
  setCurrentPlayer(playerIndex: number): void {
    this.game.gameState.currentPlayer = playerIndex;
  }

  /**
   * Initializes the game's players.
   * @param players The list of players to initialize into the game.
   * @param options Optional configuration.
   * @param options.skipDeal If true, skip re-dealing cards (used when restoring state from save).
   */
  setPlayers(players: Player[], options?: { skipDeal?: boolean }): void {
    this.game.setPlayers(players, options);
  }

  /**
   * Sets the play pile.
   * @param playPile The play pile to set.
   */
  setPlayPile(playPile: readonly Card[]): void {
    this.game.gameState.playPile = [...playPile];
  }

  /**
   * Sets the hand for a specific player.
   * @param playerIndex The index of the player.
   * @param hand The hand to set.
   */
  setPlayerHand(playerIndex: number, hand: readonly Card[]): void {
    this.game.gameState.playerHands[playerIndex] = [...hand];
  }

  /**
   * Sets all player hands.
   * @param hands All player hands to set.
   */
  setPlayerHands(hands: readonly Card[][]): void {
    hands.forEach((hand, index) => {
      this.setPlayerHand(index, hand);
    });
  }

  /**
   * Marks the game as started.
   */
  start(): void {
    this.game.start();
  }

  /**
   * Toggles the selection of a card.
   * @param card The card to toggle.
   */
  toggleCardSelection(card: Card): void {
    const cardIndex = this.game.gameState.selectedCards.findIndex((c) => c.value === card.value);
    if (cardIndex > -1) {
      this.game.gameState.selectedCards.splice(cardIndex, 1);
    } else {
      this.game.gameState.selectedCards.push(card);
    }
    Card.sort(this.game.gameState.selectedCards);
  }

  /**
   * Marks the game as over and sets the winner
   */
  win(): void {
    this.game.win();
  }

  /**
   * Handles a player resignation.
   * @param playerIndex The index of the resigning player.
   */
  resign(playerIndex: number): void {
    this.game.resign(playerIndex);
  }
}
