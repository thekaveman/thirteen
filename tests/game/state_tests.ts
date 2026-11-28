import { describe, it, beforeEach, afterEach } from "mocha";
import { expect } from "chai";
import { StateManager, type GameState } from "../../src/app/game/state.js";
import { Card, Deck, Game } from "../../src/app/game/index.js";

const TEST_STATE_KEY = `${StateManager.STATE_KEY}-tests`;

describe("GameState defaults (StateManager.createDefault)", () => {
  let game: Game;

  beforeEach(() => {
    localStorage.clear();
    game = new Game(new (class {
      cards = [];
      shuffle() {}
      deal() { return []; }
    } as unknown as typeof Card)(), TEST_STATE_KEY);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return a fresh GameState with correct version", () => {
    const state = StateManager.createDefault();
    expect(state.version).to.equal(StateManager.VERSION);
  });

  it("should return a fresh GameState with all default values", () => {
    const state = StateManager.createDefault();
    expect(state.numPlayers).to.equal(0);
    expect(state.numAIPlayers).to.equal(0);
    expect(state.players).to.be.an("array").that.is.empty;
    expect(state.playerHands).to.be.an("array").that.is.empty;
    expect(state.playerTurns).to.be.an("array").that.is.empty;
    expect(state.playPile).to.be.an("array").that.is.empty;
    expect(state.currentPlayer).to.equal(0);
    expect(state.currentTurn).to.equal(0);
    expect(state.selectedCards).to.be.an("array").that.is.empty;
    expect(state.consecutivePasses).to.equal(0);
    expect(state.lastPlayerToPlay).to.equal(-1);
    expect(state.roundNumber).to.equal(1);
    expect(state.roundsWon).to.be.an("array").that.is.empty;
    expect(state.gamesWon).to.be.an("array").that.is.empty;
    expect(state.gamesPlayed).to.be.an("array").that.is.empty;
    expect(state.gamesResigned).to.be.an("array").that.is.empty;
    expect(state.aiPersonas).to.be.an("array").that.is.empty;
    expect(state.gameOver).to.be.false;
    expect(state.gameStarted).to.be.false;
    expect(state.playerTypes).to.be.an("array").that.is.empty;
    expect(state.playerPassed).to.be.an("array").that.is.empty;
    expect(state.roundEnded).to.be.false;
    expect(state.resigned).to.be.false;
    expect(state.resignedPlayer).to.equal(-1);
    expect(state.resignConfirming).to.be.false;
  });
});

describe("StateManager.migrate", () => {
  let sm: StateManager;

  beforeEach(() => {
    sm = new StateManager("test");
  });

  it("should fill in missing scalar and boolean fields with defaults", () => {
    const partialState = {};
    const migrated = sm.migrate(partialState as Partial<GameState>);

    expect(migrated.resigned).to.be.false;
    expect(migrated.resignedPlayer).to.equal(-1);
    expect(migrated.resignConfirming).to.be.false;
    expect(migrated.roundEnded).to.be.false;
    expect(migrated.gameOver).to.be.false;
    expect(migrated.gameStarted).to.be.false;
    expect(migrated.lastPlayerToPlay).to.equal(-1);
    expect(migrated.roundNumber).to.equal(1);
    expect(migrated.currentPlayer).to.equal(0);
    expect(migrated.currentTurn).to.equal(0);
    expect(migrated.consecutivePasses).to.equal(0);
    expect(migrated.version).to.equal(StateManager.VERSION);
  });

  it("should never overwrite existing values", () => {
    const existingState = {
      resigned: true,
      resignedPlayer: 1,
      roundEnded: true,
      consecutivePasses: 5,
      gameOver: true,
      version: "old-version",
    } as Partial<ReturnType<typeof StateManager.createDefault>>;

    const migrated = sm.migrate(existingState);

    expect(migrated.resigned).to.be.true;
    expect(migrated.resignedPlayer).to.equal(1);
    expect(migrated.roundEnded).to.be.true;
    expect(migrated.consecutivePasses).to.equal(5);
    expect(migrated.gameOver).to.be.true;
    // Version should be updated to current
    expect(migrated.version).to.equal(StateManager.VERSION);
  });

  it("should initialize aiPersonas array to match numPlayers", () => {
    const state = { numPlayers: 3 } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect((migrated.aiPersonas as (string | null)[]).length).to.equal(3);
    expect(migrated.aiPersonas).to.deep.equal([null, null, null]);
  });

  it("should grow aiPersonas to match numPlayers when shorter", () => {
    const state = {
      numPlayers: 3,
      aiPersonas: ["random" as Partial<GameState>],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect((migrated.aiPersonas as (string | null)[]).length).to.equal(3);
    expect(migrated.aiPersonas).to.deep.equal(["random", null, null]);
  });

  it("should truncate aiPersonas when longer than numPlayers", () => {
    const state = {
      numPlayers: 1,
      aiPersonas: ["random" as Partial<GameState>, "prioritized" as never],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect((migrated.aiPersonas as (string | null)[]).length).to.equal(1);
    expect(migrated.aiPersonas).to.deep.equal(["random"]);
  });

  it("should initialize playerTurns to match numPlayers", () => {
    const state = { numPlayers: 2 } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.playerTurns).to.deep.equal([0, 0]);
  });

  it("should resize playerTurns to match numPlayers", () => {
    const state = {
      numPlayers: 3,
      playerTurns: [1, 2] as unknown[],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.playerTurns).to.deep.equal([1, 2, 0]);
  });

  it("should resize stats arrays to match numPlayers", () => {
    const state = {
      numPlayers: 3,
      gamesWon: [2] as unknown[],
      gamesPlayed: [1] as unknown[],
      gamesResigned: [1] as unknown[],
      roundsWon: [1] as unknown[],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.gamesWon).to.deep.equal([2, 0, 0]);
    expect(migrated.gamesPlayed).to.deep.equal([1, 0, 0]);
    expect(migrated.gamesResigned).to.deep.equal([1, 0, 0]);
    expect(migrated.roundsWon).to.deep.equal([1, 0, 0]);
  });

  it("should initialize playerPassed to match numPlayers", () => {
    const state = { numPlayers: 3 } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.playerPassed).to.deep.equal([false, false, false]);
  });

  it("should preserve existing values in playerTurns when resizing", () => {
    const state = {
      numPlayers: 4,
      playerTurns: [3, 5, 2] as unknown[],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.playerTurns).to.deep.equal([3, 5, 2, 0]);
  });

  it("should truncate stats arrays when longer than numPlayers", () => {
    const state = {
      numPlayers: 1,
      gamesWon: [5, 3, 1] as unknown[],
      gamesPlayed: [4, 2, 1] as unknown[],
      gamesResigned: [1] as unknown[],
      roundsWon: [2, 1] as unknown[],
    } as Partial<ReturnType<typeof StateManager.createDefault>>;
    const migrated = sm.migrate(state);
    expect(migrated.gamesWon).to.deep.equal([5]);
    expect(migrated.gamesPlayed).to.deep.equal([4]);
    expect(migrated.gamesResigned).to.deep.equal([1]);
    expect(migrated.roundsWon).to.deep.equal([2]);
  });
});

describe("StateManager", () => {
  let game: Game;
  let stateManager: StateManager;

  beforeEach(() => {
    localStorage.clear();
    game = new Game(new (class {
      cards = [];
      shuffle() {}
      deal() { return []; }
    } as unknown as typeof Card)(), TEST_STATE_KEY);
    stateManager = new StateManager(TEST_STATE_KEY);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("save()", () => {
    it("should save the game state to localStorage", () => {
      const mockGameState = StateManager.createDefault();
      const mockDeck = new Deck([{ rank: "A", suit: "♠" }]);
      const mockPlayers = [
        { id: "player-1", type: "human", data: () => ({ id: "player-1", type: "human", name: "Test", isHuman: true, game: "test", number: 0 }) },
      ] as unknown as GameState["players"];

      stateManager.save({ ...mockGameState, players: mockPlayers }, mockDeck, "test-id");

      const saved = localStorage.getItem(TEST_STATE_KEY);
      expect(saved).to.exist;
      const parsed = JSON.parse(saved);
      expect(parsed.id).to.equal("test-id");
      expect(parsed.deck.cards).to.deep.equal([{ rank: "A", suit: "♠" }]);
      expect(parsed.gameState.version).to.equal(StateManager.VERSION);
    });
  });

  describe("load()", () => {
    it("should throw when no saved state exists", async () => {
      let threw = false;
      try { await stateManager.load(); } catch { threw = true; }
      expect(threw).to.be.true;
    });

    it("should load and migrate a valid saved state", async () => {
      const mockPlayers = [
        { id: "player-1", type: "human", data: () => ({ id: "player-1", type: "human", name: "Test", isHuman: true, game: "test" }) },
        { id: "player-2", type: "ai", data: () => ({ id: "player-2", type: "ai", name: "AI", isHuman: false, game: "test", persona: "random" }) },
      ] as unknown as GameState["players"];

      const mockGameState = {
        ...StateManager.createDefault(),
        players: mockPlayers,
        numPlayers: 2,
        gameOver: false,
      };

      const mockDeck = new Deck([{ rank: "A", suit: "♠" }]);
      stateManager.save(mockGameState, mockDeck, "test-id");

      const result = await stateManager.load();

      expect(result.gameState).to.exist;
      expect(result.loadedPlayerTypes).to.deep.equal(["human", "ai"]);
      expect(result.gameOver).to.be.false;
      expect(result.id).to.equal("test-id");
      expect(result.deck.cards).to.deep.equal([{ rank: "A", suit: "♠" }]);
    });

    it("should migrate missing fields during load", async () => {
      const mockPlayers = [
        { id: "player-1", type: "human", data: () => ({ id: "player-1", type: "human", name: "Test", isHuman: true, game: "test" }) },
      ] as unknown as GameState["players"];

      const mockGameState = {
        numPlayers: 1,
        players: mockPlayers,
        gameOver: false,
      } as unknown as GameState;

      const mockDeck = new Deck([]);
      stateManager.save(mockGameState, mockDeck, "test-id");

      // Simulate an old save format by removing playerPassed
      const saved = JSON.parse(localStorage.getItem(TEST_STATE_KEY)!);
      delete saved.gameState.playerPassed;
      localStorage.setItem(TEST_STATE_KEY, JSON.stringify(saved));

      const result = await stateManager.load();

      expect(result.gameState.playerPassed).to.deep.equal([false]);
    });

    it("should migrate missing scalar fields during load", async () => {
      const mockPlayers = [
        { id: "player-1", type: "human", data: () => ({ id: "player-1", type: "human", name: "Test", isHuman: true, game: "test" }) },
      ] as unknown as GameState["players"];

      const mockGameState = {
        numPlayers: 1,
        players: mockPlayers,
        gameOver: false,
      } as unknown as GameState;

      const mockDeck = new Deck([]);
      stateManager.save(mockGameState, mockDeck, "test-id");

      // Simulate an old save format by removing several fields
      const saved = JSON.parse(localStorage.getItem(TEST_STATE_KEY)!);
      delete saved.gameState.resigned;
      delete saved.gameState.roundEnded;
      delete saved.gameState.currentPlayer;
      localStorage.setItem(TEST_STATE_KEY, JSON.stringify(saved));

      const result = await stateManager.load();

      expect(result.gameState.resigned).to.be.false;
      expect(result.gameState.roundEnded).to.be.false;
      expect(result.gameState.currentPlayer).to.equal(0);
    });

    it("should preserve existing values during migration", async () => {
      const mockPlayers = [
        { id: "player-1", type: "human", data: () => ({ id: "player-1", type: "human", name: "Test", isHuman: true, game: "test" }) },
      ] as unknown as GameState["players"];

      const mockGameState = {
        ...StateManager.createDefault(),
        players: mockPlayers,
        numPlayers: 1,
        resigned: true,
        resignedPlayer: 1,
        consecutivePasses: 5,
      };

      const mockDeck = new Deck([]);
      stateManager.save(mockGameState, mockDeck, "test-id");

      // Remove some fields to simulate old save, but keep resigned/consecutivePasses
      const saved = JSON.parse(localStorage.getItem(TEST_STATE_KEY)!);
      delete saved.gameState.roundEnded;
      localStorage.setItem(TEST_STATE_KEY, JSON.stringify(saved));

      const result = await stateManager.load();

      // Existing values should be preserved
      expect(result.gameState.resigned).to.be.true;
      expect(result.gameState.resignedPlayer).to.equal(1);
      expect(result.gameState.consecutivePasses).to.equal(5);
      // Missing value should get default
      expect(result.gameState.roundEnded).to.be.false;
    });
  });

  describe("migrate()", () => {
    it("should fill in missing fields from partial state", () => {
      const partialState = { resigned: true, resignedPlayer: 1 } as Partial<GameState>;
      const migrated = stateManager.migrate(partialState);

      expect(migrated.resigned).to.be.true;
      expect(migrated.resignedPlayer).to.equal(1);
      expect(migrated.version).to.equal(StateManager.VERSION);
    });
  });
});
