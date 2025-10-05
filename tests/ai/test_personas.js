import { AI_PERSONAS } from "../../src/app/ai/personas.js";
import { AI, ComboAI } from "../../src/app/ai/index.js";
import { Deck, Game } from "../../src/app/game/index.js";

describe("Personas", () => {
  let game;

  beforeEach(() => {
    const deck = new Deck();
    game = new Game(deck);
  });

  for (const personaKey in AI_PERSONAS) {
    describe(`Persona: ${personaKey}`, () => {
      const persona = AI_PERSONAS[personaKey];

      it("should have a name and description", () => {
        expect(persona.name).to.be.a("string").and.not.be.empty;
        expect(persona.description).to.be.a("string").and.not.be.empty;
      });

      it("should have a create function that returns an AI instance", () => {
        const ai = persona.create(game);
        expect(ai).to.be.an.instanceOf(AI);
        expect(ai.game).to.equal(game);
      });

      if (persona.create(game) instanceof ComboAI) {
        it("should be a ComboAI with strategies", () => {
          const ai = persona.create(game);
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
