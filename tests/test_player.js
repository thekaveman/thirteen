import { assert } from "./utils.js";
import { Player } from "../src/player.js";
import { createCard } from "../src/deck.js";
import { TestAI } from "./test_ai.js";

function test_Player_constructor() {
  const humanPlayer = new Player("human");
  assert(humanPlayer.type === "human", "Player constructor should set the type to human");
  assert(humanPlayer.ai === null, "Human player should have no AI");

  const ai = new TestAI();
  const aiPlayer = new Player("ai", ai);
  assert(aiPlayer.type === "ai", "Player constructor should set the type to ai");
  assert(aiPlayer.ai === ai, "AI player should have an AI instance");
}

function test_Player_takeTurn_ai() {
  const move = [createCard("5", "♦")];
  const ai = new TestAI(move);
  const player = new Player("ai", ai);
  const selectedMove = player.takeTurn([], [], 0, []);
  assert(selectedMove === move, "AI player should return the move from the AI");
}

function test_Player_takeTurn_human() {
  const humanPlayer = new Player("human");
  const move = humanPlayer.takeTurn();
  assert(move === null, "Human player's takeTurn should return null");
}

export const playerTests = [test_Player_constructor, test_Player_takeTurn_ai, test_Player_takeTurn_human];
