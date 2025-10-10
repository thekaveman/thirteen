import { PrioritizedComboAI } from "../../src/app/ai/index.js";
import { MockGame, MockAI, MockGameClient, MockDeck } from "../mocks.js";
import { Card } from "../../src/app/game/index.js";

describe("PrioritizedComboAI", () => {
  let game, gameClient, mockAI1, mockAI2, mockAI3, prioritizedComboAI;

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    gameClient = new MockGameClient(game);
    // MockAI1 will always return a move
    mockAI1 = new MockAI(gameClient, [new Card("3", "♠")]);
    // MockAI2 will return no move initially, then a move
    mockAI2 = new MockAI(gameClient, []);
    // MockAI3 will always return a move
    mockAI3 = new MockAI(gameClient, [new Card("4", "♦")]);

    prioritizedComboAI = new PrioritizedComboAI(gameClient, [mockAI1, mockAI2, mockAI3]);
  });

  it("should be initialized with multiple AI strategies", () => {
    expect(prioritizedComboAI.strategies).to.have.lengthOf(3);
    expect(prioritizedComboAI.strategies[0]).to.equal(mockAI1);
    expect(prioritizedComboAI.strategies[1]).to.equal(mockAI2);
    expect(prioritizedComboAI.strategies[2]).to.equal(mockAI3);
  });

  it("select() should return the first strategy that can make a move", () => {
    const selectedStrategy = prioritizedComboAI.select([], [], 0, []);
    expect(selectedStrategy).to.equal(mockAI1);
  });

  it("select() should skip strategies that cannot make a move", () => {
    // Make mockAI1 return no move
    mockAI1.move = [];
    const selectedStrategy = prioritizedComboAI.select([], [], 0, []);
    expect(selectedStrategy).to.equal(mockAI3);
  });

  it("select() should return null if no strategy can make a move", () => {
    mockAI1.move = [];
    mockAI2.move = [];
    mockAI3.move = [];
    const selectedStrategy = prioritizedComboAI.select([], [], 0, []);
    expect(selectedStrategy).to.be.null;
  });

  it("takeTurn() should execute the selected strategy's takeTurn method", () => {
    const selectStub = sinon.stub(prioritizedComboAI, "select").returns(mockAI1);
    const takeTurnSpy = sinon.spy(mockAI1, "takeTurn");

    const move = prioritizedComboAI.takeTurn([], [], 0, []);

    expect(selectStub.calledOnce).to.be.true;
    expect(takeTurnSpy.calledOnce).to.be.true;
    expect(move).to.deep.equal([new Card("3", "♠")]);

    selectStub.restore();
    takeTurnSpy.restore();
  });

  it("takeTurn() should return an empty array if no strategy can make a move", () => {
    const selectStub = sinon.stub(prioritizedComboAI, "select").returns(null);
    const move = prioritizedComboAI.takeTurn([], [], 0, []);
    expect(move).to.be.an("array").that.is.empty;
    selectStub.restore();
  });
});
