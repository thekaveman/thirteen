export class Player {
  /**
   * @param {string} type The type of player (human or ai).
   * @param {GameClient} gameClient The game client instance.
   * @param {number} number The player number in the underlying game.
   */
  constructor(type, gameClient, number) {
    this.type = type;
    this.gameClient = gameClient;
    this.number = number;
    this.id = crypto.randomUUID();
    this.persona = null;
  }

  data() {
    return { game: this.gameClient.getId(), id: this.id, number: this.number, persona: this.persona, type: this.type };
  }

  takeTurn() {
    throw new Error("Subclasses must implement takeTurn");
  }
}
