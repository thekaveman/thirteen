import { Analytics } from "../src/app/analytics.js";
import { Game } from "../src/app/game.js";
import { PLAYER_TYPES } from "../src/app/constants.js";
import { assert } from "./utils.js";
import { MockDeck, MockAI, MockUI } from "./mocks.js";

class MockAmplitude {
  constructor() {
    this.events = [];
    this.identifiedPlayer = null;
    this.Identify = class {
      constructor() {
        this._properties = {};
      }
      setOnce(key, value) {
        if (!this._properties.hasOwnProperty(key)) {
          this._properties[key] = value;
        }
        return this;
      }
      set(key, value) {
        this._properties[key] = value;
        return this;
      }
      add(key, value) {
        if (!this._properties.hasOwnProperty(key)) {
          this._properties[key] = 0;
        }
        this._properties[key] += value;
        return this;
      }
    };
  }

  track(eventType, payload) {
    this.events.push({ eventType, payload });
  }

  identify(player) {
    this.identifiedPlayer = player;
  }
}

function testSetup() {
  const game = new Game(MockDeck, "test-game");
  game.gameState.playerTypes = [PLAYER_TYPES.HUMAN, PLAYER_TYPES.AI];
  game.setPlayers(game.createPlayers(new MockAI(game), new MockUI(game)));
  const analytics = new Analytics();
  const mockAmplitude = new MockAmplitude();
  analytics.api = mockAmplitude;
  return { game, analytics, mockAmplitude };
}

function test_gameInit_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.gameInit(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "game_initialized", "Event type should be game_initialized");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

function test_gameReset_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.gameReset(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "game_reset", "Event type should be game_reset");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

function test_gameStarted_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.gameStarted(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "game_started", "Event type should be game_started");
  assert(event.payload.game.id === game.id, "Game ID should match");
  assert(mockAmplitude.identifiedPlayer, "Player should be identified");
}

function test_gameWon_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.gameWon(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "game_won", "Event type should be game_won");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

function test_roundPlayed_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.roundPlayed(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "round_played", "Event type should be round_played");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

function test_playerMoved_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.playerMoved(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "player_moved", "Event type should be player_moved");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

function test_playerPassed_sendsCorrectPayload() {
  const { game, analytics, mockAmplitude } = testSetup();
  analytics.playerPassed(game);
  const event = mockAmplitude.events[0];
  assert(event.eventType === "player_passed", "Event type should be player_passed");
  assert(event.payload.game.id === game.id, "Game ID should match");
}

export const analyticsTests = [
  test_gameInit_sendsCorrectPayload,
  test_gameReset_sendsCorrectPayload,
  test_gameStarted_sendsCorrectPayload,
  test_gameWon_sendsCorrectPayload,
  test_roundPlayed_sendsCorrectPayload,
  test_playerMoved_sendsCorrectPayload,
  test_playerPassed_sendsCorrectPayload,
];
