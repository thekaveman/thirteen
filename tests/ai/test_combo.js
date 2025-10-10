import { ComboAI } from "../../src/app/ai/index.js";
import { MockGame, MockAI, MockGameClient, MockDeck } from "../mocks.js";

describe("ComboAI", () => {
  let game, gameClient, mockAI1, mockAI2, comboAI;

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    gameClient = new MockGameClient(game);
    mockAI1 = new MockAI(gameClient, ["card1"]);
    mockAI2 = new MockAI(gameClient, ["card2"]);
    comboAI = new ComboAI(gameClient, [mockAI1, mockAI2], "test-combo");
  });

  it("should be initialized with multiple AI strategies", () => {
    expect(comboAI.strategies).to.have.lengthOf(2);
    expect(comboAI.strategies[0]).to.equal(mockAI1);
    expect(comboAI.strategies[1]).to.equal(mockAI2);
  });

  it("data() should return the combo AI's data including strategy types", () => {
    const data = comboAI.data();
    expect(data.type).to.equal("test-combo");
    expect(data.strategies).to.deep.equal(["mock", "mock"]);
  });

  it("select() should throw an error for the base class", () => {
    expect(() => comboAI.select([], [], 0, [])).to.throw("Subclasses must implement select()");
  });

  it("takeTurn() should call select() and return the chosen strategy's move", () => {
    const selectStub = sinon.stub(comboAI, "select").returns(mockAI1);
    const move = comboAI.takeTurn([], [], 0, []);
    expect(selectStub.calledOnce).to.be.true;
    expect(move).to.deep.equal(["card1"]);
    selectStub.restore();
  });
});
