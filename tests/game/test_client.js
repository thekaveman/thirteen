import { Game } from "../../src/app/game/game.js";
import { GameClient } from "../../src/app/game/client.js";
import { Deck, Card } from "../../src/app/game/deck.js";
import { HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockUI } from "../mocks.js";

describe("GameClient", () => {
  let game;
  let gameClient;

  beforeEach(() => {
    game = new Game(new Deck());
    gameClient = new GameClient(game);
  });

  describe("constructor", () => {
    it("should create a new GameClient instance", () => {
      expect(gameClient).to.be.an.instanceOf(GameClient);
    });

    it("should have a game property", () => {
      expect(gameClient.game).to.equal(game);
    });
  });
});
