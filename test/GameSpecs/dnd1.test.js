/**
 * @jest-environment jsdom
 */

import dnd1 from '../../src/dnd1';
import Console from '../../src/Console';

let game;
jest.mock('../../src/Console');

describe("Game Functions", function() {
  describe("Calculate Player Protection", function() {
    beforeEach(function() {
      Console.mockClear();
      game = new dnd1();
      game.initialiseGlobals(new Console())
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.gameState.inventory = [];
      game.gameState.inventoryCounter = 0;
    });

    it("returns dexterity + 6 if no armour carried", function() {
      expect(game.calculatePlayerProtection()).toBe(6 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 8 if leather armour carried", function() {
      game.gameState.inventory[1] = 8;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(8 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 16 if chain armour carried", function() {
      game.gameState.inventory[1] = 9;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(16 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 20 if plate armour carried", function() {
      game.gameState.inventory[1] = 10;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(20 + game.gameState.attributes[2]);
    });
  });
});