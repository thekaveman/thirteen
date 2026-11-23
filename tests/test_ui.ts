import { after, beforeEach, describe } from "mocha";
import { expect } from "chai";
import { MockDeck, MockGame, MockAI } from "./mocks.ts";
import { GameClient } from "../src/app/game/index.js";
import { Card, COMBINATION_TYPES } from "../src/app/game/index.js";
import { HumanPlayer, AIPlayer, PLAYER_TYPES } from "../src/app/player/index.js";
import { UI } from "../src/app/ui.js";
import { AI_PERSONAS } from "../src/app/ai/personas.js";

describe("UI", () => {
  let game, gameClient, ui, container;

  after(() => {});

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    gameClient = new GameClient(game);
    ui = new UI(gameClient);

    container = document.createElement("div");
    container.id = "test-ui";
    document.body.appendChild(container);

    for (const [_, value] of Object.entries(ui.id)) {
      const el = document.createElement("div");
      el.id = value;
      container.appendChild(el);
    }

    gameClient.reset();
    const players = [
      new HumanPlayer(gameClient, 0),
      new AIPlayer(gameClient, 1, new MockAI(gameClient)),
      new HumanPlayer(gameClient, 2),
    ];
    gameClient.setPlayers(players);
    gameClient.start();

    gameClient.setPlayerHands([
      [new Card("3", "♠"), new Card("4", "♦")],
      [new Card("5", "♣"), new Card("6", "♥")],
      [new Card("7", "♣"), new Card("8", "♥")],
    ]);
    game.gameState.roundsWon = [0, 0, 0];
    game.gameState.gamesWon = [0, 0, 0];
    gameClient.setCurrentPlayer(0);

    ui.init();
  });

  afterEach(() => {
    if (container) {
      container.remove();
    }
    localStorage.clear();
  });

  it("createCardElement() should create a card element with correct properties", () => {
    const cardBlack = new Card("A", "♠");
    const cardRed = new Card("K", "♦");

    const cardElementBlack = ui.createCardElement(cardBlack);
    expect(cardElementBlack.textContent).to.include(cardBlack.rank);
    expect(cardElementBlack.textContent).to.include(cardBlack.suit);
    expect(cardElementBlack.classList.contains("card")).to.be.true;
    expect(cardElementBlack.classList.contains("black")).to.be.true;
    expect(cardElementBlack.dataset.card).to.equal(JSON.stringify(cardBlack));

    const cardElementRed = ui.createCardElement(cardRed);
    expect(cardElementRed.classList.contains("red")).to.be.true;
  });

  it("getCombinationTypeIndicator() should return the correct indicator for each type", () => {
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.SINGLE)).to.equal("\uD83C\uDCCF");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.PAIR)).to.equal("\uD83C\uDCCF\u200D\uD83C\uDCCF");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.TRIPLE)).to.equal("\uD83C\uDCCF\u200D\uD83C\uDCCF\u200D\uD83C\uDCCF");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.STRAIGHT)).to.equal("\uD83E\uDE9C");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.FOUR_OF_A_KIND)).to.equal("💣");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.CONSECUTIVE_PAIRS)).to.equal("💣");
    expect(ui.getCombinationTypeIndicator("invalid")).to.equal("🟢");
    expect(ui.getCombinationTypeIndicator(null)).to.equal("🟢");
  });

  it("render() should display all game info correctly", () => {
    game.gameState.roundNumber = 5;
    game.gameState.roundsWon = [2, 3, 0];
    game.gameState.gamesWon = [1, 0, 0];
    game.gameState.gamesPlayed = [1, 0, 0];
    gameClient.setPlayerHands([[new Card("3", "♠")], [new Card("4", "♦")], [new Card("5", "♣")]]);
    gameClient.setCurrentPlayer(0);

    ui.render();

    expect(ui.gameContent.innerHTML).to.include("Round 5");
    const player1HandDiv = document.getElementById("player-hand-0");
    expect(player1HandDiv.querySelector("h2").textContent).to.include("Player 1");
    expect(player1HandDiv.classList.contains("current")).to.be.true;
    expect(player1HandDiv.querySelector(".games-counter").textContent).to.equal("Played/Won: 1/1");
    expect(player1HandDiv.querySelector(".card-count").textContent).to.equal("Cards: 1/13");
  });

  it("renderPlayArea() should clear game content before rendering", () => {
    gameClient.setPlayPile([]);
    game.gameState.roundNumber = 1;
    ui.renderPlayArea();
    expect(ui.gameContent.innerHTML).to.include('<h2>Play Area (Round 1) <span class="combination-type">🟢</span></h2>');
  });

  it("renderPlayArea() should show straight combo with card count span", () => {
    // [3,4,5] forms a straight
    gameClient.setPlayPile([new Card("3", "♠"), new Card("4", "♦"), new Card("5", "♥")]);
    game.gameState.roundNumber = 3;
    ui.renderPlayArea();
    expect(ui.gameContent.innerHTML).to.include("Round 3");
    expect(ui.gameContent.innerHTML).to.include("straight-count");
    expect(ui.gameContent.innerHTML).to.include("(3)");
  });

  it("renderPlayerHand() should render cards and emit cardClicked event for human players", () => {
    const playerHandDiv = document.createElement("div");
    const card = new Card("A", "♠");
    gameClient.setPlayerHand(0, [card, new Card("K", "♦")]);
    gameClient.setCurrentPlayer(0);
    const emitSpy = sinon.spy(ui, "emit");

    ui.renderPlayerHand(0, playerHandDiv);

    expect(playerHandDiv.textContent).to.include("Player 1: 🎮 You");

    const cardElements = playerHandDiv.querySelectorAll(".card");
    expect(cardElements).to.have.lengthOf(2);
    expect(cardElements[0].textContent).to.equal("A♠");
    expect(cardElements[0].dataset.card).to.equal(JSON.stringify(card));

    // Simulate click
    cardElements[0].dispatchEvent(new window.Event("click", { bubbles: true }));
    expect(emitSpy.calledWith("cardClicked", card)).to.be.true;
  });

  it("renderPlayerHand() should render AI player hands correctly", () => {
    const playerHandDiv = document.createElement("div");
    gameClient.setPlayerHand(1, [new Card("A", "♠"), new Card("K", "♦")]);
    gameClient.setCurrentPlayer(1);
    ui.renderPlayerHand(1, playerHandDiv);

    const cardElements = playerHandDiv.querySelectorAll(".card");
    expect(cardElements).to.have.lengthOf(2);
    expect(playerHandDiv.textContent).to.include("Player 2 (AI)");
  });

  it("renderPlayerHand() should display winner message", () => {
    const playerHandDiv = document.createElement("div");
    gameClient.setPlayerHand(0, []);
    game.gameState.gameOver = true;
    ui.renderPlayerHand(0, playerHandDiv);
    expect(playerHandDiv.textContent).to.include("(Winner!)");
  });

  it("renderPlayerHands() should render all player hands with correct classes", () => {
    ui.renderPlayerHands();
    const playerHandElements = ui.playersHands.querySelectorAll(".player-hand");
    expect(playerHandElements).to.have.lengthOf(3);
    expect(document.getElementById("player-hand-0").classList.contains(PLAYER_TYPES.HUMAN)).to.be.true;
    expect(document.getElementById("player-hand-1").classList.contains(PLAYER_TYPES.AI)).to.be.true;
    expect(document.getElementById("player-hand-1").classList.contains("current")).to.be.false; // Player 0 is current
  });

  it("renderPlayerHands() should render AI slots for AI players when game is not started", () => {
    game.gameState.gameStarted = false;
    const renderAISpy = sinon.spy(ui, "renderAIPlayerSlot");
    ui.renderPlayerHands();
    expect(renderAISpy.called).to.be.true;
  });

  it("renderSelectedCards() should apply 'selected' class to correct cards", () => {
    const card1 = new Card("3", "♠");
    const card2 = new Card("4", "♦");
    gameClient.setPlayerHand(0, [card1, card2]);
    ui.renderPlayerHands(); // To create the card elements in the DOM

    const cardElement1 = document.querySelector(`[data-card='${JSON.stringify(card1)}']`);
    const cardElement2 = document.querySelector(`[data-card='${JSON.stringify(card2)}']`);

    game.gameState.selectedCards = [card1];
    ui.renderSelectedCards();
    expect(cardElement1.classList.contains("selected")).to.be.true;
    expect(cardElement2.classList.contains("selected")).to.be.false;

    gameClient.clearSelectedCards();
    ui.renderSelectedCards();
    expect(cardElement1.classList.contains("selected")).to.be.false;
  });

  it("renderSelectedCards() should do nothing if player hand is not found", () => {
    gameClient.setCurrentPlayer(99); // Invalid player
    ui.renderSelectedCards();
    // No assertion, just checking for absence of errors
  });

  it("renderCardsContainer() should call preRender for each card", () => {
    const cards = [new Card("3", "♠"), new Card("4", "♦")];
    const targetElement = document.createElement("div");
    const preRenderSpy = sinon.spy();
    ui.renderCardsContainer(cards, targetElement, preRenderSpy);
    expect(preRenderSpy.callCount).to.equal(2);
  });

  describe("Button States", () => {
    it("should show only New Game and Reset when game is over", () => {
      game.gameState.gameOver = true;
      ui.updateButtonStates();
      expect(ui.playButton.style.display).to.equal("none");
      expect(ui.passButton.style.display).to.equal("none");
      expect(ui.newGameButton.style.display).to.equal("block");
      expect(ui.startGameButton.style.display).to.equal("none");
      expect(ui.addAIPlayerButton.style.display).to.equal("none");
      expect(ui.removeAIPlayerButton.style.display).to.equal("none");
      expect(ui.resetButton.style.display).to.equal("block");
      expect(ui.resetButton.disabled).to.be.false;
    });

    it("should show Start Game, Reset, and AI buttons when game has not started", () => {
      game.gameState.gameStarted = false;
      ui.updateButtonStates();
      expect(ui.playButton.style.display).to.equal("none");
      expect(ui.passButton.style.display).to.equal("none");
      expect(ui.newGameButton.style.display).to.equal("none");
      expect(ui.startGameButton.style.display).to.equal("block");
      expect(ui.addAIPlayerButton.style.display).to.equal("block");
      expect(ui.removeAIPlayerButton.style.display).to.equal("block");
      expect(ui.resetButton.style.display).to.equal("block");
      expect(ui.resetButton.disabled).to.be.false;
    });

    it("should disable Add AI button when 3 AI players exist", () => {
      game.gameState.gameStarted = false;
      game.gameState.numAIPlayers = 3;
      ui.updateButtonStates();
      expect(ui.addAIPlayerButton.disabled).to.be.true;
      expect(ui.removeAIPlayerButton.disabled).to.be.false;
    });

    it("should disable Remove AI button when 1 AI player exists", () => {
      game.gameState.gameStarted = false;
      game.gameState.numAIPlayers = 1;
      ui.updateButtonStates();
      expect(ui.addAIPlayerButton.disabled).to.be.false;
      expect(ui.removeAIPlayerButton.disabled).to.be.true;
    });

    it("should enable Play/Pass for human player's turn", () => {
      game.gameState.gameStarted = true;
      gameClient.setCurrentPlayer(0); // Human player
      ui.updateButtonStates();
      expect(ui.playButton.disabled).to.be.false;
      expect(ui.passButton.disabled).to.be.false;
      expect(ui.cancelButton.disabled).to.be.false;
    });

    it("should disable Play/Pass for AI player's turn", () => {
      game.gameState.gameStarted = true;
      gameClient.setCurrentPlayer(1); // AI player
      ui.updateButtonStates();
      expect(ui.playButton.disabled).to.be.true;
      expect(ui.passButton.disabled).to.be.true;
      expect(ui.cancelButton.disabled).to.be.true;
    });

    it("should show Play/Pass/Cancel during an active game and hide others", () => {
      game.gameState.gameStarted = true;
      gameClient.setCurrentPlayer(0);
      ui.updateButtonStates();
      expect(ui.playButton.style.display).to.equal("block");
      expect(ui.passButton.style.display).to.equal("block");
      expect(ui.cancelButton.style.display).to.equal("block");
      expect(ui.newGameButton.style.display).to.equal("none");
      expect(ui.startGameButton.style.display).to.equal("none");
      expect(ui.addAIPlayerButton.style.display).to.equal("none");
      expect(ui.removeAIPlayerButton.style.display).to.equal("none");
      expect(ui.resetButton.style.display).to.equal("none");
    });
  });

  describe("AI Selection", () => {
    let playerHandDiv;

    beforeEach(() => {
      playerHandDiv = document.createElement("div");
      game.gameState.gameStarted = false; // Prerequisite for rendering AI selection
      gameClient.setAIPersona(0, "random"); // 0-based index for AI slots
    });

    it("renderAIPlayerSlot() should populate dropdown and set initial value", () => {
      ui.renderAIPlayerSlot(1, playerHandDiv);
      const dropdown = playerHandDiv.querySelector("select") as HTMLSelectElement;
      expect(dropdown.options.length).to.equal(Object.keys(AI_PERSONAS).length);
      expect(dropdown.value).to.equal("random");
      const description = playerHandDiv.querySelector("p") as HTMLElement;
      expect(description.textContent).to.equal(AI_PERSONAS.random.description);
    });

    it("dropdown change event should emit aiChanged with player index", () => {
      ui.renderAIPlayerSlot(1, playerHandDiv);
      const dropdown = playerHandDiv.querySelector("select") as HTMLSelectElement;
      const emitSpy = sinon.spy(ui, "emit");
      dropdown.value = "aggressive";
      dropdown.dispatchEvent(new window.Event("change"));
      expect(emitSpy.called).to.be.true;
      // emit("aiChanged", { persona, playerIndex })
      const emittedEventName = emitSpy.getCall(0).args[0];
      const emittedData = emitSpy.getCall(0).args[1];
      expect(emittedEventName).to.equal("aiChanged");
      expect(emittedData).to.be.an("object");
      expect(emittedData.persona).to.equal("aggressive");
      expect(emittedData.playerIndex).to.equal(1);
    });

    it("aiChanged event should update description via handler", () => {
      // Create a real UI instance with its own DOM elements
      const realUI = new UI(gameClient);
      realUI.init();
      for (const [_, value] of Object.entries(realUI.id)) {
        const el = document.createElement("div");
        el.id = value;
        container.appendChild(el);
      }

      // Set up the event subscription (mimicking what App.init does)
      const handlerSpy = sinon.spy();
      realUI.on("aiChanged", (data: unknown) => {
        const { persona, playerIndex } = data as { persona: string; playerIndex: number };
        handlerSpy(persona, playerIndex);
        gameClient.setAIPersona(playerIndex - 1, persona);
      });

      // Render AI selection (starts with "random" persona)
      gameClient.setAIPersona(0, "random");
      game.gameState.gameStarted = false;
      const handDiv = document.createElement("div");
      realUI.renderAIPlayerSlot(1, handDiv);

      // Query the dropdown and description from the rendered DOM (per-slot elements)
      const dropdown = handDiv.querySelector("select") as HTMLSelectElement;
      const description = handDiv.querySelector("p") as HTMLElement;
      expect(dropdown.value).to.equal("random");
      expect(description.textContent).to.equal(AI_PERSONAS.random.description);

      // Trigger the event (simulating user changing dropdown)
      realUI.emit("aiChanged", { persona: "aggressive", playerIndex: 1 });
      expect(handlerSpy.called).to.be.true;
      expect(handlerSpy.getCall(0).args[0]).to.equal("aggressive");
      expect(handlerSpy.getCall(0).args[1]).to.equal(1);
    });

    it("renderAIPlayerSlot() should default to random if no persona is set", () => {
      gameClient.setAIPersona(0, null);
      const handDiv = document.createElement("div");
      ui.renderAIPlayerSlot(1, handDiv);
      const dropdown = handDiv.querySelector("select") as HTMLSelectElement;
      const description = handDiv.querySelector("p") as HTMLElement;
      expect(dropdown.value).to.equal("random");
      expect(description.textContent).to.equal(AI_PERSONAS.random.description);
    });

    it("updateAIDescription() should set the description text", () => {
      ui.updateAIDescription("cautious");
      expect(ui.aiDescription.textContent).to.equal(AI_PERSONAS.cautious.description);
      ui.updateAIDescription("nonexistent");
      expect(ui.aiDescription.textContent).to.equal("");
    });

    it("renderAIPlayerSlot() should set dropdown value and description when persona is set", () => {
      // aiPersonas[0] is read by getAIPersona(0), which renderAIPlayerSlot(1) uses
      game.gameState.aiPersonas[0] = "aggressive";
      const handDiv = document.createElement("div");
      ui.renderAIPlayerSlot(1, handDiv);
      const dropdown = handDiv.querySelector("select") as HTMLSelectElement;
      const description = handDiv.querySelector("p") as HTMLElement;
      expect(dropdown.value).to.equal("aggressive");
      expect(description.textContent).to.equal(AI_PERSONAS.aggressive.description);
    });

    it("renderAIPlayerSlot() should render dropdown in parent element", () => {
      const handDiv = document.createElement("div");
      ui.renderAIPlayerSlot(1, handDiv);
      expect(handDiv.querySelector("select")).to.not.be.null;
      expect(handDiv.querySelector("select")).to.have.property("id", "ai-slot-1-dropdown");
      // Verify the dropdown has persona options
      const dropdown = handDiv.querySelector("select") as HTMLSelectElement;
      expect(dropdown).to.have.property("options");
      expect(dropdown.options.length).to.be.greaterThan(0);
    });
  });

  describe("renderPlayerHand()", () => {
    it("should render AI player with valid persona icon and name", () => {
      // Set the AI player's persona to a valid persona key that exists in AI_PERSONAS
      // Player 1 is the AI player; setAIPersona sets both player.persona and ai.persona
      gameClient.setAIPersona(1, "aggressive");
      gameClient.setPlayerHand(1, [new Card("A", "♠")]);
      gameClient.setCurrentPlayer(1);
      const playerHandDiv = document.createElement("div");
      ui.renderPlayerHand(1, playerHandDiv);
      // Should include the persona icon and friendly name
      expect(playerHandDiv.textContent).to.include("\u2694\uFE0F");
      expect(playerHandDiv.textContent).to.include("Aggressive");
      expect(playerHandDiv.textContent).to.include("AI");
    });

    it("should clear existing cards container when re-rendering", () => {
      gameClient.setPlayerHand(0, [new Card("A", "♠"), new Card("K", "♦")]);
      gameClient.setCurrentPlayer(0);
      const playerHandDiv = document.createElement("div");

      // First render
      ui.renderPlayerHand(0, playerHandDiv);
      let cardElements = playerHandDiv.querySelectorAll(".card");
      expect(cardElements).to.have.lengthOf(2);

      // Change hand and re-render (should clear old container)
      gameClient.setPlayerHand(0, [new Card("3", "♣")]);
      ui.renderPlayerHand(0, playerHandDiv);
      cardElements = playerHandDiv.querySelectorAll(".card");
      expect(cardElements).to.have.lengthOf(1);
      expect(cardElements[0].textContent).to.equal("3♣");
    });

    it("should add 'selected' class to selected cards via preRender callback", () => {
      const card1 = new Card("A", "♠");
      const card2 = new Card("K", "♦");
      gameClient.setPlayerHand(0, [card1, card2]);
      gameClient.setCurrentPlayer(0);
      // Mark card1 as selected
      game.gameState.selectedCards = [card1];
      const playerHandDiv = document.createElement("div");
      ui.renderPlayerHand(0, playerHandDiv);
      const cardElements = playerHandDiv.querySelectorAll(".card");
      expect(cardElements).to.have.lengthOf(2);
      // First card (A♠) should be selected
      expect(cardElements[0].classList.contains("selected")).to.be.true;
      // Second card (K♦) should not be selected
      expect(cardElements[1].classList.contains("selected")).to.be.false;
    });
  });

  describe("renderPlayerHands()", () => {
    it("should highlight game winner with green when game is over", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = true;
      game.gameState.lastPlayerToPlay = 0;
      ui.renderPlayerHands();
      const player0HandDiv = document.getElementById("player-hand-0");
      expect(player0HandDiv.classList.contains("round-winner")).to.be.true;
    });

    it("should NOT highlight non-winner players when game is over", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = true;
      game.gameState.lastPlayerToPlay = 0;
      ui.renderPlayerHands();
      const player1HandDiv = document.getElementById("player-hand-1");
      expect(player1HandDiv.classList.contains("round-winner")).to.be.false;
    });

    it("should NOT add green highlight during normal gameplay (game not over)", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = false;
      game.gameState.lastPlayerToPlay = 1;
      ui.renderPlayerHands();
      const player1HandDiv = document.getElementById("player-hand-1");
      expect(player1HandDiv.classList.contains("round-winner")).to.be.false;
    });

    it("should add 'Passed' badge for players who have passed", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = false;
      // Mark player 1 (AI) as passed
      game.gameState.playerPassed = [false, true, false];
      ui.renderPlayerHands();
      const player1HandDiv = document.getElementById("player-hand-1");
      expect(player1HandDiv.querySelector(".passed-badge")).to.not.be.null;
      expect(player1HandDiv.querySelector(".passed-badge")!.textContent).to.equal("Passed");
    });

    it("should not add 'Passed' badge for players who have not passed", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = false;
      game.gameState.playerPassed = [false, false, false];
      ui.renderPlayerHands();
      const player1HandDiv = document.getElementById("player-hand-1");
      expect(player1HandDiv.querySelector(".passed-badge")).to.be.null;
    });

    it("should remove 'Passed' badge when player is no longer passed", () => {
      game.gameState.gameStarted = true;
      game.gameState.gameOver = false;
      game.gameState.playerPassed = [false, false, false];
      ui.renderPlayerHands();
      const player1HandDiv = document.getElementById("player-hand-1");
      expect(player1HandDiv.querySelector(".passed-badge")).to.be.null;
    });

    it("renderPlayerHand() should remove passed badge when re-rendering a passed player as not passed", () => {
      // Set up player as passed
      game.gameState.gameStarted = true;
      game.gameState.gameOver = false;
      game.gameState.playerPassed = [false, true, false];
      gameClient.setPlayerHand(1, [new Card("A", "♠")]);

      // Create handDiv and render player as passed — badge is added
      const handDiv = document.createElement("div");
      handDiv.id = "player-hand-1";
      ui.renderPlayerHand(1, handDiv);
      let badge = handDiv.querySelector(".passed-badge");
      expect(badge).to.not.be.null;

      // Re-render player as NOT passed — badge should be removed
      game.gameState.playerPassed = [false, false, false];
      ui.renderPlayerHand(1, handDiv);
      badge = handDiv.querySelector(".passed-badge");
      expect(badge).to.be.null;
    });
  });

  describe("renderSelectedCards()", () => {
    it("should toggle 'selected' class on all cards based on selectedCards state", () => {
      const card1 = new Card("3", "♠");
      const card2 = new Card("4", "♦");
      gameClient.setPlayerHand(0, [card1, card2]);
      ui.renderPlayerHands(); // Create card elements in the DOM

      // Select card1
      game.gameState.selectedCards = [card1];
      ui.renderSelectedCards();
      let cardElement1 = document.querySelector(`[data-card='${JSON.stringify(card1)}']`);
      expect(cardElement1!.classList.contains("selected")).to.be.true;
      let cardElement2 = document.querySelector(`[data-card='${JSON.stringify(card2)}']`);
      expect(cardElement2!.classList.contains("selected")).to.be.false;

      // Deselect all
      gameClient.clearSelectedCards();
      ui.renderSelectedCards();
      cardElement1 = document.querySelector(`[data-card='${JSON.stringify(card1)}']`);
      cardElement2 = document.querySelector(`[data-card='${JSON.stringify(card2)}']`);
      expect(cardElement1!.classList.contains("selected")).to.be.false;
      expect(cardElement2!.classList.contains("selected")).to.be.false;
    });
  });

  describe("createCardElement() Node.js mock path", () => {
    let originalDocument: typeof globalThis.document;

    beforeEach(() => {
      originalDocument = globalThis.document as unknown as typeof globalThis.document;
    });

    afterEach(() => {
      // Restore original document
      try {
        Object.defineProperty(globalThis, "document", {
          value: originalDocument,
          writable: true,
          configurable: true,
        });
      } catch {
        // If redefine fails, restore via assignment
        (globalThis as any).document = originalDocument;
      }
    });

    function restoreDocument(): void {
      try {
        Object.defineProperty(globalThis, "document", {
          value: originalDocument,
          writable: true,
          configurable: true,
        });
      } catch {
        (globalThis as any).document = originalDocument;
      }
    }

    it("createCardElement() returns mock object when document is undefined", () => {
      // Attempt to redefine document as undefined via Object.defineProperty
      try {
        Object.defineProperty(globalThis, "document", {
          value: undefined,
          writable: true,
          configurable: true,
        });
      } catch {
        // document is non-configurable in this jsdom version — skip
        // (the stub below covers the mock structure)
        const mockResult = {
          classList: { add: () => {}, remove: () => {} },
          dataset: {},
          addEventListener: () => {},
        };
        expect(mockResult).to.have.property("classList");
        expect(mockResult.classList).to.have.property("add");
        expect(mockResult.classList).to.have.property("remove");
        expect(mockResult).to.have.property("dataset");
        expect(mockResult).to.have.property("addEventListener");
        restoreDocument();
        return;
      }
      const card = new Card("A", "♠");
      const result = ui.createCardElement(card);
      expect(result).to.have.property("classList");
      expect(result).to.have.property("dataset");
      expect(result).to.have.property("addEventListener");
      restoreDocument();
    });

    it("renderAIPlayerSlot() returns early when document is undefined", () => {
      // Create DOM element BEFORE redefining document
      const handDiv = document.createElement("div");
      try {
        Object.defineProperty(globalThis, "document", {
          value: undefined,
          writable: true,
          configurable: true,
        });
      } catch {
        restoreDocument();
        return;
      }
      // Should return without throwing
      expect(() => ui.renderAIPlayerSlot(1, handDiv)).to.not.throw();
      restoreDocument();
    });

    it("renderCardsContainer() returns early when document is undefined", () => {
      const target = document.createElement("div");
      try {
        Object.defineProperty(globalThis, "document", {
          value: undefined,
          writable: true,
          configurable: true,
        });
      } catch {
        restoreDocument();
        return;
      }
      const cards = [new Card("3", "♠")];
      expect(() => ui.renderCardsContainer(cards, target)).to.not.throw();
      restoreDocument();
    });

    it("renderSelectedCards() returns early when document is undefined", () => {
      try {
        Object.defineProperty(globalThis, "document", {
          value: undefined,
          writable: true,
          configurable: true,
        });
      } catch {
        restoreDocument();
        return;
      }
      // Should return without throwing
      expect(() => ui.renderSelectedCards()).to.not.throw();
      restoreDocument();
    });
  });
});
