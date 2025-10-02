import { SUITS, RANKS } from "../src/app/constants.js";
import { Deck, Card } from "../src/app/deck.js";

describe("Card", () => {
  it("should create a card with correct rank, suit, and value", () => {
    const card = new Card("A", "♠");
    expect(card.rank).to.equal("A");
    expect(card.suit).to.equal("♠");
    expect(card.value).to.equal(Card.getValue("A", "♠"));
  });

  it("data() should return correct card data", () => {
    const card = new Card("Q", "♥");
    const cardData = card.data();
    expect(cardData.rank).to.equal("Q");
    expect(cardData.suit).to.equal("♥");
    expect(cardData.value).to.equal(card.value);
  });

  it("getValue() should return correct card values", () => {
    expect(Card.getValue("3", "♠")).to.equal(0);
    expect(Card.getValue("A", "♦")).to.equal(46);
    expect(Card.getValue("2", "♥")).to.equal(51);
  });

  it("sort() should sort cards by value", () => {
    const hand = [new Card("A", "♠"), new Card("3", "♦"), new Card("K", "♣")];
    Card.sort(hand);
    expect(hand[0].value).to.equal(Card.getValue("3", "♦"));
    expect(hand[1].value).to.equal(Card.getValue("K", "♣"));
    expect(hand[2].value).to.equal(Card.getValue("A", "♠"));
  });

  it("allSameRank() should return true for an empty array", () => {
    expect(Card.allSameRank([])).to.be.true;
  });

  it("allSameRank() should return true for cards with the same rank", () => {
    const cards = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")];
    expect(Card.allSameRank(cards)).to.be.true;
  });

  it("allSameRank() should return false for cards with different ranks", () => {
    const cards = [new Card("K", "♦"), new Card("A", "♠"), new Card("A", "♣")];
    expect(Card.allSameRank(cards)).to.be.false;
  });

  it("findLowest() should find the lowest card among hands", () => {
    const hands = [
      [new Card("K", "♣"), new Card("A", "♠")],
      [new Card("4", "♠"), new Card("3", "♦")],
    ];
    const lowestCard = Card.findLowest(hands);
    expect(lowestCard.value).to.equal(Card.getValue("3", "♦"));
  });

  it("listToObjects() and objectsToList() should correctly convert between lists and objects", () => {
    const cards = [new Card("7", "♣"), new Card("J", "♥")];
    const objects = Card.listToObjects(cards);
    expect(objects).to.have.lengthOf(2);
    expect(objects[0].rank).to.equal("7");

    const newCards = Card.objectsToList(objects);
    expect(newCards).to.have.lengthOf(2);
    expect(newCards[0]).to.be.an.instanceOf(Card);
    expect(newCards[1].suit).to.equal("♥");
  });

  it("parse() should correctly parse a JSON string to a Card object", () => {
    const card = new Card("3", "♠");
    const cardJson = JSON.stringify(card);
    const parsed = Card.parse(cardJson);
    expect(parsed.value).to.equal(card.value);
  });
});

describe("Deck", () => {
  it("should have 52 cards on construction", () => {
    const deck = new Deck();
    expect(deck.cards).to.have.lengthOf(52);
  });

  it("should have 13 cards of each suit", () => {
    const deck = new Deck();
    const suits = deck.cards.reduce((acc, card) => {
      acc[card.suit] = (acc[card.suit] || 0) + 1;
      return acc;
    }, {});
    SUITS.forEach((suit) => {
      expect(suits[suit]).to.equal(13);
    });
  });

  it("should have 4 cards of each rank", () => {
    const deck = new Deck();
    const ranks = deck.cards.reduce((acc, card) => {
      acc[card.rank] = (acc[card.rank] || 0) + 1;
      return acc;
    }, {});
    RANKS.forEach((rank) => {
      expect(ranks[rank]).to.equal(4);
    });
  });

  it("cards should have the correct structure", () => {
    const deck = new Deck();
    deck.cards.forEach((card) => {
      expect(card).to.have.all.keys("rank", "suit", "value");
    });
  });

  it("should be created with the provided cards", () => {
    const cards = [
      { rank: "A", suit: "♠" },
      { rank: "K", suit: "♦" },
    ];
    const deck = new Deck(cards);
    expect(deck.cards).to.have.lengthOf(2);
    expect(deck.cards[0]).to.be.an.instanceOf(Card);
    expect(deck.cards[1].rank).to.equal("K");
  });

  it("deal() should deal the correct number of hands", () => {
    const deck = new Deck();
    const numPlayers = 2;
    const hands = deck.deal(numPlayers);
    expect(hands).to.have.lengthOf(numPlayers);
  });

  it("deal() should deal 13 cards to each player", () => {
    const deck = new Deck();
    const numPlayers = 2;
    const hands = deck.deal(numPlayers);
    hands.forEach((hand) => {
      expect(hand).to.have.lengthOf(13);
    });
  });

  it("deal() should deal the correct total number of cards", () => {
    const deck4p = new Deck();
    const hands4p = deck4p.deal(4);
    const totalCards4p = hands4p.reduce((total, hand) => total + hand.length, 0);
    expect(totalCards4p).to.equal(52);

    const deck2p = new Deck();
    const hands2p = deck2p.deal(2);
    const totalCards2p = hands2p.reduce((total, hand) => total + hand.length, 0);
    expect(totalCards2p).to.equal(26);
  });

  it("deal() should not modify the original deck", () => {
    const deck = new Deck();
    const originalCards = [...deck.cards];
    deck.deal(2);
    expect(deck.cards).to.deep.equal(originalCards);
  });

  it("deal() should produce shuffled, different hands on subsequent calls", () => {
    const deck = new Deck();
    const hands1 = deck.deal(2);
    const hands2 = deck.deal(2);
    expect(hands1).to.not.deep.equal(hands2);
  });
});
