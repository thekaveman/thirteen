import { Analytics } from "../src/app/analytics.js";
import { GameClient } from "../src/app/game/index.js";
import { HumanPlayer, AIPlayer, PLAYER_TYPES } from "../src/app/player/index.js";
import { MockDeck, MockUI, MockAmplitude, MockAI, MockGame, MockGameClient } from "./mocks.js";

describe("Analytics", () => {
  let game, gameClient, analytics, mockAmplitude;

  beforeEach(() => {
    game = new MockGame(new MockDeck(), "test-game");
    gameClient = new MockGameClient(game);
    const humanPlayer = new HumanPlayer(gameClient, 0, new MockUI(gameClient));
    const aiPlayer = new AIPlayer(gameClient, 1, new MockAI(gameClient, []));
    gameClient.setPlayers([humanPlayer, aiPlayer]);
    analytics = new Analytics();
    mockAmplitude = new MockAmplitude();
    analytics.api = mockAmplitude;
  });

  it("gameInit() should send the correct payload", () => {
    analytics.gameInit(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_initialized");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("gameReset() should send the correct payload", () => {
    analytics.gameReset(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_reset");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("gameStarted() should send the correct payload and identify the player", () => {
    analytics.gameStarted(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_started");
    expect(event.payload.game.id).to.equal(gameClient.getId());
    expect(mockAmplitude.identifiedPlayer).to.not.be.null;
  });

  it("gameWon() should send the correct payload", () => {
    analytics.gameWon(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("game_won");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("roundPlayed() should send the correct payload", () => {
    analytics.roundPlayed(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("round_played");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("playerMoved() should send the correct payload", () => {
    analytics.playerMoved(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("player_moved");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("playerPassed() should send the correct payload", () => {
    analytics.playerPassed(gameClient);
    const event = mockAmplitude.events[0];
    expect(event.eventType).to.equal("player_passed");
    expect(event.payload.game.id).to.equal(gameClient.getId());
  });

  it("test_idPlayer_identifiesHumanPlayerCorrectly", () => {
    const humanPlayer = gameClient.getFirstHumanPlayer();
    analytics.gameStarted(gameClient); // This calls #idPlayer

    const identifiedId = mockAmplitude.identifiedPlayer;
    expect(identifiedId).to.not.be.null;
    expect(identifiedId._properties.player).to.equal(humanPlayer.id);
    expect(identifiedId._properties.type).to.equal(humanPlayer.type);
    expect(identifiedId._properties.persona).to.be.null; // Human players have null persona
    expect(identifiedId._properties.data).to.deep.equal(humanPlayer.data());
    expect(identifiedId._properties.game).to.equal(gameClient.getId());
    expect(identifiedId._properties.games_played).to.equal(1);
  });

  it("test_idPlayer_identifiesAIPlayerCorrectly", () => {
    const mockAIPlayer = {
      id: "ai-player-1",
      type: PLAYER_TYPES.AI,
      persona: "random",
      data: () => ({ some: "ai data" }),
      gameClient: { id: "test-game" },
    };
    sinon.stub(gameClient, "getFirstHumanPlayer").returns(mockAIPlayer);

    analytics.gameStarted(gameClient);

    const identifiedId = mockAmplitude.identifiedPlayer;
    expect(identifiedId).to.not.be.null;
    expect(identifiedId._properties.player).to.equal(mockAIPlayer.id);
    expect(identifiedId._properties.type).to.equal(mockAIPlayer.type);
    expect(identifiedId._properties.persona).to.equal(mockAIPlayer.persona);
    expect(identifiedId._properties.data).to.deep.equal(mockAIPlayer.data());
    expect(identifiedId._properties.game).to.equal(gameClient.getId());
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
      analyticsWithFallback.gameInit(gameClient);

      expect(warnStub.calledOnce).to.be.true;
      expect(warnStub.calledWithMatch(`Coudn't send analytics for ${eventType}`)).to.be.true;
    });

    it("test_idPlayer_handlesErrorsGracefully", () => {
      sinon.stub(mockAmplitude, "Identify").throws(mockAmplitude.error);
      analytics.gameStarted(gameClient);
      expect(errorStub.calledOnce).to.be.true;
      expect(errorStub.calledWithMatch("Error initializing player:")).to.be.true;
    });

    it("gameInit() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameInit(gameClient);
      // No assertion, just checking for absence of errors
    });

    it("gameReset() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameReset(gameClient);
      // No assertion, just checking for absence of errors
    });

    it("gameStarted() should handle analytics errors gracefully", () => {
      sinon.stub(mockAmplitude, "identify").throws(mockAmplitude.error);
      analytics.gameStarted(gameClient);
      expect(errorStub.calledOnce).to.be.true;
      expect(errorStub.calledWithMatch("Error initializing player:")).to.be.true;
    });

    it("gameWon() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.gameWon(gameClient);
      // No assertion, just checking for absence of errors
    });

    it("roundPlayed() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.roundPlayed(gameClient);
      // No assertion, just checking for absence of errors
    });

    it("playerMoved() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.playerMoved(gameClient);
      // No assertion, just checking for absence of errors
    });

    it("playerPassed() should handle analytics errors gracefully", () => {
      mockAmplitude.track = () => {
        throw mockAmplitude.error;
      };
      analytics.playerPassed(gameClient);
      // No assertion, just checking for absence of errors
    });
  });
});
