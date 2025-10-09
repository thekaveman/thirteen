import chai from "chai";
import sinon from "sinon";
import { JSDOM } from "jsdom";
import { MockDeck, MockGame, MockAI, MockUI, MockAnalytics, MockLocalStorage, MockGameClient } from "./mocks.js";

// Import the actual classes
import { Game, GameClient } from "../src/app/game/index.js";
import { UI } from "../src/app/ui.js";
import { App } from "../src/app/app.js";

global.expect = chai.expect;
global.sinon = sinon;
global.JSDOM = JSDOM;
global.MockDeck = MockDeck;
global.MockGame = MockGame;
global.MockAI = MockAI;
global.MockUI = MockUI;
global.MockAnalytics = MockAnalytics;
global.MockGameClient = MockGameClient;

// Make the actual classes available globally for stubbing
global.Game = Game;
global.GameClient = GameClient;
global.UI = UI;
global.App = App;

let gameStub, uiStub, gameClientStub;

export const mochaHooks = {
  beforeEach() {
    // Setup JSDOM for Node.js tests that require DOM manipulation
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.window = dom.window;
    global.window.sinon = sinon;
    global.document = global.window.document;
    global.localStorage = new MockLocalStorage();
    global.localStorage.clear(); // Clear localStorage before each test

    // Mock window.amplitude for analytics
    global.window.amplitude = {
      track: sinon.spy(),
      Identify: sinon.stub().returns({
        setOnce: sinon.spy(),
        set: sinon.spy(),
        add: sinon.spy(),
      }),
      identify: sinon.spy(),
    };

    // Stub the constructors globally
    gameStub = sinon.stub(global, "Game").callsFake(function (deck, stateKey) {
      const instance = new MockGame(deck, stateKey);
      sinon.spy(instance, "init");
      sinon.spy(instance, "save");
      return instance;
    });

    gameClientStub = sinon.stub(global, "GameClient").callsFake(function (game) {
      const instance = sinon.createStubInstance(MockGameClient, { game: game });
      instance.game = game;
      return instance;
    });

    uiStub = sinon.stub(global, "UI").callsFake(function (gameClient) {
      const instance = new MockUI(gameClient);
      sinon.spy(instance, "render");
      return instance;
    });
  },
  afterEach() {
    gameStub.restore();
    uiStub.restore();
    gameClientStub.restore();
    sinon.restore();
  },
};

export const getGameStub = () => gameStub;
export const getUiStub = () => uiStub;
export const getGameClientStub = () => gameClientStub;
