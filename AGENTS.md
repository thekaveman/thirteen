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

## Branch Naming

Use a scope prefix that reflects the type of change:

| Pattern                | Use for                                     | Example                                    |
| ---------------------- | ------------------------------------------- | ------------------------------------------ |
| `fix/<scope>/xxx`      | Bug fixes or targeted fixes within a domain | `fix/responsive/visual-regression-testing` |
| `feat/<scope>/xxx`     | New features                                | `feat/game/ai-personas`                    |
| `refactor/<scope>/xxx` | Refactoring within a domain                 | `refactor/ui/card-rendering`               |
| `chore/<scope>/xxx`    | Infrastructure, tooling, tests, config      | `chore/visual-regression-tests`            |
| `ci/<scope>/xxx`       | CI/CD changes                               | `ci/run-responsive-tests`                  |

For scoped work (responsive, analytics, etc.), use `fix/<scope>/xxx` or `feat/<scope>/xxx`. For infrastructure/tooling that touches everything, use `chore/xxx` or `ci/xxx`.

## Epics and Child Issues

When work spans multiple files or phases, create a parent "Epic" issue and link child issues to it:

1. **Create the parent Epic first** — high-level overview, strategy, target breakpoints, links to children
2. **Create child issues linked with `--parent`** — each child should be independently deployable and close a specific concern
   ```bash
   gh issue create --title "UI Fix: specific change" --parent 55 --body "..."
   ```
3. **Link children to parent** — always use `--parent NUMBER`, never rely on "Ref: #XX" style cross-linking in the body
4. **Child issues should be self-contained** — each PR can close one or multiple child issues, but never deploy a broken or partial game
5. **PR body** — use `gh pr create --body-file body.md` (not `--body` with a filename). Do NOT include a "Commit History" section — GitHub shows commits automatically and it quickly goes stale.

## Commit Messages

Use proper newlines in commit messages, not literal `\n`:

```bash
# Wrong — literal \n characters in message
git commit -m "fix: do thing\n\nMore details here"

# Correct — actual newlines via heredoc
git commit -m "$(cat << 'EOF'
fix: do thing

More details here about what and why
EOF
)"

# Or use a file
git commit -F COMMIT_MSG.txt
```

Verify the message looks right with `git log -1 --format=medium`.

## Visual Regression Testing with Playwright

When making UI/responsive changes, add visual regression tests:

1. **Install Playwright** — `npm install --save-dev @playwright/test` then `npx playwright install chromium`
2. **Create `playwright.config.js`** — configure webServer, viewport sizes, trace/video on failure
3. **Write tests** in `tests/responsive/` — use `toHaveScreenshot()` for comparison
4. **Capture baselines** — `npm run test:responsive:update` to generate initial screenshots
5. **Commit baselines** — screenshots live next to the test file (`tests/responsive/responsive.test.js-snapshots/`)
6. **Add npm scripts** — `test:responsive` (CI, compares) and `test:responsive:update` (local, generates)
7. **Add to CI** — install browsers (`npx playwright install chromium`), build game, run tests

### CI Notes

- Use `npm run test:responsive` (not `npm test:responsive`)
- Use `npx playwright install chromium` — do NOT use `--with-deps` on GitHub Actions runners
- The `--with-deps` flag tries to install system packages and fails on CI
- Set `maxDiffPixelRatio: 0.05` to handle font anti-aliasing differences in headless Chrome

### Test Workflow

| Command                          | Purpose                      | When       |
| -------------------------------- | ---------------------------- | ---------- |
| `npm run test:responsive`        | Compare against baselines    | CI + local |
| `npm run test:responsive:update` | Generate/overwrite baselines | Local only |

## npm Scripts

Always use `npm run <script>`, not `npm <script>`:

```bash
# Wrong
npm test:responsive

# Correct
npm run test:responsive
```

## Running the Game

```bash
npm start        # Start dev server on port 8888
npm test         # Run mocha test suite
npm run test:responsive  # Run Playwright visual regression tests
```

## Development Workflow

This is how I should work for ALL changes:

1. **Read the issue** — Open the GitHub issue to understand scope and deliverables
2. **Create a branch** — Use the appropriate naming convention (see Branch Naming above)
3. **Make changes** — Implement the required changes
4. **Run tests** — `npm test` (must pass) + `npx tsc --noEmit` (if TypeScript is involved) + `npm run test:responsive` (if UI changes)
5. **Commit in small chunks** — Multiple small, logical commits (never one giant commit). Keep commits reviewable (~100-300 lines each). Follow conventional commits. Use proper newlines in commit messages.
6. **DO NOT PUSH** — Wait for user to review commits locally before pushing
7. **User reviews** — User inspects commits, asks for changes if needed
8. **User says "push"** — Only then push and create the PR
9. **PR review** — User reviews PR, may request changes
10. **User merges** — User merges the PR into main
11. **Pull main** — Fetch latest main, create new branch for next phase
12. **Repeat** — Go to step 1 for the next set of work

### Key Rules

- **NEVER push without explicit user permission**
- **NEVER make one giant commit** — split into logical, reviewable chunks
- **PR title format** — conventional commits (e.g., `feat(ts): <scope>`), no "TypeScript" if scope implies it, no "Phase N"
- **Always verify tests pass** before committing
- **NEVER delete, overwrite, or modify uncommitted files that you did not create.** This includes `.md`, `.txt`, `.plan`, or any other working files left by the user.
- Uncommitted files are user work and may contain critical plans, notes, or scratch work.
- If cleanup is needed, ask the user first. Never assume an untracked/uncommitted file is disposable.
