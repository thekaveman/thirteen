const chai = require("chai");
const sinon = require("sinon");
const { JSDOM } = require("jsdom");
const { MockDeck, MockGame, MockAI, MockUI, MockAnalytics, MockLocalStorage } = require("./mocks.js");

// Import the actual classes
const { Game } = require("../src/app/game.js");
const { UI } = require("../src/app/ui.js");
const { App } = require("../src/app/app.js");

global.expect = chai.expect;
global.sinon = sinon;
global.JSDOM = JSDOM;
global.MockDeck = MockDeck;
global.MockGame = MockGame;
global.MockAI = MockAI;
global.MockUI = MockUI;
global.MockAnalytics = MockAnalytics;

// Make the actual classes available globally for stubbing
global.Game = Game;
global.UI = UI;
global.App = App;

sinon.useFakeTimers(); // Prevents endless test loop

let gameStub, uiStub;

exports.mochaHooks = {
  beforeEach() {
    // Setup JSDOM for Node.js tests that require DOM manipulation
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    global.window = dom.window;
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

    uiStub = sinon.stub(global, "UI").callsFake(function (game) {
      const instance = new MockUI(game);
      sinon.spy(instance, "render");
      return instance;
    });
  },
  afterEach() {
    gameStub.restore();
    uiStub.restore();
  },
  afterAll() {
    sinon.restore();
  },
};

exports.getGameStub = () => gameStub;
exports.getUiStub = () => uiStub;
