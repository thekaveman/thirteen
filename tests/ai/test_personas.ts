import { AI_PERSONAS } from "../../src/app/ai/personas.js";
import { AI, ComboAI } from "../../src/app/ai/index.js";
import { Deck, Game, GameClient } from "../../src/app/game/index.js";

describe("Personas", () => {
  let game, gameClient;

  beforeEach(() => {
    const deck = new Deck();
    game = new Game(deck);
    gameClient = new GameClient(game);
  });

  for (const personaKey in AI_PERSONAS) {
    describe(`Persona: ${personaKey}`, () => {
      const persona = AI_PERSONAS[personaKey];

      it("should have a name, friendly_name, and description", () => {
        expect(persona.name).to.equal(personaKey);
        expect(persona.friendly_name).to.be.a("string").and.not.be.empty;
        expect(persona.description).to.be.a("string").and.not.be.empty;
      });

      it("should have a create function that returns an AI instance", () => {
        const ai = persona.create(gameClient);
        expect(ai).to.be.an.instanceOf(AI);
        expect(ai.gameClient.game).to.equal(game);
      });

      if (persona.create(gameClient) instanceof ComboAI) {
        it("should be a ComboAI with strategies", () => {
          const ai = persona.create(gameClient);
          expect(ai).to.be.an.instanceOf(ComboAI);
          expect(ai.strategies).to.be.an("array").and.not.be.empty;
          ai.strategies.forEach((strategy) => {
            expect(strategy).to.be.an.instanceOf(AI);
          });
        });
      }
    });
  }
});
