import { assert } from "./utils.js";
import { SUITS, RANKS } from "../src/app/constants.js";
import { Deck, Card } from "../src/app/deck.js";

function test_Card_allSameRank_returnsFalseForDifferentRank() {
  const cards = [new Card("K", "♦"), new Card("A", "♠"), new Card("A", "♣")];
  assert(!Card.allSameRank(cards), "Should return false for cards with different ranks");
}

function test_Card_allSameRank_returnsTrueForSameRank() {
  const cards = [new Card("A", "♠"), new Card("A", "♣"), new Card("A", "♦")];
  assert(Card.allSameRank(cards), "Should return true for cards with the same rank");
}

function test_Card_createsCorrectCard() {
  const card = new Card("A", "♠");
  assert(card.rank === "A", "Card should have correct rank");
  assert(card.suit === "♠", "Card should have correct suit");
  assert(card.value === Card.getValue("A", "♠"), "Card should have correct value");
}

function test_Card_findLowest_findsLowestCard() {
  const hands = [
    [new Card("K", "♣"), new Card("A", "♠")],
    [new Card("4", "♠"), new Card("3", "♦")],
  ];
  const lowestCard = Card.findLowest(hands);
  assert(lowestCard.value === Card.getValue("3", "♦"), "Should find the lowest card in the the hands");
}

function test_Card_getValue_returnsCorrectValue() {
  assert(Card.getValue("3", "♠") === 0, "3♠ should have value 0");
  assert(Card.getValue("A", "♦") === 46, "A♦ should have value 46");
  assert(Card.getValue("2", "♥") === 51, "2♥ should have value 51");
}

function test_Card_parse_returnsCard() {
  const card = new Card("3", "♠");
  const cardJson = JSON.stringify(card);

  const parsed = Card.parse(cardJson);

  assert(parsed.value === card.value);
}

function test_Card_sort_sortsByValue() {
  const hand = [new Card("A", "♠"), new Card("3", "♦"), new Card("K", "♣")];
  Card.sort(hand);
  assert(hand[0].value === Card.getValue("3", "♦"), "Hand should be sorted by value");
  assert(hand[1].value === Card.getValue("K", "♣"), "Hand should be sorted by value");
  assert(hand[2].value === Card.getValue("A", "♠"), "Hand should be sorted by value");
}

function test_Deck_constructor_has52Cards() {
  const deck = new Deck();
  assert(deck.cards.length === 52, "Deck should have 52 cards");
}

function test_Deck_constructor_has13CardsOfEachSuit() {
  const deck = new Deck();
  const suits = deck.cards.reduce((acc, card) => {
    acc[card.suit] = (acc[card.suit] || 0) + 1;
    return acc;
  }, {});
  SUITS.forEach((suit) => {
    assert(suits[suit] === 13, `Suit ${suit} should have 13 cards`);
  });
}

function test_Deck_constructor_has4CardsOfEachRank() {
  const deck = new Deck();
  const ranks = deck.cards.reduce((acc, card) => {
    acc[card.rank] = (acc[card.rank] || 0) + 1;
    return acc;
  }, {});
  RANKS.forEach((rank) => {
    assert(ranks[rank] === 4, `Rank ${rank} should have 4 cards`);
  });
}

function test_Deck_constructor_cardsHaveCorrectStructure() {
  const deck = new Deck();
  deck.cards.forEach((card) => {
    assert(card.hasOwnProperty("rank"), "Card should have a rank property");
    assert(card.hasOwnProperty("suit"), "Card should have a suit property");
    assert(card.hasOwnProperty("value"), "Card should have a value property");
  });
}

function test_Deck_deal_deals13CardsToEachPlayer() {
  const deck = new Deck();
  const numPlayers = 2;
  const hands = deck.deal(numPlayers);
  hands.forEach((hand, i) => {
    assert(hand.length === 13, `Player ${i + 1} should have 13 cards`);
  });
}

function test_Deck_deal_dealsCorrectNumberOfHands() {
  const deck = new Deck();
  const numPlayers = 2;
  const hands = deck.deal(numPlayers);
  assert(hands.length === numPlayers, "Should deal the correct number of hands");
}

function test_Deck_deal_dealsCorrectTotalCards() {
  const deck = new Deck();
  const numPlayers = 4;
  const hands = deck.deal(numPlayers);
  const totalCardsInHands = hands.reduce((total, hand) => total + hand.length, 0);
  assert(totalCardsInHands === 52, "Should deal 52 cards in total for 4 players");

  const deck2 = new Deck();
  const numPlayers2 = 2;
  const hands2 = deck2.deal(numPlayers2);
  const totalCardsInHands2 = hands2.reduce((total, hand) => total + hand.length, 0);
  assert(totalCardsInHands2 === 26, "Should deal 26 cards in total for 2 players");
}

function test_Deck_deal_dealsShuffledCards() {
  const deck = new Deck();
  const hands1 = deck.deal(2);
  const hands2 = deck.deal(2);
  assert(JSON.stringify(hands1) !== JSON.stringify(hands2), "Dealt hands should be shuffled and different");
}

function test_Deck_deal_doesNotModifyDeck() {
  const deck = new Deck();
  const originalCards = [...deck.cards];
  deck.deal(2);
  assert(JSON.stringify(deck.cards) === JSON.stringify(originalCards), "Deck should not be modified after dealing");
}

export const deckTests = [
  test_Card_allSameRank_returnsFalseForDifferentRank,
  test_Card_allSameRank_returnsTrueForSameRank,
  test_Card_createsCorrectCard,
  test_Card_findLowest_findsLowestCard,
  test_Card_getValue_returnsCorrectValue,
  test_Card_parse_returnsCard,
  test_Card_sort_sortsByValue,
  test_Deck_constructor_has52Cards,
  test_Deck_constructor_has13CardsOfEachSuit,
  test_Deck_constructor_has4CardsOfEachRank,
  test_Deck_constructor_cardsHaveCorrectStructure,
  test_Deck_deal_deals13CardsToEachPlayer,
  test_Deck_deal_dealsCorrectNumberOfHands,
  test_Deck_deal_dealsCorrectTotalCards,
  test_Deck_deal_dealsShuffledCards,
  test_Deck_deal_doesNotModifyDeck,
];
