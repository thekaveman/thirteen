import { UI } from "./ui.js";
import { Card, Deck } from "./deck.js";
import { Game } from "./game.js";
import { AI } from "./ai.js";
import { RANKS, SUITS } from "./constants.js";

class Help {
  constructor() {
    this.deck = new Deck();
    this.game = new Game(this.deck, Game.STATE_KEY + "-help");
    this.ai = new AI(this.game);

    this.ui = new UI(this.game);
    this.ui.init(this.game);

    const mainContainer = document.getElementById("help-container");
    if (mainContainer) {
      mainContainer.addEventListener("click", (event) => {
        const target = event.target;
        if (target.classList.contains("card")) {
          target.classList.toggle("selected");
        }
      });
    }

    this.setupRanking();
    this.setupCombos();
    this.setupTryIt();
  }

  getTryItHand() {
    // 1. Generate a random playPile
    const combinationTypes = ["single", "pair", "triple", "straight"];
    const randomType = combinationTypes[Math.floor(Math.random() * combinationTypes.length)];

    let hands = [];
    let playPile = [];
    while (playPile.length === 0) {
      hands = this.game.deck.deal(2);
      const combinations = this.ai.generateCombinations(hands[0], randomType);
      if (combinations.length > 0) {
        playPile = combinations[Math.floor(Math.random() * combinations.length)];
      }
    }
    this.game.gameState.playPile = playPile;

    // 2. Generate a hand that can beat the playPile
    const validMoves = this.ai.findAllValidMoves(hands[1], playPile, 1, [hands[1]]);

    if (validMoves.length > 0) {
      const winningMove = validMoves[0];
      const otherCards = hands[1]
        .filter((c) => !winningMove.some((wc) => wc.value === c.value))
        .slice(0, 13 - winningMove.length);
      const userHand = [...winningMove, ...otherCards];
      Card.sort(userHand);
      this.game.gameState.playerHands[0] = userHand;

      // 3. Render the playPile and hand
      const playAreaContent = document.getElementById("game-content");
      playAreaContent.innerHTML = ""; // Clear previous content
      this.ui.renderCardsContainer(this.game.gameState.playPile, playAreaContent);

      const playerHandContainer = document.getElementById("player-hand");
      playerHandContainer.innerHTML = ""; // Clear previous content
      this.ui.renderCardsContainer(this.game.gameState.playerHands[0], playerHandContainer);

      return userHand;
    } else {
      // if no valid move is found, try again
      return this.getTryItHand();
    }
  }

  setupRanking() {
    const rankContainer = document.getElementById("ranks-container");
    if (rankContainer) {
      const rankCards = RANKS.map((rank) => this.deck.cards.find((card) => card.rank === rank));
      this.ui.renderCardsContainer(rankCards, rankContainer);
    }

    const suitContainer = document.getElementById("suits-container");
    if (suitContainer) {
      const suitCards = SUITS.map((suit) => this.deck.cards.find((card) => card.suit === suit && card.rank === "3"));
      this.ui.renderCardsContainer(suitCards, suitContainer);
    }

    const exampleContainer = document.getElementById("hand-container");
    if (exampleContainer) {
      const hand = this.deck.deal(1)[0];
      Card.sort(hand);
      this.ui.renderCardsContainer(hand, exampleContainer);
    }
  }

  setupCombos() {
    const combinationDivs = document.querySelectorAll(".combination[data-combination]");
    combinationDivs.forEach((div) => {
      const combinationType = div.dataset.combination;
      if (combinationType) {
        // Update the indicator text
        const placeholder = div.querySelector(".combination-type");
        if (placeholder) {
          placeholder.textContent = this.ui.getCombinationTypeIndicator(combinationType);
        }

        // Render the example
        const container = document.createElement("div");
        container.classList.add("combination-examples");
        let hand;
        if (combinationType === "straight") {
          const newDeck = new Deck();
          const middle = Math.floor(newDeck.cards.length / 2);
          const start = middle - 6;
          hand = newDeck.cards.slice(start, start + 13);
        } else {
          hand = this.deck.cards;
        }

        let combinations;
        if (combinationType === "straight") {
          combinations = this.ai
            .generateCombinations(hand, combinationType)
            // between 3 and 6 cards in length
            .filter((s) => s.length >= 3 && s.length <= 6)
            // a mix of suits so suited isn't assumed necessary
            .filter((s) => s.some((c) => c.suit != s[0].suit));
        } else if (combinationType == "consecutive_pairs") {
          // 3 consecutive pairs
          combinations = this.ai.generateCombinations(hand, combinationType).filter((s) => s.length == 6);
        } else {
          combinations = this.ai.generateCombinations(hand, combinationType);
        }

        if (combinations.length > 0) {
          const randomIndex = Math.floor(Math.random() * combinations.length);
          const randomCombination = combinations[randomIndex];
          Card.sort(randomCombination);
          div.appendChild(container);
          this.ui.renderCardsContainer(randomCombination, container);
        }
      }
    });
  }

  setupTryIt() {
    const tryItContainer = document.getElementById("try-it");
    if (tryItContainer) {
      const hand = this.getTryItHand();
      let selectedCards = [];
      const messageContainer = document.getElementById("messages");
      const initMessageHtml = "<p>Select a valid combination to beat this one:</p>";
      messageContainer.innerHTML = initMessageHtml;

      const playerHandContainer = document.getElementById("player-hand");
      playerHandContainer.addEventListener("click", (event) => {
        const cardEl = event.target.closest(".card");
        if (cardEl) {
          const card = JSON.parse(cardEl.dataset.card);
          const index = selectedCards.findIndex((c) => c.value === card.value);
          if (index > -1) {
            selectedCards.splice(index, 1);
          } else {
            selectedCards.push(card);
          }
          Card.sort(selectedCards);

          if (selectedCards.length > 0) {
            const isValid = this.game.isValidPlay(selectedCards, this.game.gameState.playPile, hand, 1, [hand]);
            if (isValid) {
              messageContainer.innerHTML = "<p>✅ Valid combination</p>";
            } else {
              messageContainer.innerHTML = "<p>❌ Invalid combination</p>";
            }
          } else {
            messageContainer.innerHTML = initMessageHtml;
          }
        }
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // initialize a new help page
  const help = new Help();
});
