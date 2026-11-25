import { AI } from "./app/ai/index.js";
import { AI_PERSONAS } from "./app/ai/personas.js";
import { Card, Deck, Game, COMBINATION_TYPES, RANKS, SUITS, GameClient } from "./app/game/index.js";
import { UI } from "./app/ui.js";

interface TryItState {
  hand: Card[];
  selectedCards: Card[];
}

class Help {
  deck: Deck;
  game: Game;
  gameClient: GameClient;
  ai: AI;
  ui: UI;
  tryItState: TryItState | null;

  constructor() {
    this.deck = new Deck();
    this.game = new Game(this.deck, Game.STATE_KEY + "-help");
    this.gameClient = new GameClient(this.game);
    this.ai = new AI(this.gameClient, "lowest_card");

    this.ui = new UI(this.gameClient);
    this.ui.init();
    this.tryItState = null;

    const mainContainer = document.getElementById("help-container");
    if (mainContainer) {
      mainContainer.addEventListener("click", (event: Event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains("card")) {
          target.classList.toggle("selected");
        }
      });
    }

    this.setupRanking();
    this.setupCombos();
    this.setupTryIt();
    this.setupAI();
  }

  getTryItHand(): Card[] {
    // 1. Generate a random playPile
    const combinationTypes = [
      COMBINATION_TYPES.SINGLE,
      COMBINATION_TYPES.PAIR,
      COMBINATION_TYPES.TRIPLE,
      COMBINATION_TYPES.STRAIGHT,
    ];
    const randomType = combinationTypes[Math.floor(Math.random() * combinationTypes.length)];

    let hands: Card[][] = [];
    let playPile: Card[] = [];
    while (playPile.length === 0) {
      hands = this.deck.deal(2);
      const combinations = this.ai.generateCombinations(hands[0], randomType);
      if (combinations.length > 0) {
        playPile = combinations[Math.floor(Math.random() * combinations.length)];
      }
    }
    this.gameClient.setPlayPile(playPile);

    // 2. Generate a hand that can beat the playPile
    const validMoves = this.ai.findAllValidMoves(hands[1], playPile, 1, [hands[1]]);

    if (validMoves.length > 0) {
      const winningMove = validMoves[0];
      const otherCards = hands[1]
        .filter((c) => !winningMove.some((wc) => wc.value === c.value))
        .slice(0, 13 - winningMove.length);
      const userHand = [...winningMove, ...otherCards];
      Card.sort(userHand);
      this.gameClient.setPlayerHand(0, userHand);

      // 3. Render the playPile and hand
      const playAreaContent = document.getElementById("game-content");
      if (playAreaContent) {
        playAreaContent.innerHTML = "";
        this.ui.renderCardsContainer(this.gameClient.getPlayPile(), playAreaContent);
      }

      const playerHandContainer = document.getElementById("player-hand");
      if (playerHandContainer) {
        playerHandContainer.innerHTML = "";
        this.ui.renderCardsContainer(this.gameClient.getPlayerHands(0) as Card[], playerHandContainer);
      }

      return userHand;
    }

    // If no valid move is found, try again
    return this.getTryItHand();
  }

  setupRanking(): void {
    const rankContainer = document.getElementById("ranks-container");
    if (rankContainer) {
      const rankCards = RANKS.map((rank) => this.deck.cards.find((card) => card.rank === rank));
      const validCards = rankCards.filter((c): c is Card => c !== undefined);
      this.ui.renderCardsContainer(validCards, rankContainer);
    }

    const suitContainer = document.getElementById("suits-container");
    if (suitContainer) {
      const suitCards = SUITS.map((suit) => this.deck.cards.find((card) => card.suit === suit && card.rank === "3"));
      const validCards = suitCards.filter((c): c is Card => c !== undefined);
      this.ui.renderCardsContainer(validCards, suitContainer);
    }

    const exampleContainer = document.getElementById("hand-container");
    if (exampleContainer) {
      const hand = this.deck.deal(1)[0];
      Card.sort(hand);
      this.ui.renderCardsContainer(hand, exampleContainer);
    }
  }

  setupCombos(): void {
    const combinationDivs = document.querySelectorAll(".combination[data-combination]");
    combinationDivs.forEach((div) => {
      const combinationType = (div as HTMLElement).dataset.combination;
      if (combinationType) {
        // Update the indicator text
        const placeholder = div.querySelector(".combination-type");
        if (placeholder) {
          // Determine bomb context from the section: bombs section → play on a 2
          const comboSection = ((div as HTMLElement).closest(".combination-examples") as HTMLElement | null)?.dataset.section;
          const playPile = comboSection === "bombs" ? [new Card("2", "♠")] : [];
          (placeholder as HTMLElement).textContent = this.ui.getCombinationTypeIndicator(combinationType, playPile);
        }

        // Render the example
        const container = document.createElement("div");
        container.classList.add("combination-examples");
        let hand: Card[];
        if (combinationType === COMBINATION_TYPES.STRAIGHT) {
          const newDeck = new Deck();
          const middle = Math.floor(newDeck.cards.length / 2);
          const start = middle - 6;
          hand = newDeck.cards.slice(start, start + 13);
        } else {
          hand = this.deck.cards;
        }

        let combinations: Card[][];
        if (combinationType === COMBINATION_TYPES.STRAIGHT) {
          combinations = this.ai
            .generateCombinations(hand, combinationType)
            // between 3 and 6 cards in length
            .filter((s) => s.length >= 3 && s.length <= 6)
            // a mix of suits so suited isn't assumed necessary
            .filter((s) => s.some((c) => c.suit !== s[0].suit));
        } else if (combinationType === COMBINATION_TYPES.CONSECUTIVE_PAIRS) {
          // 3 consecutive pairs
          combinations = this.ai.generateCombinations(hand, combinationType).filter((s) => s.length === 6);
        } else {
          combinations = this.ai.generateCombinations(hand, combinationType);
        }

        if (combinations.length > 0) {
          const randomIndex = Math.floor(Math.random() * combinations.length);
          const randomCombination = combinations[randomIndex];
          Card.sort(randomCombination);
          (div as HTMLElement).appendChild(container);
          this.ui.renderCardsContainer(randomCombination, container as HTMLElement);
        }
      }
    });
  }

  setupAI(): void {
    const aiContainer = document.getElementById("ai-container");
    if (aiContainer) {
      for (const persona of Object.values(AI_PERSONAS)) {
        const aiDiv = document.createElement("div");
        aiDiv.classList.add("ai");
        const name = document.createElement("strong");
        name.textContent = `${persona.icon} ${persona.friendly_name}`;
        const description = document.createElement("p");
        description.textContent = persona.description;
        aiDiv.appendChild(name);
        aiDiv.appendChild(description);
        (aiContainer as HTMLElement).appendChild(aiDiv);
      }
    }
  }

  setupTryIt(): void {
    const tryItContainer = document.getElementById("try-it");
    if (tryItContainer) {
      const hand = this.getTryItHand();
      this.tryItState = { hand, selectedCards: [] };
      const messageContainer = document.getElementById("messages");
      if (messageContainer) {
        messageContainer.innerHTML = "<p>Select a valid combination to beat the one shown above.</p>";
      }

      const playerHandContainer = document.getElementById("player-hand");
      if (playerHandContainer) {
        playerHandContainer.addEventListener("click", (event: Event) => {
          const target = event.target as HTMLElement;
          const cardEl = target.closest(".card") as HTMLElement | null;
          if (!cardEl) return;

          const cardData = cardEl.dataset.card;
          if (!cardData) return;
          const card = Card.parse(cardData);
          if (!card) return;

          const state = this.tryItState!;
          const index = state.selectedCards.findIndex((c) => c.value === card.value);
          if (index > -1) {
            state.selectedCards.splice(index, 1);
          } else {
            state.selectedCards.push(card);
          }
          Card.sort(state.selectedCards);

          if (state.selectedCards.length > 0) {
            const isValid = this.gameClient.isValidPlay(state.selectedCards, this.gameClient.getPlayPile(), state.hand, 1, [
              state.hand,
            ]);
            const indicator = isValid
              ? this.ui.getCombinationTypeIndicator(
                  this.gameClient.getCombinationType(state.selectedCards),
                  this.gameClient.getPlayPile()
                )
              : "❌";
            if (messageContainer) {
              messageContainer.innerHTML = `<p>${isValid ? "Valid" : "Invalid"} combination ${indicator}</p>`;
            }
          } else if (messageContainer) {
            messageContainer.innerHTML = "<p>Select a valid combination to beat the one shown above.</p>";
          }
        });
      }
    }
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    // initialize a new help page
    new Help();
  });
}

export { Help };
export default Help;
