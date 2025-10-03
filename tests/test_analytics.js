import { Analytics } from "../src/app/analytics.js";
import { Game } from "../src/app/game.js";
import { PLAYER_TYPES } from "../src/app/constants.js";
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

describe("Analytics", () => {
  let game, analytics, mockAmplitude;

  beforeEach(() => {
    game = new Game(new MockDeck(), "test-game");
    game.gameState.playerTypes = [PLAYER_TYPES.HUMAN, PLAYER_TYPES.AI];
    game.setPlayers(game.createPlayers(new MockAI(game), new MockUI(game)));
    analytics = new Analytics();
    mockAmplitude = new MockAmplitude();
    analytics.api = mockAmplitude;
  });

  it("gameInit() should send the correct payload", () => {
    analytics.gameInit(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_initialized");
    expect(event.payload.game.id).to.equal(game.id);
  });

  it("gameReset() should send the correct payload", () => {
    analytics.gameReset(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_reset");
    expect(event.payload.game.id).to.equal(game.id);
  });

  it("gameStarted() should send the correct payload and identify the player", () => {
    analytics.gameStarted(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_started");
    expect(event.payload.game.id).to.equal(game.id);
    expect(mockAmplitude.identifiedPlayer).to.not.be.null;
  });

  it("gameWon() should send the correct payload", () => {
    analytics.gameWon(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_won");
    expect(event.payload.game.id).to.equal(game.id);
  });

  it("roundPlayed() should send the correct payload", () => {
    analytics.roundPlayed(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("round_played");
    expect(event.payload.game.id).to.equal(game.id);
  });

  it("playerMoved() should send the correct payload", () => {
    analytics.playerMoved(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("player_moved");
    expect(event.payload.game.id).to.equal(game.id);
  });

  it("playerPassed() should send the correct payload", () => {
    analytics.playerPassed(game);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("player_passed");
    expect(event.payload.game.id).to.equal(game.id);
  });
});
