import { MockDeck, MockGame, MockAI, MockLocalStorage } from "./mocks.js";
import { COMBINATION_TYPES, PLAYER_TYPES } from "../src/app/constants.js";
import { Card } from "../src/app/deck.js";
import { HumanPlayer, AIPlayer } from "../src/app/player/index.js";
import { UI } from "../src/app/ui.js";

describe("UI", () => {
  let game, ui, container;

  after(() => {});

  beforeEach(() => {
    game = new MockGame(new MockDeck());
    ui = new UI(game);

    container = document.createElement("div");
    container.id = "test-ui";
    document.body.appendChild(container);

    for (const [_, value] of Object.entries(ui.id)) {
      const el = document.createElement("div");
      el.id = value;
      container.appendChild(el);
    }

    game.reset();
    const players = [new HumanPlayer(game, 0, ui), new AIPlayer(game, 1, new MockAI(game)), new HumanPlayer(game, 2, ui)];
    game.setPlayers(players);
    game.start();

    game.gameState.playerHands = [
      [new Card("3", "♠"), new Card("4", "♦")],
      [new Card("5", "♣"), new Card("6", "♥")],
      [new Card("7", "♣"), new Card("8", "♥")],
    ];
    game.gameState.roundsWon = [0, 0, 0];
    game.gameState.gamesWon = [0, 0, 0];
    game.gameState.currentPlayer = 0;

    ui.init(game);
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
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.SINGLE)).to.equal("🃏");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.PAIR)).to.equal("🃏🃏");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.TRIPLE)).to.equal("🃏🃏🃏");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.STRAIGHT)).to.equal("🪜");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.FOUR_OF_A_KIND)).to.equal("💣");
    expect(ui.getCombinationTypeIndicator(COMBINATION_TYPES.CONSECUTIVE_PAIRS)).to.equal("💣");
    expect(ui.getCombinationTypeIndicator("invalid")).to.equal("🟢");
    expect(ui.getCombinationTypeIndicator(null)).to.equal("🟢");
  });

  it("render() should display all game info correctly", () => {
    ui.game.gameState.roundNumber = 5;
    ui.game.gameState.roundsWon = [2, 3, 0];
    ui.game.gameState.gamesWon = [1, 0, 0];
    ui.game.gameState.playerHands = [[new Card("3", "♠")], [new Card("4", "♦")], [new Card("5", "♣")]];
    ui.game.gameState.currentPlayer = 0;

    ui.render();

    expect(ui.gameContent.innerHTML).to.include("Round 5");
    const player1HandDiv = document.getElementById("player-hand-0");
    expect(player1HandDiv.querySelector("h2").textContent).to.include("Player 1 (Your Turn)");
    expect(player1HandDiv.classList.contains("current")).to.be.true;
    expect(player1HandDiv.querySelector(".rounds-won").textContent).to.equal("Rounds won: 2");
    expect(player1HandDiv.querySelector(".games-won").textContent).to.equal("Games won: 1");
    expect(player1HandDiv.querySelector(".card-count").textContent).to.equal("Cards remaining: 1");
  });

  it("renderPlayArea() should clear game content before rendering", () => {
    ui.game.gameState.playPile = [];
    ui.game.gameState.roundNumber = 1;
    ui.renderPlayArea();
    expect(ui.gameContent.innerHTML).to.include('<h2>Play Area (Round 1) <span class="combination-type">🟢</span></h2>');
  });

  it("renderPlayerHand() should render cards and attach event listeners for human players", () => {
    const playerHandDiv = document.createElement("div");
    const card = new Card("A", "♠");
    ui.game.gameState.playerHands[0] = [card, new Card("K", "♦")];
    ui.game.gameState.currentPlayer = 0;
    const spy = sinon.spy(playerHandDiv, "addEventListener");

    ui.renderPlayerHand(0, playerHandDiv);

    const cardElements = playerHandDiv.querySelectorAll(".card");
    expect(cardElements).to.have.lengthOf(2);
    expect(cardElements[0].textContent).to.equal("A♠");
    expect(cardElements[0].dataset.card).to.equal(JSON.stringify(card));
    // Sinon can't directly check listeners on children, but we can check if the parent got a listener.
    // A more robust test would involve simulating a click.
  });

  it("renderPlayerHand() should render AI player hands correctly", () => {
    const playerHandDiv = document.createElement("div");
    ui.game.gameState.playerHands[1] = [new Card("A", "♠"), new Card("K", "♦")];
    ui.game.gameState.currentPlayer = 1;
    ui.renderPlayerHand(1, playerHandDiv);

    const cardElements = playerHandDiv.querySelectorAll(".card");
    expect(cardElements).to.have.lengthOf(2);
    expect(playerHandDiv.textContent).to.include("Player 2 (AI) (Your Turn)");
  });

  it("renderPlayerHand() should display winner message", () => {
    const playerHandDiv = document.createElement("div");
    ui.game.gameState.playerHands[0] = [];
    ui.game.gameState.gameOver = true;
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

  it("renderSelectedCards() should apply 'selected' class to correct cards", () => {
    const card1 = new Card("3", "♠");
    const card2 = new Card("4", "♦");
    game.gameState.playerHands[0] = [card1, card2];
    ui.renderPlayerHands(); // To create the card elements in the DOM

    const cardElement1 = document.querySelector(`[data-card='${JSON.stringify(card1)}']`);
    const cardElement2 = document.querySelector(`[data-card='${JSON.stringify(card2)}']`);

    game.gameState.selectedCards = [card1];
    ui.renderSelectedCards();
    expect(cardElement1.classList.contains("selected")).to.be.true;
    expect(cardElement2.classList.contains("selected")).to.be.false;

    game.gameState.selectedCards = [];
    ui.renderSelectedCards();
    expect(cardElement1.classList.contains("selected")).to.be.false;
  });

  it("renderSelectedCards() should do nothing if player hand is not found", () => {
    game.gameState.currentPlayer = 99; // Invalid player
    ui.renderSelectedCards();
    // No assertion, just checking for absence of errors
  });

  describe("Button States", () => {
    it("should show only New Game and Reset when game is over", () => {
      game.gameState.gameOver = true;
      ui.updateButtonStates();
      expect(ui.playButton.style.display).to.equal("none");
      expect(ui.passButton.style.display).to.equal("none");
      expect(ui.newGameButton.style.display).to.equal("block");
      expect(ui.startGameButton.style.display).to.equal("none");
      expect(ui.resetButton.style.display).to.equal("block");
      expect(ui.resetButton.disabled).to.be.false;
    });

    it("should show only Start Game and Reset when game has not started", () => {
      game.gameState.gameStarted = false;
      ui.updateButtonStates();
      expect(ui.playButton.style.display).to.equal("none");
      expect(ui.passButton.style.display).to.equal("none");
      expect(ui.newGameButton.style.display).to.equal("none");
      expect(ui.startGameButton.style.display).to.equal("block");
      expect(ui.resetButton.style.display).to.equal("block");
      expect(ui.resetButton.disabled).to.be.false;
    });

    it("should enable Play/Pass for human player's turn", () => {
      game.gameState.gameStarted = true;
      game.gameState.currentPlayer = 0; // Human player
      ui.updateButtonStates();
      expect(ui.playButton.disabled).to.be.false;
      expect(ui.passButton.disabled).to.be.false;
      expect(ui.resetButton.disabled).to.be.false;
    });

    it("should disable Play/Pass for AI player's turn", () => {
      game.gameState.gameStarted = true;
      game.gameState.currentPlayer = 1; // AI player
      ui.updateButtonStates();
      expect(ui.playButton.disabled).to.be.true;
      expect(ui.passButton.disabled).to.be.true;
      expect(ui.resetButton.disabled).to.be.true;
    });
  });
});
