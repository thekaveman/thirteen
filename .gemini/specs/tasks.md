# Implementation plan

This is an actionable checklist. Complete the tasks in order.

## 0: Project Setup

- [ ] Create `src/` folder for all subsequent source code files
- [ ] Create `index.html` file for the game board
- [ ] Create `style.css` file for basic layout and text styling
- [ ] Create `app.js` file for all game logic
- [ ] Link the CSS file and the app JS file in `index.html`
- [ ] Create `test.html` file for running the tests
- [ ] Create `tests.js` file for all test code
- [ ] Link the CSS file and both JS files in `test.html`

## 1: The Foundation (Data & Display)

_Goal: Create, shuffle, deal, and display text-based cards on the screen._

- [ ] Data structures:
  - [ ] In `app.js`, define a way to represent a card (e.g., `const card = { rank: 'K', suit: '♥', value: 13 };`)
  - [ ] Define a standard 52-card deck as an array of these card objects.
- [ ] Core functions:
  - [ ] Write a `createDeck()` function
  - [ ] Write a `shuffleDeck(deck)` function
  - [ ] Write a `deal(deck, numPlayers)` function that returns an array of hands
- [ ] Rendering:
  - [ ] In `index.html` create simple `<div>` for `player1-hand`, `player2-hand`, and `play-area`
  - [ ] In `app.js` write a `render()` function that takes the game state and displays the hands and play area as text inside the `<div>`s

## 2: Core Gameplay Loop

_Goal: Make the game playable for two humans in "hot-seat" mode._

- [ ] Game state management
  - [ ] Create a central `gameState` object to track `currentPlayer`, `currentTurn`, `playPile`, `playerHands`, etc.
- [ ] Player interaction
  - [ ] Implement card selection. When a player clicks on a card's text, it should be marked as "selected"
  - [ ] Add "Play" and "Pass" buttons to `index.html`
- [ ] Game logic engine
  - [ ] Create the main validation function: `isValidPlay(selectedCards, playPile)`. This is the most complex part. It needs to check for all valid combinations and rules
  - [ ] Hook up the "Play" button to call `isValidPlay()`: if valid, update the `gameState` and re-render; if invalid, give the user feedback (e.g., an alert)
  - [ ] Hook up the "Pass" button to update the `gameState`
- [ ] Win conditions
  - [ ] Implement logic for winning a round (when one player plays and the other passes), allowing the winner to start the next round
  - [ ] After each valid play, check if the current player's hand is empty. If so, declare them the winner of the game
- [ ] New game
  - [ ] After the end of a game, a `New Game` button should be displayed; clicking this button resets the `gameState` and starts over from the beginning

## 3: The First Opponent (Basic AI)

_Goal: Create a simple computer opponent to play against._

- [ ] AI Turn Logic
  - [ ] Create an `executeAITurn()` function
  - [ ] Inside this function, program the AI to scan its hand for the lowest possible valid move it can play on the `playPile`
  - [ ] If it finds a move, it plays it; if not, it passes
- [ ] Integration
  - [ ] Update the game loop: when it's the AI's turn, call the `executeAITurn()` function
