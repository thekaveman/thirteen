import { assert } from "./utils.js";
import { gameState, findLowestCardInGame, findStartingPlayer, sortHand, switchToNextPlayer } from "../src/game.js";

function test_findLowestCardInGame_findsLowestCard() {
  const hands = [
    [
      { rank: "A", suit: "♠", value: 48 },
      { rank: "K", suit: "♣", value: 45 },
    ],
    [
      { rank: "3", suit: "♦", value: 2 },
      { rank: "4", suit: "♠", value: 4 },
    ],
  ];
  const lowestCard = findLowestCardInGame(hands);
  assert(lowestCard.value === 2, "Should find the lowest card in the game");
}

function test_findStartingPlayer_findsPlayerWithLowestCard() {
  const hands = [
    [
      { rank: "A", suit: "♠", value: 48 },
      { rank: "K", suit: "♣", value: 45 },
    ],
    [
      { rank: "3", suit: "♦", value: 2 },
      { rank: "4", suit: "♠", value: 4 },
    ],
  ];
  const startingPlayer = findStartingPlayer(hands);
  assert(startingPlayer === 1, "Player with the lowest card should start");
}

function test_gameState() {}

function test_sortHand_sortsHandByValue() {
  const hand = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "3", suit: "♦", value: 2 },
    { rank: "K", suit: "♣", value: 45 },
  ];
  sortHand(hand);
  assert(hand[0].value === 2, "Hand should be sorted by value");
  assert(hand[1].value === 45, "Hand should be sorted by value");
  assert(hand[2].value === 48, "Hand should be sorted by value");
}

function test_switchToNextPlayer_switchesPlayer() {
  gameState.currentPlayer = 0;
  gameState.numPlayers = 2;
  switchToNextPlayer();
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
  switchToNextPlayer();
  assert(gameState.currentPlayer === 0, "Should switch back to the first player");
  switchToNextPlayer();
  assert(gameState.currentPlayer === 1, "Should switch to the next player");
}

export const gameTests = [
  test_findLowestCardInGame_findsLowestCard,
  test_findStartingPlayer_findsPlayerWithLowestCard,
  test_gameState,
  test_sortHand_sortsHandByValue,
  test_switchToNextPlayer_switchesPlayer,
];
