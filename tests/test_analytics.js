import { Analytics } from "../src/app/analytics.js";
import { Game } from "../src/app/game.js";
import { PLAYER_TYPES } from "../src/app/constants.js";
import { MockDeck, MockAI, MockUI, MockAmplitude } from "./mocks.js";

describe("Analytics", () => {
  let game, analytics, mockAmplitude;

  beforeEach(() => {
    game = new Game(new MockDeck(), "test-game");
    game.gameState.playerTypes = [PLAYER_TYPES.HUMAN, PLAYER_TYPES.AI];
    game.gameState.playerPersonas = [null, "random"];
    game.setPlayers(game.createPlayers(new MockUI(game)));
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

  describe("Error Handling", () => {
    let errorStub;

    beforeEach(() => {
      errorStub = sinon.stub(console, "error");
    });

    afterEach(() => {
      errorStub.restore();
    });

    it("gameInit() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameInit(game);
      // No assertion, just checking for absence of errors
    });

    it("gameReset() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameReset(game);
      // No assertion, just checking for absence of errors
    });

    it("gameStarted() should handle analytics errors gracefully", () => {
      mockAmplitude.identify = () => {
        throw mockAmplitude.error;
      };
      analytics.gameStarted(game);
      // No assertion, just checking for absence of errors
    });

    it("gameWon() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameWon(game);
      // No assertion, just checking for absence of errors
    });

    it("roundPlayed() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.roundPlayed(game);
      // No assertion, just checking for absence of errors
    });

    it("playerMoved() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.playerMoved(game);
      // No assertion, just checking for absence of errors
    });

    it("playerPassed() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.playerPassed(game);
      // No assertion, just checking for absence of errors
    });
  });
});
