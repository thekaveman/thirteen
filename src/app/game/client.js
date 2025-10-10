import { Card } from "./deck.js";
import { Game } from "./game.js";
import { PLAYER_TYPES } from "../player/index.js";

export class GameClient {
  /**
   * Creates a new GameClient instance.
   * @param {Game} game The game instance to interact with.
   */
  constructor(game) {
    this.game = game;
  }

  /**
   * Attaches analytics hooks to the game instance.
   * @param {Analytics} analytics The analytics instance to use.
   */
  attachHooks(analytics) {
    const client = this;
    this.game.hooks = {
      onGameInit: (gameClient) => analytics.gameInit(client),
      onGameReset: (gameClient) => analytics.gameReset(client),
      onGameStarted: (gameClient) => analytics.gameStarted(client),
      onGameWon: (gameClient) => analytics.gameWon(client),
      onPlayerMoved: (gameClient) => analytics.playerMoved(client),
      onPlayerPassed: (gameClient) => analytics.playerPassed(client),
      onRoundPlayed: (gameClient) => analytics.roundPlayed(client),
    };
  }

  /**
   * Clears the selected cards array.
   */
  clearSelectedCards() {
    this.game.gameState.selectedCards = [];
  }

  /**
   * Returns all data required for analytics events
   * @returns {object}
   */
  getAnalyticsData() {
    return {
      id: this.getId(),
      ended: this.isGameOver(),
      round: this.getRoundNumber(),
      started: this.isGameStarted(),
      turn: this.getCurrentTurn(),
      hands: this.getPlayerHands(),
      players: this.getPlayers().map((p) => p.data()),
      combination: this.getPlayPileCombinationType(),
      move: this.getSelectedCards(),
      pile: this.getPlayPile(),
      consecutive_passes: this.getConsecutivePasses(),
      current_player: this.getCurrentPlayer().data(),
      human_player: this.getFirstHumanPlayer()?.data(),
      ai_player: this.getFirstAIPlayer()?.data(),
      game_rounds: this.getRoundNumber(),
      game_turns: this.getCurrentTurn(),
      player_rounds_won: this.getRoundsWon(this.getCurrentPlayerIndex()),
      player_turns: this.getPlayerTurns(this.getCurrentPlayerIndex()),
      player_games_won: this.getGamesWon(this.getCurrentPlayerIndex()),
    };
  }

  /**
   * Gets the combination type of a set of cards.
   * @param {Array<Card>} cards The cards to check.
   * @returns {string} The combination type.
   */
  getCombinationType(cards) {
    return this.game.rules.getCombinationType(cards);
  }

  /**
   * Gets the number of consecutive passes.
   * @returns {number}
   */
  getConsecutivePasses() {
    return this.game.gameState.consecutivePasses;
  }

  /**
   * Gets the current player.
   * @returns {Player}
   */
  getCurrentPlayer() {
    return this.game.gameState.players[this.getCurrentPlayerIndex()];
  }

  /**
   * Gets the index of the current player.
   * @returns {number}
   */
  getCurrentPlayerIndex() {
    return this.game.gameState.currentPlayer;
  }

  /**
   * Gets the current turn number.
   * @returns {number}
   */
  getCurrentTurn() {
    return this.game.gameState.currentTurn;
  }

  /**
   * Gets the first AI player.
   * @returns {AIPlayer}
   */
  getFirstAIPlayer() {
    return this.game.gameState.players.find((p) => p.type === PLAYER_TYPES.AI);
  }

  /**
   * Gets the first human player.
   * @returns {HumanPlayer}
   */
  getFirstHumanPlayer() {
    return this.game.gameState.players.find((p) => p.type === PLAYER_TYPES.HUMAN);
  }

  /**
   * Gets the number of games won by each player.
   * @param {number} [playerIndex=-1] Optional index of the player.
   * @returns {Array<number>|number}
   */
  getGamesWon(playerIndex = -1) {
    const gamesWon = this.game.gameState.gamesWon;
    if (playerIndex > -1) {
      return gamesWon[playerIndex];
    }
    return gamesWon;
  }

  /**
   * Gets the game ID.
   * @returns {string}
   */
  getId() {
    return this.game.id;
  }

  /**
   * Gets the player hands or hand for a specific player.
   * @param {number} [playerIndex=-1] Optional index of the player.
   * @returns {Array<Array<Card>>|Array<Card>}
   */
  getPlayerHands(playerIndex = -1) {
    const hands = this.game.gameState.playerHands;
    if (playerIndex > -1) {
      return hands[playerIndex];
    }
    return hands;
  }

  /**
   * Gets the player personas.
   * @returns {Array<string>}
   */
  getPlayerPersonas(playerIndex = -1) {
    const playerPersonas = this.game.gameState.playerPersonas;
    if (playerIndex > -1) {
      return playerPersonas[playerIndex];
    }
    return playerPersonas;
  }

  /**
   * Gets the list of players or a specific player by index.
   * @param {number} [playerIndex=-1] Optional index for a player in the list of players.
   * @returns {Array<Player>|Player}
   */
  getPlayers(playerIndex = -1) {
    const players = this.game.gameState.players;
    if (playerIndex > -1) {
      return players[playerIndex];
    }
    return players;
  }

  /**
   * Gets the turn count for each player or the given player.
   * @param {number} [playerIndex=-1] Optional player index in the list of players.
   * @returns {Array<number>|number}
   */
  getPlayerTurns(playerIndex = -1) {
    const playerTurns = this.game.gameState.playerTurns;
    if (playerIndex > -1) {
      return playerTurns[playerIndex];
    }
    return playerTurns;
  }

  /**
   * Gets the play pile.
   * @returns {Array<Card>}
   */
  getPlayPile() {
    return this.game.gameState.playPile;
  }

  /**
   * Gets the combination type of the current play pile.
   * @returns {string}
   */
  getPlayPileCombinationType() {
    return this.getCombinationType(this.getPlayPile());
  }

  /**
   * Gets the current round number.
   * @returns {number}
   */
  getRoundNumber() {
    return this.game.gameState.roundNumber;
  }

  /**
   * Gets the number of rounds won by each player or the given player.
   * @param {number} [playerIndex=-1] in the list of players.
   * @returns {Array<number>|number} The rounds won for each player, or the given player.
   */
  getRoundsWon(playerIndex = -1) {
    const roundsWon = this.game.gameState.roundsWon;
    if (playerIndex > -1) {
      return roundsWon[playerIndex];
    }
    return roundsWon;
  }

  /**
   * Gets the selected cards.
   * @returns {Array<Card>}
   */
  getSelectedCards() {
    return this.game.gameState.selectedCards;
  }

  /**
   * Initializes the game state for a new round or game.
   */
  init() {
    this.game.init();
  }

  /**
   * Checks if a card is currently selected.
   * @param {Card} card The card to check.
   * @returns {boolean} True if the card is selected, False otherwise.
   */
  isCardSelected(card) {
    return this.getSelectedCards().some((selectedCard) => selectedCard.value === card.value);
  }

  /**
   * Checks if the game is over.
   * @returns {boolean}
   */
  isGameOver() {
    return this.game.gameState.gameOver;
  }

  /**
   * Checks if the game has started.
   * @returns {boolean}
   */
  isGameStarted() {
    return this.game.gameState.gameStarted;
  }

  /**
   * Checks if a play is valid.
   * @param {Array<Card>} cards The cards to check.
   * @param {Array<Card>} [playPile] The current play pile.
   * @param {Array<Card>} [hand] The player's hand.
   * @param {number} [currentTurn] The current turn number.
   * @param {Array<Array<Card>>} [allPlayerHands] All players' hands.
   * @returns {boolean}
   */
  isValidPlay(cards, playPile, hand, currentTurn, allPlayerHands) {
    return this.game.rules.isValidPlay(
      cards,
      playPile ?? this.getPlayPile(),
      hand ?? this.getPlayerHands(this.getCurrentPlayerIndex()),
      currentTurn ?? this.getCurrentTurn(),
      allPlayerHands ?? this.getPlayerHands()
    );
  }

  /**
   * Loads the game state from localStorage.
   * @param {UI} ui An instance of the UI class.
   * @returns {boolean} True if a saved game was loaded, false otherwise.
   */
  load(ui) {
    return this.game.load(ui);
  }

  /**
   * Ends the current round and starts the next.
   */
  nextRound() {
    this.game.nextRound();
  }

  /**
   * Handles a player passing their turn.
   * @returns {boolean} True if the pass was successful, false otherwise.
   */
  pass() {
    return this.game.passTurn();
  }

  /**
   * Plays a move for the current player.
   * @param {Array<Card>} move The cards to play.
   */
  play(move) {
    this.game.gameState.selectedCards = move;
    this.game.playCards();
  }

  /**
   * Resets the entire game.
   */
  reset() {
    this.game.reset();
  }

  /**
   * Updates the persona of an AI player.
   * @param {number} playerIndex The index of the player to update.
   * @param {string} persona The new persona to set.
   */
  setAIPersona(playerIndex, persona) {
    if (this.game.gameState.players[playerIndex]?.type === PLAYER_TYPES.AI) {
      this.game.gameState.playerPersonas[playerIndex] = persona;
      this.game.gameState.players[playerIndex].ai.persona = persona;
    }
  }

  /**
   * Sets the current player index.
   * @param {number} playerIndex The new current player index.
   */
  setCurrentPlayer(playerIndex) {
    this.game.gameState.currentPlayer = playerIndex;
  }

  /**
   * Initializes the game's players.
   * @param {Array<Player>} players The list of players to initialize into the game.
   */
  setPlayers(players) {
    this.game.setPlayers(players);
  }

  /**
   * Sets the play pile.
   * @param {Array<Card>} playPile The play pile to set.
   */
  setPlayPile(playPile) {
    this.game.gameState.playPile = playPile;
  }

  /**
   * Sets the hand for a specific player.
   * @param {number} playerIndex The index of the player.
   * @param {Array<Card>} hand The hand to set.
   */
  setPlayerHand(playerIndex, hand) {
    this.game.gameState.playerHands[playerIndex] = hand;
  }

  /**
   * Sets all player hands.
   * @param {Array<Array<Card>>} hands All player hands to set.
   */
  setPlayerHands(hands) {
    hands.forEach((hand, index) => {
      this.setPlayerHand(index, hand);
    });
  }

  /**
   * Marks the game as started.
   */
  start() {
    this.game.start();
  }

  /**
   * Toggles the selection of a card.
   * @param {Card} card The card to toggle.
   */
  toggleCardSelection(card) {
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
  win() {
    this.game.win();
  }
}
