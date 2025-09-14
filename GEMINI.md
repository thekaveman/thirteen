# Thirteen

This document outlines the development plan for a web-based version of the card game "Thirteen" (also known as Tiến Lên). The project follows a "vibe coding" philosophy, prioritizing a simple, functional Minimum Viable Product (MVP) and iterative development.

## Principles

- Start with the absolute basics. No graphics, no frameworks, just plain HTML, CSS, and JavaScript to create a text/Unicode-based card game
- Keep code clean and minimal; favor small, single-purpose, idempotent functions and composability. Game logic is found in `src/app.js`.
- All game logic functions must have corresponding test function(s); use test-driven development practices to write the test(s) first and then implement the logic code. Test code is found in `src/tests.js`

## Stack

- **Language:** Vanilla JavaScript (ES6+)
- **Markup:** HTML5
- **Styling:** CSS3
- **Libraries/Frameworks:** None for now. We are building this from scratch to keep it simple.

## MVP Vision

The goal of the MVP is to create the simplest possible, fully playable version of the game.

- **Players:** 2 human players on a single browser ("hot-seat" mode)
- **Interface:** Purely text-based: cards are represented by characters (e.g., A♥, 10♠, 3♦); the game state is displayed via simple text updates in the DOM
- **Gameplay:**
  - Deck is created, shuffled, and dealt
  - Players can see their hands
  - Players can select cards and attempt to play them
  - The game validates moves and rejects invalid ones
  - The game correctly identifies the winner of a round and the winner of the game

The source of truth: [Requirements](./.gemini/specs/requirements.md)

## Development Phases & Tasks

An ordered list of tasks: [Tasks](./.gemini/specs/tasks.md)
