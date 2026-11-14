# Thirteen

This document outlines the development plan for a web-based version of the card game "Thirteen" (also known as Tiến Lên). The project follows a "vibe coding" philosophy, prioritizing a simple, functional Minimum Viable Product (MVP) and iterative development.

## Principles

- Start with the absolute basics. No graphics, no frameworks, just plain HTML, CSS, and JavaScript to create a text/Unicode-based card game
- Keep code clean and minimal; favor small, single-purpose, idempotent functions and composability. Game logic is found in `src/app/`.
- All game logic must have corresponding tests; use test-driven development practices to write the test(s) first and then implement the logic code. Test code is found in `tests/`

## Stack

- **Language:** Vanilla JavaScript (ES6+)
- **Markup:** HTML5
- **Styling:** CSS3
- **Libraries/Frameworks:** None for the game code. `mocha`, `chai`, and `sinon` are used for tests.
- **Dev server:** `http-server` (via `npm start`)
- **Testing:** `mocha` + `chai` + `sinon` + `nyc` (code coverage)

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

The source of truth: [Requirements](specs/requirements.md)

## Development Phases & Tasks

An ordered list of tasks: [Tasks](specs/tasks.md)

## Running the Game

```bash
npm start        # Start dev server on port 8888
npm test         # Run test suite
```

## Working with OpenCode Agents

- Always read `specs/tasks.md` first to understand what's done and what's next
- `specs/requirements.md` is the authoritative source for game rules — do not make assumptions
- `specs/wishlist.md` contains future ideas — do not implement these unless explicitly requested
- All code changes must have corresponding tests — TDD is a hard requirement
- Commit messages should follow conventional commits (enforced by pre-commit hooks)
- Before making changes, run `npm test` to verify the current state, and run again after changes

## File Safety Rules

- **NEVER delete, overwrite, or modify uncommitted files that you did not create.** This includes `.md`, `.txt`, `.plan`, or any other working files left by the user.
- Uncommitted files are user work and may contain critical plans, notes, or scratch work.
- If cleanup is needed, ask the user first. Never assume an untracked/uncommitted file is disposable.
