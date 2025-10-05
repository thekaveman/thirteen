import { Analytics } from "../src/app/analytics.js";
import { Game } from "../src/app/game/index.js";
import { PLAYER_TYPES } from "../src/app/player/index.js";
import { MockDeck, MockUI, MockAmplitude } from "./mocks.js";

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

  it("test_idPlayer_identifiesHumanPlayerCorrectly", () => {
    const humanPlayer = game.firstHumanPlayer();
    analytics.gameStarted(game); // This calls #idPlayer

    const identifiedId = mockAmplitude.identifiedPlayer;
    expect(identifiedId).to.not.be.null;
    expect(identifiedId._properties.player).to.equal(humanPlayer.id);
    expect(identifiedId._properties.type).to.equal(humanPlayer.type);
    expect(identifiedId._properties.persona).to.be.null; // Human players have null persona
    expect(identifiedId._properties.data).to.deep.equal(humanPlayer.data());
    expect(identifiedId._properties.game).to.equal(humanPlayer.game.id);
    expect(identifiedId._properties.games_played).to.equal(1);
  });

  it("test_idPlayer_identifiesAIPlayerCorrectly", () => {
    const mockAIPlayer = {
      id: "ai-player-1",
      type: PLAYER_TYPES.AI,
      persona: "random",
      data: () => ({ some: "ai data" }),
      game: { id: "test-game" },
    };
    sinon.stub(game, "firstHumanPlayer").returns(mockAIPlayer);

    analytics.gameStarted(game);

    const identifiedId = mockAmplitude.identifiedPlayer;
    expect(identifiedId).to.not.be.null;
    expect(identifiedId._properties.player).to.equal(mockAIPlayer.id);
    expect(identifiedId._properties.type).to.equal(mockAIPlayer.type);
    expect(identifiedId._properties.persona).to.equal(mockAIPlayer.persona);
    expect(identifiedId._properties.data).to.deep.equal(mockAIPlayer.data());
    expect(identifiedId._properties.game).to.equal(mockAIPlayer.game.id);
    expect(identifiedId._properties.games_played).to.equal(1);
  });

  describe("Error Handling", () => {
    let errorStub, warnStub;

    beforeEach(() => {
      errorStub = sinon.stub(console, "error");
      warnStub = sinon.stub(console, "warn");
    });

    afterEach(() => {
      errorStub.restore();
      warnStub.restore();
    });

    it("should log errors to console if the library can't be loaded", () => {
      // Ensure window.amplitude is undefined for this test
      window.amplitude = undefined;

      // Create a new Analytics instance so its constructor uses the fallback API
      const analyticsWithFallback = new Analytics();
      const eventType = "game_initialized";

      // Call a method that triggers the fallback track
      analyticsWithFallback.gameInit(game);

      expect(warnStub.calledOnce).to.be.true;
      expect(warnStub.calledWithMatch(`Coudn't send analytics for ${eventType}`)).to.be.true;
    });

    it("test_idPlayer_handlesErrorsGracefully", () => {
      sinon.stub(mockAmplitude, "Identify").throws(mockAmplitude.error);
      analytics.gameStarted(game);
      expect(errorStub.calledOnce).to.be.true;
      expect(errorStub.calledWithMatch("Error initializing player:")).to.be.true;
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
