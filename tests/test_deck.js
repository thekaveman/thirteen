import { assert } from "./utils.js";
import { SUITS, RANKS } from "../src/constants.js";
import { createDeck, deal, shuffleDeck, sortHand } from "../src/deck.js";

function test_createDeck_has52Cards() {
  const deck = createDeck();
  assert(deck.length === 52, "Deck should have 52 cards");
}

function test_createDeck_has13CardsOfEachSuit() {
  const deck = createDeck();
  const suits = deck.reduce((acc, card) => {
    acc[card.suit] = (acc[card.suit] || 0) + 1;
    return acc;
  }, {});
  SUITS.forEach((suit) => {
    assert(suits[suit] === 13, `Suit ${suit} should have 13 cards`);
  });
}

function test_createDeck_has4CardsOfEachRank() {
  const deck = createDeck();
  const ranks = deck.reduce((acc, card) => {
    acc[card.rank] = (acc[card.rank] || 0) + 1;
    return acc;
  }, {});
  RANKS.forEach((rank) => {
    assert(ranks[rank] === 4, `Rank ${rank} should have 4 cards`);
  });
}

function test_createDeck_cardsHaveCorrectStructure() {
  const deck = createDeck();
  deck.forEach((card) => {
    assert(card.hasOwnProperty("rank"), "Card should have a rank property");
    assert(card.hasOwnProperty("suit"), "Card should have a suit property");
    assert(card.hasOwnProperty("value"), "Card should have a value property");
  });
}

function test_deal_deals13CardsToEachPlayer() {
  const deck = createDeck();
  const numPlayers = 2;
  const hands = deal(deck, numPlayers);
  hands.forEach((hand, i) => {
    assert(hand.length === 13, `Player ${i + 1} should have 13 cards`);
  });
}

function test_deal_dealsCorrectNumberOfHands() {
  const deck = createDeck();
  const numPlayers = 2;
  const hands = deal(deck, numPlayers);
  assert(hands.length === numPlayers, "Should deal the correct number of hands");
}

function test_deal_dealsCorrectTotalCards() {
  const deck = createDeck();
  const numPlayers = 4;
  const hands = deal(deck, numPlayers);
  const totalCardsInHands = hands.reduce((total, hand) => total + hand.length, 0);
  assert(totalCardsInHands === 52, "Should deal 52 cards in total for 4 players");

  const deck2 = createDeck();
  const numPlayers2 = 2;
  const hands2 = deal(deck2, numPlayers2);
  const totalCardsInHands2 = hands2.reduce((total, hand) => total + hand.length, 0);
  assert(totalCardsInHands2 === 26, "Should deal 26 cards in total for 2 players");
}

function test_shuffleDeck_shufflesDeck() {
  const deck1 = createDeck();
  const deck2 = [...deck1];
  shuffleDeck(deck2);
  assert(JSON.stringify(deck1) !== JSON.stringify(deck2), "Shuffled deck should be different from the original");
  assert(deck1.length === deck2.length, "Shuffled deck should have the same number of cards");
}

function test_sortHand_sortsHandByValue() {
  const hand = [
    { rank: "A", suit: "♠", value: 48 },
    { rank: "3", suit: "♦", value: 2 },
    { rank: "K", suit: "♣", value: 45 },
  ];
  sortHand(hand);
  assert(hand[0].value === 2, "Hand should be sorted by value");
  assert(hand[1].value === 45, "Hand should be sorted by value");
  assert(hand[2].value === 48, "Hand should be sorted by value");
}

export const deckTests = [
  test_createDeck_has52Cards,
  test_createDeck_has13CardsOfEachSuit,
  test_createDeck_has4CardsOfEachRank,
  test_createDeck_cardsHaveCorrectStructure,
  test_deal_deals13CardsToEachPlayer,
  test_deal_dealsCorrectNumberOfHands,
  test_deal_dealsCorrectTotalCards,
  test_shuffleDeck_shufflesDeck,
  test_sortHand_sortsHandByValue,
];
