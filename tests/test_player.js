import { Card } from "../src/app/deck.js";
import { HumanPlayer, AIPlayer } from "../src/app/player.js";
import { assert } from "./utils.js";
import { MockAI, MockUI, MockGame } from "./mocks.js";

function test_Player_constructor() {
  const game = new MockGame();

  const humanPlayer = new HumanPlayer(game, 0, new MockUI());
  assert(humanPlayer.type === "human", "Player constructor should set the type to human");
  assert(humanPlayer.ui !== null, "Human player should have a UI instance");

  const ai = new MockAI();
  const aiPlayer = new AIPlayer(game, 1, ai);
  assert(aiPlayer.type === "ai", "Player constructor should set the type to ai");
  assert(aiPlayer.ai === ai, "AI player should have an AI instance");
}

function test_HumanPlayer_handleCardClick_preventsSelectionOfOtherPlayersCards() {
  const game = new MockGame();
  const ui = new MockUI();
  ui.renderPlayerHand = (playerIndex, handDiv) => {
    const card = game.gameState.playerHands[playerIndex][0];
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.dataset.card = JSON.stringify(card);
    handDiv.appendChild(cardElement);
  };
  const humanPlayer = new HumanPlayer(game, 0, ui);
  // Setup initial game state
  game.gameState.currentPlayer = 0;
  game.gameState.numPlayers = 2;
  game.gameState.playerHands = [
    [new Card("3", "♠")], // Player 0's hand
    [new Card("4", "♦")], // Player 1's hand
  ];
  game.gameState.selectedCards = [];

  // Mock DOM elements for player hands and cards
  const player0HandDiv = document.createElement("div");
  player0HandDiv.id = "player-hand-0";
  const player1HandDiv = document.createElement("div");
  player1HandDiv.id = "player-hand-1";

  // Render hands to attach event listeners
  ui.renderPlayerHand(0, player0HandDiv);
  ui.renderPlayerHand(1, player1HandDiv);

  // Simulate clicking a card from Player 1's hand (not current player)
  const otherPlayerCardElement = player1HandDiv.querySelector(".card");
  const event = { target: otherPlayerCardElement };

  humanPlayer.handleCardClick(event);

  assert(game.gameState.selectedCards.length === 0, "Should not select card from other player's hand");
  assert(!otherPlayerCardElement.classList.contains("selected"), "Other player's card should not have 'selected' class");
}

function test_HumanPlayer_handleCardClick_selectsAndDeselectsCard() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  const card = new Card("A", "♠");
  // Setup initial game state for the current player
  game.gameState.currentPlayer = 0;
  game.gameState.playerHands = [
    [card], // Player 0's hand
    [], // Other players' hands can be empty for this test
  ];
  game.gameState.selectedCards = [];

  const tmp = document.createElement(`div`);

  const event = { target: { dataset: { card: JSON.stringify(card) }, classList: tmp.classList } };

  humanPlayer.handleCardClick(event);
  assert(game.gameState.selectedCards.length === 1, "Should select one card");
  assert(game.gameState.selectedCards[0].value === card.value, "Should select the correct card");

  humanPlayer.handleCardClick(event);
  assert(game.gameState.selectedCards.length === 0, "Should deselect the card");
}

function test_HumanPlayer_handlePassButtonClick_endsRoundCorrectly() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  game.gameState.numPlayers = 3;
  game.gameState.currentPlayer = 2; // Player 3 is passing
  game.gameState.lastPlayerToPlay = 1; // Player 2 was the last to play
  game.gameState.consecutivePasses = 1; // Player 1 already passed
  game.gameState.roundNumber = 1;
  game.gameState.playPile = [new Card("A", "♠")];

  humanPlayer.handlePassButtonClick();

  assert(game.gameState.playPile.length === 0, "Should clear the play pile");
  assert(game.gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(game.gameState.currentPlayer === 1, "Should set the current player to the round winner");
  assert(game.gameState.roundNumber === 2, "Should increment the round number");
}

function test_HumanPlayer_handlePassButtonClick_firstPlayOfRound() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  game.gameState.playPile = []; // Empty play pile indicates the start of a round
  const originalState = { ...game.gameState };

  humanPlayer.handlePassButtonClick();

  assert(game.gameState.currentPlayer === originalState.currentPlayer, "Should not change current player");
  assert(game.gameState.consecutivePasses === originalState.consecutivePasses, "Should not change consecutive passes");
}

function test_HumanPlayer_handlePassButtonClick_incrementsPassesAndSwitchesPlayer() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  game.gameState.numPlayers = 3;
  game.gameState.currentPlayer = 0;
  game.gameState.consecutivePasses = 0;
  game.gameState.playPile = [new Card("3", "♠")]; // Not the first play
  game.gameState.selectedCards = [new Card("A", "♠")];

  humanPlayer.handlePassButtonClick();

  assert(game.gameState.currentPlayer === 1, "Should switch to the next player");
  assert(game.gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(game.gameState.consecutivePasses === 1, "Should increment consecutive passes");
}

function test_HumanPlayer_handlePlayButtonClick_showsMessageOnInvalidPlay() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  // Set up an invalid game state to make isValidPlay return false.
  game.gameState.numPlayers = 2;
  game.gameState.playerHands = [[], []];
  game.gameState.selectedCards = [new Card("3", "♠")];
  game.gameState.playPile = [new Card("A", "♠")];

  humanPlayer.handlePlayButtonClick();

  assert(ui.gameMessages.textContent === "Invalid play", "Should show invalid play message");
}

function test_HumanPlayer_handlePlayButtonClick_updatesGameStateOnValidPlay() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  // Set up a valid game state to make isValidPlay return true.
  game.gameState.currentPlayer = 0;
  game.gameState.numPlayers = 2;
  const cardToPlay = new Card("4", "♠");
  game.gameState.playerHands = [[cardToPlay, new Card("5", "♠")], []];
  game.gameState.selectedCards = [cardToPlay];
  game.gameState.playPile = [];
  game.gameState.currentTurn = 1;
  game.gameState.consecutivePasses = 1; // Should be reset

  humanPlayer.handlePlayButtonClick();

  assert(game.gameState.playerHands[0].length === 1, "Should remove card from player's hand");
  assert(game.gameState.playPile.length === 1, "Should add card to play pile");
  assert(game.gameState.playPile[0].value === 4, "Should add correct card to play pile");
  assert(game.gameState.selectedCards.length === 0, "Should clear selected cards");
  assert(game.gameState.currentPlayer === 1, "Should switch to next player");
  assert(game.gameState.consecutivePasses === 0, "Should reset consecutive passes");
  assert(game.gameState.lastPlayerToPlay === 0, "Should set the last player to play");
  assert(game.gameState.gameOver === false, "Should not set gameOver to true when player does not win");
}

function test_AIPlayer_takeTurn_ai() {
  const game = new MockGame();
  game.gameState.currentPlayer = 0;
  game.gameState.playerHands = [[]];
  const move = [new Card("5", "♦")];
  const ai = new MockAI(game, move);
  const player = new AIPlayer(game, 0, ai);
  const selectedMove = player.takeTurn();
  assert(selectedMove === move, "AI player should return the move from the AI");
}

function test_HumanPlayer_takeTurn_human() {
  const game = new MockGame();
  const ui = new MockUI();
  const humanPlayer = new HumanPlayer(game, 0, ui);
  const move = humanPlayer.takeTurn();
  assert(move === null, "Human player's takeTurn should return null");
}

export const playerTests = [
  test_Player_constructor,
  test_HumanPlayer_handleCardClick_selectsAndDeselectsCard,
  test_HumanPlayer_handleCardClick_preventsSelectionOfOtherPlayersCards,
  test_HumanPlayer_handlePassButtonClick_endsRoundCorrectly,
  test_HumanPlayer_handlePassButtonClick_firstPlayOfRound,
  test_HumanPlayer_handlePassButtonClick_incrementsPassesAndSwitchesPlayer,
  test_HumanPlayer_handlePlayButtonClick_showsMessageOnInvalidPlay,
  test_HumanPlayer_handlePlayButtonClick_updatesGameStateOnValidPlay,
  test_AIPlayer_takeTurn_ai,
  test_HumanPlayer_takeTurn_human,
];
