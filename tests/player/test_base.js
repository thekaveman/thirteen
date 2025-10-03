import { PLAYER_TYPES } from "../../src/app/constants.js";
import { HumanPlayer, AIPlayer } from "../../src/app/player/index.js";
import { MockAI, MockUI, MockGame } from "../mocks.js";

describe("Player", () => {
  describe("Player Constructor", () => {
    it("should correctly initialize HumanPlayer", () => {
      const game = new MockGame();
      const humanPlayer = new HumanPlayer(game, 0, new MockUI());
      expect(humanPlayer.type).to.equal(PLAYER_TYPES.HUMAN);
      expect(humanPlayer.ui).to.not.be.null;
    });

    it("should correctly initialize AIPlayer", () => {
      const game = new MockGame();
      const ai = new MockAI();
      const aiPlayer = new AIPlayer(game, 1, ai);
      expect(aiPlayer.type).to.equal(PLAYER_TYPES.AI);
      expect(aiPlayer.ai).to.equal(ai);
    });
  });
});
