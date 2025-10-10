import { RandomComboAI } from "../../src/app/ai/index.js";
import { Card, Game, GameClient } from "../../src/app/game/index.js";
import { MockDeck } from "../mocks.js";

describe("RandomComboAI", () => {
  let game, gameClient, randomComboAI, strategy1, strategy2;

  beforeEach(() => {
    game = new Game(new MockDeck());
    gameClient = new GameClient(game);

    // Create dummy strategies
    strategy1 = {
      takeTurn: sinon.stub().returns([new Card("3", "♠")]),
      findAllValidMoves: sinon.stub().returns([[new Card("3", "♠")]]),
    };
    strategy2 = {
      takeTurn: sinon.stub().returns([new Card("4", "♦")]),
      findAllValidMoves: sinon.stub().returns([[new Card("4", "♦")]]),
    };

    randomComboAI = new RandomComboAI(gameClient, [strategy1, strategy2]);
  });

  it("select() should return a random strategy", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦")];
    const playPile = [];
    const currentTurn = 1;
    const allPlayerHands = [hand];

    const selectedStrategy = randomComboAI.select(hand, playPile, currentTurn, allPlayerHands);
    expect([strategy1, strategy2]).to.include(selectedStrategy);
  });

  it("takeTurn() should call the takeTurn of the selected strategy", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦")];
    const playPile = [];
    const currentTurn = 1;
    const allPlayerHands = [hand];

    // Stub the select method to control which strategy is chosen
    const selectStub = sinon.stub(randomComboAI, "select").returns(strategy1);

    const move = randomComboAI.takeTurn(hand, playPile, currentTurn, allPlayerHands);

    expect(selectStub.calledOnce).to.be.true;
    expect(strategy1.takeTurn.calledOnce).to.be.true;
    expect(strategy2.takeTurn.called).to.be.false;
    expect(move).to.deep.equal([new Card("3", "♠")]);

    selectStub.restore();
  });

  it("takeTurn() should return an empty array if no strategy is selected", () => {
    const hand = [new Card("3", "♠"), new Card("4", "♦")];
    const playPile = [];
    const currentTurn = 1;
    const allPlayerHands = [hand];

    const selectStub = sinon.stub(randomComboAI, "select").returns(null);

    const move = randomComboAI.takeTurn(hand, playPile, currentTurn, allPlayerHands);

    expect(selectStub.calledOnce).to.be.true;
    expect(move).to.deep.equal([]);

    selectStub.restore();
  });

  it("select() should return null if there are no strategies", () => {
    const emptyAI = new RandomComboAI(gameClient, []);
    const selectedStrategy = emptyAI.select([], [], 1, []);
    expect(selectedStrategy).to.be.null;
  });
});
