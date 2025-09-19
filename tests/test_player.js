import { assert } from "./utils.js";
import { gameState, resetGame } from "../src/game.js";
import { Player } from "../src/player.js";
import { createCard } from "../src/deck.js";

function test_Player_constructor() {
  const humanPlayer = new Player("human");
  assert(humanPlayer.type === "human", "Player constructor should set the type to human");
}

function test_Player_takeTurn_human() {
  const humanPlayer = new Player("human");
  const move = humanPlayer.takeTurn();
  assert(move === null, "Human player's takeTurn should return null");
}

export const playerTests = [test_Player_constructor, test_Player_takeTurn_human];
