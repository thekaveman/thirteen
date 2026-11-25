import { PrioritizedComboAI } from "../../src/app/ai/index.js";
import { MockGame, MockAI, MockDeck } from "../mocks.ts";
import { GameClient } from "../../src/app/game/index.js";
import { Card } from "../../src/app/game/index.js";

describe("PrioritizedComboAI", () => {
  let game, gameClient, mockAI1, mockAI2, mockAI3, prioritizedComboAI;

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    gameClient = new GameClient(game);
    // MockAI1 will always return a valid move
    mockAI1 = new MockAI(gameClient, [new Card("3", "♠")]);
    // MockAI2 will return no valid moves initially
    mockAI2 = new MockAI(gameClient, []);
    // MockAI3 will always return a valid move
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
    // Make mockAI1 return no valid moves
    mockAI1.validMoves = [];
    const selectedStrategy = prioritizedComboAI.select([], [], 0, []);
    expect(selectedStrategy).to.equal(mockAI3);
  });

  it("select() should return null if no strategy can make a move", () => {
    mockAI1.validMoves = [];
    mockAI2.validMoves = [];
    mockAI3.validMoves = [];
    const selectedStrategy = prioritizedComboAI.select([], [], 0, []);
    expect(selectedStrategy).to.be.null;
  });

  it("select() should call findAllValidMoves(), not takeTurn()", () => {
    const findAllValidMovesSpy = sinon.spy(mockAI1, "findAllValidMoves");
    const takeTurnSpy = sinon.spy(mockAI1, "takeTurn");

    prioritizedComboAI.select([], [], 0, []);

    expect(findAllValidMovesSpy.calledOnce).to.be.true;
    expect(takeTurnSpy.called).to.be.false;

    findAllValidMovesSpy.restore();
    takeTurnSpy.restore();
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
