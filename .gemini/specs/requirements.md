# Game Logic & Rules (Source of Truth)

This section defines the core rules that the game engine must follow.

## Card Ranking

- **Values:** `2` (high) > `A` > `K` > `Q` > `J` > `10` > `9` > `8` > `7` > `6` > `5` > `4` > `3` (low)
- **Suits:** Hearts (`♥`) > Diamonds (`♦`) > Clubs (`♣`) > Spades (`♠`)

## Starting Player

In every game, the player with the `3♠` starts. If the `3♠` is not in any player's hand, the player with the next lowest card (e.g. `3♣`, then `3♦`, then `3♥`, then `4♠`, and so on according to the card ranking details provided) starts.

## Valid Combinations

- `Single`: 1 card
- `Pair`: 2 cards of the same value
- `Triple`: 3 cards of the same value
- `Straight`: 3+ cards in sequence (`2` cannot be part of a `Straight`)
- `Consecutive Pairs`: 3 or 4 pairs in sequence (e.g. two `3`, two `4`, two `5`) - these are only valid as bombs

## Bombs

Bombs are special combinations that can beat `2` and can only be played on `2`:

- A single `2` is beaten by a **Four-of-a-Kind** or **Three Consecutive Pairs**
- A pair of `2`s is beaten by **Four Consecutive Pairs**

## Rounds

- When a player starts a round, they select any valid combination of cards to play
- The next player in sequence then takes their turn for the round
- All subsequent plays in the round must be of the same valid combination type that started the round, with a higher value (based on the highest card in the valid combination)
- If a player cannot or chooses not to play, they pass; once a player has passed, they are out for that round and cannot play again until the next round
- A round ends when one player makes a play, and every other player in sequence passes
- The winner of the round gets to start the next round

## Winning the game

- The player who first plays their final card in any round, wins the game
