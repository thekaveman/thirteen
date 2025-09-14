# Thirteen

A web-based implementation of the card game Thirteen (Tiến Lên), built with vanilla JavaScript, HTML, and CSS.

## About the Game

Thirteen is a climbing card game where players try to be the first to play all their cards through a series of rounds. Players must play valid combinations that beat the previous play, or pass their turn.

### Card Rankings

- **Values:** 2 (highest) > A > K> Q > J > 10 > 9 > 8 > 7 > 6 > 5 > 4 > 3 (lowest)
- **Suits:** ♥ > ♦ > ♣ > ♠

### Valid Plays

- Single cards
- Pairs (two cards of same value)
- Triples (three cards of same value)
- Straights (3+ consecutive cards)
- Consecutive pairs (3 or 4 pairs in sequence)
- Special "bomb" combinations can beat 2s

## Getting Started

1. Clone the repository
1. Open in VS Code
1. In the `Run and Debug` window, select `Play game` and click `F5` to start
1. `src/index.html` opens in a web browser
1. Play against another person in "hot-seat" mode

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
