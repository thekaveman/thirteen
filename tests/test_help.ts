import { after, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { Help } from "../src/help.js";
import { Card, COMBINATION_TYPES, RANKS, SUITS, Deck } from "../src/app/game/index.js";
import { UI } from "../src/app/ui.js";
import { AI_PERSONAS } from "../src/app/ai/personas.js";

describe("Help", () => {
  let help: Help;

  function setupDOM(): void {
    // Clear DOM
    const existing = document.getElementById("help-container");
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = "help-container";

    // Ranking containers
    const ranksContainer = document.createElement("div");
    ranksContainer.id = "ranks-container";
    container.appendChild(ranksContainer);

    const suitsContainer = document.createElement("div");
    suitsContainer.id = "suits-container";
    container.appendChild(suitsContainer);

    const handContainer = document.createElement("div");
    handContainer.id = "hand-container";
    container.appendChild(handContainer);

    // Valid combinations section
    const validCombosSection = document.createElement("div");
    validCombosSection.classList.add("combination-examples");
    validCombosSection.dataset.section = "valid_combos";

    const singleDiv = document.createElement("div");
    singleDiv.classList.add("combination");
    singleDiv.dataset.combination = "single";
    const singleType = document.createElement("span");
    singleType.classList.add("combination-type");
    singleDiv.appendChild(singleType);
    validCombosSection.appendChild(singleDiv);

    const pairDiv = document.createElement("div");
    pairDiv.classList.add("combination");
    pairDiv.dataset.combination = "pair";
    const pairType = document.createElement("span");
    pairType.classList.add("combination-type");
    pairDiv.appendChild(pairType);
    validCombosSection.appendChild(pairDiv);

    const tripleDiv = document.createElement("div");
    tripleDiv.classList.add("combination");
    tripleDiv.dataset.combination = "triple";
    const tripleType = document.createElement("span");
    tripleType.classList.add("combination-type");
    tripleDiv.appendChild(tripleType);
    validCombosSection.appendChild(tripleDiv);

    const fourOfAKindDiv = document.createElement("div");
    fourOfAKindDiv.classList.add("combination");
    fourOfAKindDiv.dataset.combination = "four_of_a_kind";
    const fourType = document.createElement("span");
    fourType.classList.add("combination-type");
    fourOfAKindDiv.appendChild(fourType);
    validCombosSection.appendChild(fourOfAKindDiv);

    const straightDiv = document.createElement("div");
    straightDiv.classList.add("combination");
    straightDiv.dataset.combination = "straight";
    const straightType = document.createElement("span");
    straightType.classList.add("combination-type");
    straightDiv.appendChild(straightType);
    validCombosSection.appendChild(straightDiv);

    container.appendChild(validCombosSection);

    // Bombs section
    const bombsSection = document.createElement("div");
    bombsSection.classList.add("combination-examples");
    bombsSection.dataset.section = "bombs";

    const bombFourDiv = document.createElement("div");
    bombFourDiv.classList.add("combination");
    bombFourDiv.dataset.combination = "four_of_a_kind";
    const bombFourType = document.createElement("span");
    bombFourType.classList.add("combination-type");
    bombFourDiv.appendChild(bombFourType);
    bombsSection.appendChild(bombFourDiv);

    const consecutivePairsDiv = document.createElement("div");
    consecutivePairsDiv.classList.add("combination");
    consecutivePairsDiv.dataset.combination = "consecutive_pairs";
    const consecutiveType = document.createElement("span");
    consecutiveType.classList.add("combination-type");
    consecutivePairsDiv.appendChild(consecutiveType);
    bombsSection.appendChild(consecutivePairsDiv);

    container.appendChild(bombsSection);

    // AI container
    const aiContainer = document.createElement("div");
    aiContainer.id = "ai-container";
    container.appendChild(aiContainer);

    // Try It section
    const tryIt = document.createElement("div");
    tryIt.id = "try-it";

    const playArea = document.createElement("div");
    playArea.id = "play-area";
    const gameContent = document.createElement("div");
    gameContent.id = "game-content";
    playArea.appendChild(gameContent);
    tryIt.appendChild(playArea);

    const messages = document.createElement("div");
    messages.id = "messages";
    tryIt.appendChild(messages);

    const playerHandDiv = document.createElement("div");
    playerHandDiv.id = "player-hand";
    tryIt.appendChild(playerHandDiv);

    container.appendChild(tryIt);

    document.body.appendChild(container);
  }

  beforeEach(() => {
    setupDOM();
    localStorage.clear();

    // Create Help instance (constructor calls setupRanking, setupCombos, setupTryIt, setupAI)
    help = new Help();
  });

  afterEach(() => {
    const container = document.getElementById("help-container");
    if (container) container.remove();
    localStorage.clear();
  });

  describe("constructor", () => {
    it("should initialize deck, game client, ui, and tryItState", () => {
      expect(help.deck).to.be.an.instanceOf(Deck);
      expect(help.gameClient).to.not.be.null;
      expect(help.ui).to.be.an.instanceOf(UI);
      expect(help.tryItState).to.be.an("object");
      expect(help.tryItState!.hand).to.be.an("array");
      expect(help.tryItState!.hand.length).to.be.greaterThan(0);
    });

    it("should set up click listener on help-container", () => {
      const container = document.getElementById("help-container");
      expect(container).to.not.be.null;

      const cardEl = document.createElement("span");
      cardEl.classList.add("card");
      cardEl.textContent = "3♠";
      container!.appendChild(cardEl);

      cardEl.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(cardEl.classList.contains("selected")).to.be.true;

      cardEl.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
      expect(cardEl.classList.contains("selected")).to.be.false;
    });
  });

  describe("setupRanking", () => {
    it("should render all rank cards in ranks-container", () => {
      const ranksContainer = document.getElementById("ranks-container");
      expect(ranksContainer).to.not.be.null;

      const cards = ranksContainer!.querySelectorAll(".card");
      expect(cards).to.have.lengthOf(RANKS.length);

      const cardTexts = Array.from(cards).map((c) => (c as HTMLElement).textContent);
      RANKS.forEach((rank) => {
        expect(cardTexts.some((t) => t!.includes(rank))).to.be.true;
      });
    });

    it("should render all suit cards in suits-container", () => {
      const suitsContainer = document.getElementById("suits-container");
      expect(suitsContainer).to.not.be.null;

      const cards = suitsContainer!.querySelectorAll(".card");
      expect(cards).to.have.lengthOf(SUITS.length);

      const cardTexts = Array.from(cards).map((c) => (c as HTMLElement).textContent);
      SUITS.forEach((suit) => {
        expect(cardTexts.some((t) => t!.includes(suit))).to.be.true;
      });
    });

    it("should render a 13-card example hand in hand-container", () => {
      const handContainer = document.getElementById("hand-container");
      expect(handContainer).to.not.be.null;

      const cards = handContainer!.querySelectorAll(".card");
      expect(cards).to.have.lengthOf(13);
    });

    it("should render cards in correct color classes", () => {
      const ranksContainer = document.getElementById("ranks-container");
      const cards = ranksContainer!.querySelectorAll(".card");
      cards.forEach((card) => {
        const el = card as HTMLElement;
        expect(el.classList.contains("red") || el.classList.contains("black")).to.be.true;
      });
    });
  });

  describe("setupCombos", () => {
    it("should set correct emoji indicators for valid combos section", () => {
      const validCombosSection = document.querySelector(
        ".combination-examples[data-section='valid_combos']"
      ) as HTMLElement | null;
      expect(validCombosSection).to.not.be.null;

      const combos = validCombosSection!.querySelectorAll(".combination[data-combination]");
      combos.forEach((div) => {
        const type = (div as HTMLElement).dataset.combination;
        const expected = help.ui.getCombinationTypeIndicator(type!, []);
        const indicator = (div.querySelector(".combination-type") as HTMLElement).textContent;
        expect(indicator).to.equal(expected);
      });
    });

    it("should set bomb emoji for bombs section", () => {
      const bombsSection = document.querySelector(".combination-examples[data-section='bombs']") as HTMLElement | null;
      expect(bombsSection).to.not.be.null;

      const combos = bombsSection!.querySelectorAll(".combination[data-combination]");
      combos.forEach((div) => {
        const type = (div as HTMLElement).dataset.combination;
        // Bombs section → bomb context (play on a 2)
        const expected = help.ui.getCombinationTypeIndicator(type!, [new Card("2", "♠")]);
        const indicator = (div.querySelector(".combination-type") as HTMLElement).textContent;
        expect(indicator).to.equal(expected);
      });
    });

    it("should render card containers for each combination", () => {
      const allCombos = document.querySelectorAll(".combination[data-combination]");
      allCombos.forEach((div) => {
        const comboExamples = (div as HTMLElement).querySelector(".combination-examples");
        // May be null if no valid combinations were found in the test deck
        if (comboExamples) {
          const cards = comboExamples.querySelectorAll(".card");
          expect(cards.length).to.be.at.least(1);
        }
      });
    });

    it("should render correct number of cards for each combo type", () => {
      const singleDiv = document.querySelector(
        '.combination[data-combination="single"] .combination-examples'
      ) as HTMLElement | null;
      if (singleDiv) {
        expect(singleDiv.querySelectorAll(".card")).to.have.lengthOf(1);
      }

      const pairDiv = document.querySelector('.combination[data-combination="pair"] .combination-examples') as HTMLElement | null;
      if (pairDiv) {
        expect(pairDiv.querySelectorAll(".card")).to.have.lengthOf(2);
      }

      const tripleDiv = document.querySelector(
        '.combination[data-combination="triple"] .combination-examples'
      ) as HTMLElement | null;
      if (tripleDiv) {
        expect(tripleDiv.querySelectorAll(".card")).to.have.lengthOf(3);
      }

      const fourOfAKindDiv = document.querySelector(
        '.combination[data-combination="four_of_a_kind"] .combination-examples'
      ) as HTMLElement | null;
      if (fourOfAKindDiv) {
        expect(fourOfAKindDiv.querySelectorAll(".card")).to.have.lengthOf(4);
      }
    });

    it("should render straight with 3-6 cards", () => {
      const straightDiv = document.querySelector(
        '.combination[data-combination="straight"] .combination-examples'
      ) as HTMLElement | null;
      if (straightDiv) {
        const cards = straightDiv.querySelectorAll(".card");
        expect(cards.length).to.be.at.least(3);
        expect(cards.length).to.be.at.most(6);
      }
    });
  });

  describe("setupAI", () => {
    it("should render an AI card for each persona", () => {
      const aiContainer = document.getElementById("ai-container");
      expect(aiContainer).to.not.be.null;

      const aiDivs = aiContainer!.querySelectorAll(".ai");
      expect(aiDivs).to.have.lengthOf(Object.keys(AI_PERSONAS).length);
    });

    it("should include persona icon, name, and description", () => {
      const aiContainer = document.getElementById("ai-container");
      const aiDivs = aiContainer!.querySelectorAll(".ai");

      for (const aiDiv of aiDivs) {
        const strong = (aiDiv as HTMLElement).querySelector("strong");
        const description = (aiDiv as HTMLElement).querySelector("p");

        expect(strong).to.not.be.null;
        expect(description).to.not.be.null;
        expect(strong!.textContent).to.not.equal("");
        expect(description!.textContent).to.not.equal("");
      }
    });
  });

  describe("setupTryIt", () => {
    it("should initialize tryItState with a hand and empty selectedCards", () => {
      expect(help.tryItState).to.not.be.null;
      expect(help.tryItState!.hand).to.be.an("array");
      expect(help.tryItState!.hand.length).to.be.greaterThan(0);
      expect(help.tryItState!.selectedCards).to.be.an("array");
      expect(help.tryItState!.selectedCards).to.have.lengthOf(0);
    });

    it("should render initial message", () => {
      const messageContainer = document.getElementById("messages");
      expect(messageContainer).to.not.be.null;
      expect(messageContainer!.innerHTML).to.include("Select a valid combination");
    });

    it("should render play pile in game-content", () => {
      const gameContent = document.getElementById("game-content");
      expect(gameContent).to.not.be.null;
      const playPileCards = gameContent!.querySelectorAll(".card");
      expect(playPileCards.length).to.be.greaterThan(0);
    });

    it("should render player hand", () => {
      const playerHandContainer = document.getElementById("player-hand");
      expect(playerHandContainer).to.not.be.null;
      const handCards = playerHandContainer!.querySelectorAll(".card");
      expect(handCards.length).to.be.greaterThan(0);
    });

    it("should have set a play pile on the game client", () => {
      const playPile = help.gameClient.getPlayPile();
      expect(playPile).to.be.an("array");
      expect(playPile.length).to.be.greaterThan(0);
    });

    describe("card click handling", () => {
      it("should select a card on first click", () => {
        const playerHandContainer = document.getElementById("player-hand") as HTMLElement;
        const messageContainer = document.getElementById("messages") as HTMLElement;
        const cardEl = playerHandContainer.querySelector(".card") as HTMLElement;

        cardEl!.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
        expect(help.tryItState!.selectedCards).to.have.lengthOf.at.least(1);
        // Message updates to either Valid or Invalid depending on the play pile
        expect(messageContainer.innerHTML).to.match(/(Valid|Invalid) combination/);
      });

      it("should toggle card selection on subsequent clicks", () => {
        const playerHandContainer = document.getElementById("player-hand") as HTMLElement;
        const cardEl = playerHandContainer.querySelector(".card") as HTMLElement;

        cardEl!.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
        expect(help.tryItState!.selectedCards).to.have.lengthOf.at.least(1);

        cardEl!.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
        expect(help.tryItState!.selectedCards).to.have.lengthOf(0);
      });

      it("should select multiple cards", () => {
        const playerHandContainer = document.getElementById("player-hand") as HTMLElement;
        const cards = playerHandContainer.querySelectorAll(".card");

        if (cards.length >= 2) {
          (cards[0] as HTMLElement).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          (cards[1] as HTMLElement).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          expect(help.tryItState!.selectedCards).to.have.lengthOf(2);
        }
      });

      it("should display valid/invalid message based on play", () => {
        const playerHandContainer = document.getElementById("player-hand") as HTMLElement;
        const messageContainer = document.getElementById("messages") as HTMLElement;
        const cards = playerHandContainer.querySelectorAll(".card");

        if (cards.length >= 1) {
          (cards[0] as HTMLElement).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          // Should show either Valid or Invalid
          expect(messageContainer.innerHTML).to.match(/(Valid|Invalid) combination/);
        }
      });

      it("should show 'Select a valid combination' when no cards selected", () => {
        const playerHandContainer = document.getElementById("player-hand") as HTMLElement;
        const messageContainer = document.getElementById("messages") as HTMLElement;
        const cards = playerHandContainer.querySelectorAll(".card");

        if (cards.length >= 1) {
          (cards[0] as HTMLElement).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          // Message updates to either Valid or Invalid depending on the play pile
          expect(messageContainer.innerHTML).to.match(/(Valid|Invalid) combination/);

          (cards[0] as HTMLElement).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          expect(messageContainer.innerHTML).to.include("Select a valid combination");
        }
      });

      it("should not select cards from the play pile", () => {
        const playArea = document.getElementById("play-area") as HTMLElement;
        const pileCard = playArea.querySelector(".card") as HTMLElement;

        if (pileCard) {
          const selectedBefore = help.tryItState!.selectedCards.length;
          pileCard.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
          expect(help.tryItState!.selectedCards.length).to.equal(selectedBefore);
        }
      });
    });
  });

  describe("getTryItHand", () => {
    it("should return a valid hand array", () => {
      // Reset DOM before calling getTryItHand again
      const gameContent = document.getElementById("game-content");
      const playerHandContainer = document.getElementById("player-hand");
      if (gameContent) gameContent.innerHTML = "";
      if (playerHandContainer) playerHandContainer.innerHTML = "";

      const hand = help.getTryItHand();
      expect(hand).to.be.an("array");
      expect(hand.length).to.be.greaterThan(0);
    });

    it("should return a sorted hand", () => {
      const hand = help.getTryItHand();
      for (let i = 1; i < hand.length; i++) {
        expect(hand[i].value).to.be.greaterThanOrEqual(hand[i - 1].value);
      }
    });

    it("should set the player hand on the game client", () => {
      const gameContent = document.getElementById("game-content");
      const playerHandContainer = document.getElementById("player-hand");
      if (gameContent) gameContent.innerHTML = "";
      if (playerHandContainer) playerHandContainer.innerHTML = "";

      help.getTryItHand();

      const playerHand = help.gameClient.getPlayerHands(0) as Card[];
      expect(playerHand).to.be.an("array");
      expect(playerHand.length).to.be.greaterThan(0);
    });

    it("should set a play pile on the game client", () => {
      const gameContent = document.getElementById("game-content");
      if (gameContent) gameContent.innerHTML = "";

      help.getTryItHand();

      const playPile = help.gameClient.getPlayPile();
      expect(playPile).to.be.an("array");
      expect(playPile.length).to.be.greaterThan(0);
    });

    it("should render the play pile and hand in the DOM", () => {
      const gameContent = document.getElementById("game-content");
      const playerHandContainer = document.getElementById("player-hand");
      if (gameContent) gameContent.innerHTML = "";
      if (playerHandContainer) playerHandContainer.innerHTML = "";

      help.getTryItHand();

      expect(gameContent!.querySelectorAll(".card").length).to.be.greaterThan(0);
      expect(playerHandContainer!.querySelectorAll(".card").length).to.be.greaterThan(0);
    });
  });
});
