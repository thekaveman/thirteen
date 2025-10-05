export class Player {
  /**
   * @param {string} type The type of player (human or ai).
   * @param {Game} game The game instance.
   */
  constructor(type, game, number) {
    this.type = type;
    this.game = game;
    this.number = number;
    this.id = crypto.randomUUID();
    this.persona = null;
  }

  data() {
    return { game: this.game.id, id: this.id, number: this.number, persona: this.persona, type: this.type };
  }

  takeTurn() {
    throw new Error("Subclasses must implement takeTurn");
  }
}
