import * as chai from "chai";
import sinon from "sinon";
import { JSDOM } from "jsdom";
import { MockDeck, MockGame, MockAI, MockUI, MockAnalytics, MockLocalStorage } from "./mocks.js";

global.expect = chai.expect;
global.sinon = sinon;
global.JSDOM = JSDOM;
global.MockDeck = MockDeck;
global.MockGame = MockGame;
global.MockAI = MockAI;
global.MockUI = MockUI;
global.MockAnalytics = MockAnalytics;

// Setup JSDOM for Node.js tests that require DOM manipulation
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = new MockLocalStorage();

const clock = sinon.useFakeTimers();
global.sinon.clock = clock;

export const mochaHooks = {
  afterAll() {
    sinon.restore();
  },
};
