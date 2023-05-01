/**
 * @jest-environment jsdom
 */

import dnd1 from '../../src/dnd1';
import Console from '../../src/Console';
import * as helper from '../../src/helper';

let game;
jest.mock('../../src/Console');

describe("Game Functions", () => {
  describe("Calculate Player Protection", () => {
    beforeEach(() => {
      game = new dnd1();
      game.initialiseGlobals(new Console())
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.gameState.inventory = [];
      game.gameState.inventoryCounter = 0;
    });

    it("returns dexterity + 6 if no armour carried", () => {
      expect(game.calculatePlayerProtection()).toBe(6 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 8 if leather armour carried", () => {
      game.gameState.inventory[1] = 8;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(8 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 16 if chain armour carried", () => {
      game.gameState.inventory[1] = 9;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(16 + game.gameState.attributes[2]);
    });

    it("returns dexterity + 20 if plate armour carried", () => {
      game.gameState.inventory[1] = 10;
      game.gameState.inventoryCounter = 1;
      expect(game.calculatePlayerProtection()).toBe(20 + game.gameState.attributes[2]);
    });
  });

  describe("Monster action live or die", () => {
    beforeEach(() => {
      game = new dnd1();
      game.initialiseGlobals(new Console())
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.gameState.currentMonster = 1;
      game.loadMonsters();
      game.gameStateMachine = {
        stateMode : 0
      };
    });

    it("detects dead monsters and routes to the killed routine", () => {
      game.gameState.monsterStats[game.gameState.currentMonster][3] = 0;
      game.monsterAction();
      expect(game.gameStateMachine.stateMode === 203).toBe(true);
    });

    it("routes active monsters to action logic", () => {
      const spy = jest.spyOn(game, 'monsterMovement').mockImplementation(() => { });
      game.monsterAction();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Monster position translation", () => {
    beforeEach(function() {
      game = new dnd1();
      game.initialiseGlobals(new Console())
      game.loadMonsters();
      game.gameState.F1=1;
      game.gameState.F2=1;
      game.gameState.dungeonMap[0] = [0,0,0];
      game.gameState.dungeonMap[1] = [0,5,0];
      game.gameState.dungeonMap[2] = [0,0,0];
    });

    it("moves monster from A to B", () => {
      jest.spyOn(game, 'findRange').mockImplementationOnce(() => {});
      game.translateMonsterPosition(1,0);
      expect(game.gameState.dungeonMap[1][1]).toBe(0);
      expect(game.gameState.dungeonMap[2][1]).toBe(5);
    });
  });

  describe("Resolve monster movement", () => {
    describe("Finds best direction of movement", () => {
      let spy;

      beforeEach(() => {
        game = new dnd1();
        game.initialiseGlobals(new Console())
        game.gameState.F1 = 1;
        game.gameState.F2 = 1;
        game.gameState.dungeonMap[0] = [0, 0, 0];
        game.gameState.dungeonMap[1] = [0, 5, 0];
        game.gameState.dungeonMap[2] = [0, 0, 0];
        game.mapX = 5;
        game.mapY = 12;
        spy = jest.spyOn(game, "translateMonsterPosition");
        jest.spyOn(game, 'findRange').mockImplementationOnce(() => {});
      });

      it("moves across row if vertical offset is larger", () => {
        game.rangeRowOffset = 2;
        game.rangeColumnOffset = 1;
        game.resolveMonsterMove();
        expect(spy).toHaveBeenCalled();
        expect(game.gameState.F1).toBe(0);
        expect(game.gameState.F2).toBe(1);
      });

      it("moves along row if horizontal offset is larger", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.resolveMonsterMove();
        expect(spy).toHaveBeenCalled();
        expect(game.gameState.F1).toBe(1);
        expect(game.gameState.F2).toBe(0);
      });

      it("moves towards the target if above", () => {
        game.rangeRowOffset = 2;
        game.rangeColumnOffset = 1;
        game.resolveMonsterMove();
        expect(game.gameState.F1).toBe(0);
        expect(game.gameState.F2).toBe(1);
      });

      it("moves towards the target if below", () => {
        game.rangeRowOffset = -2;
        game.rangeColumnOffset = 1;
        game.resolveMonsterMove();
        expect(game.gameState.F1).toBe(2);
        expect(game.gameState.F2).toBe(1);
      });

      it("moves towards the target if to left", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.resolveMonsterMove();
        expect(game.gameState.F1).toBe(1);
        expect(game.gameState.F2).toBe(0);
      });

      it("moves towards the target if to right", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.resolveMonsterMove();
        expect(game.gameState.F1).toBe(1);
        expect(game.gameState.F2).toBe(2);
      });
    });

    describe("Moves according to the target map cell", () => {
      let spyBounds;
      let spyRange;

      beforeEach(() => {
        jest.spyOn(Console.prototype, 'println').mockImplementationOnce(() => {});
        game = new dnd1();
        game.initialiseGlobals(new Console())
        game.gameState.F1 = 1;
        game.gameState.F2 = 1;
        game.gameState.dungeonMap[0] = [0,1,0,0];
        game.gameState.dungeonMap[1] = [0,5,2,0];
        game.loadMonsters();
        game.gameState.currentMonster = 1;
        spyBounds = jest.spyOn(game,"inBounds").mockImplementationOnce(() =>  { return true; });
        spyRange = jest.spyOn(game,"findRange").mockImplementationOnce(() => { });
      });

      it("kills the monster if it finds a trap", () => {
        // jest.spyOn(game, 'translateMonsterPosition').mockImplementationOnce(() => {});
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.resolveMonsterMove();
        expect(game.gameState.monsterStats[game.gameState.currentMonster][game.constants.monsterHp]).toBe(0);
      });

      it("moves through a secret door if is clear on the opposite side", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.gameState.dungeonMap[1][2] = 3;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][3]).toBe(5);
      });

      it("doesn't move through a secret door if is not clear on the opposite side", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.gameState.dungeonMap[1][2] = 3;
        game.gameState.dungeonMap[1][3] = 1;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(5);
        expect(game.gameState.dungeonMap[1][3]).toBe(1);
      });

      it("moves through a door if is clear on the opposite side", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.gameState.dungeonMap[1][2] = 4;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][3]).toBe(5);
      });

      it("doesn't move through a door if is not clear on the opposite side", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = -2;
        game.gameState.dungeonMap[1][2] = 4;
        game.gameState.dungeonMap[1][3] = 1;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(5);
        expect(game.gameState.dungeonMap[1][3]).toBe(1);
      });

      it("doesn't move into a wall", () => {
        game.rangeRowOffset = 2;
        game.rangeColumnOffset = 1;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(5);
        expect(game.gameState.dungeonMap[0][1]).toBe(1);
      });

      it("moves into open space", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][0]).toBe(5);
      });

      it("moves into treasure", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.gameState.dungeonMap[1][0] = 6;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][0]).toBe(5);
      });

      it("moves into a strength boost", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.gameState.dungeonMap[1][0] = 7;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][0]).toBe(5);
      });

      it("moves into a constitution boost", () => {
        game.rangeRowOffset = 1;
        game.rangeColumnOffset = 2;
        game.gameState.dungeonMap[1][0] = 8;
        game.resolveMonsterMove();
        expect(game.gameState.dungeonMap[1][1]).toBe(0);
        expect(game.gameState.dungeonMap[1][0]).toBe(5);
      });
    });

    describe("Routes control according to range", function() {
      beforeEach(function() {
        game.gameStateMachine = { stateMode : 0 };
      });

      it("calculates the range from player to monster", () => {
        const rangeSpy = jest.spyOn(game,"findRange").mockImplementationOnce(() => { game.range = 0; });
        game.monsterMovement();
        expect(rangeSpy).toHaveBeenCalled();
      });

      it("routes to attack if range < 2", () => {
        jest.spyOn(game,"findRange").mockImplementationOnce(() => { game.range = 0; });
        game.monsterMovement();
        expect(game.gameStateMachine.stateMode).toBe(207);
      });

      it("routes back to main loop if range >= 2 and P0 > 10", () => {
        jest.spyOn(game,"findRange").mockImplementationOnce(() => { game.range = 2; });
        game.P0 = 11;
        game.monsterMovement();
        expect(game.gameStateMachine.stateMode).toBe(25);
      });

      it("routes back to movement if range >= 2 and P0 <= 10", () => {
        jest.spyOn(game,"findRange").mockImplementationOnce(() => { game.range = 2; });
        const resolveMonsterMove = jest.spyOn(game,"resolveMonsterMove").mockImplementationOnce(() => {});
        game.P0 = 9;
        game.monsterMovement();
        expect(resolveMonsterMove).toHaveBeenCalled();
      });
    });
  });

  describe("Reset after clear", () => {
    beforeEach(() => {
      game.loadMonsters();
      for (let i=1; i<11; i++) {
        game.gameState.monsterStats[i][3] = 0;
        game.gameState.monsterStats[i][game.constants.monsterHp] = 0;
      }
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.difficultyFactor = 1;
      game.gameStateMachine = {
        stateMode: 0
      };
      // terminal = {};
      // terminal.println = function() {};
    });

    it("checks player input for a 'YES'", () => {
      game.inputString = "YES";
      game.resetAfterClear();
      expect(game.gameStateMachine.stateMode).toBe(25);
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(15);
      expect(game.difficultyFactor).toBe(2);
      for(let i=1; i<11; i++) {
        expect(game.gameState.monsterStats[i][3]).toBe(game.gameState.monsterStats[i][4] * game.difficultyFactor);
        expect(game.gameState.monsterStats[i][game.constants.monsterHp]).toBe(game.gameState.monsterStats[i][game.constants.monsterStartHp] * game.difficultyFactor);
      }
    });

    it("stops the game if input is not a 'YES'", () => {
      game.inputString = "";
      const print = jest.spyOn(Console.prototype,"println").mockImplementationOnce(() => {});
      game.resetAfterClear();
      expect(game.gameStateMachine.stateMode).toBe(30);
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(10);
      expect(game.difficultyFactor).toBe(1);
      for(let i=1; i<11; i++) {
        expect(game.gameState.monsterStats[i][3]).toBe(0);
        expect(game.gameState.monsterStats[i][game.constants.monsterHp]).toBe(0);
      }
      expect(print).toHaveBeenCalled();
    });
  });

  describe("Make a monster", function() {
    let randomResults = [];
    let randomFakeCounter;
    let rnd;
    let spawn;
    let bounds;

    beforeEach(function() {
      game.loadMonsters();
      game.defaultMap();
      game.gameState.currentMonster = 0;
      game.M = 1;
      game.mapX = 5;
      game.mapY = 4;
      game.gameState.F1 = -1;
      game.gameState.F2 = -1;
      rnd = jest.spyOn(helper,"rnd").mockImplementation(() =>{ return randomResults[randomFakeCounter++]; });
      spawn = jest.spyOn(game,"spawnMonsterAt");
      bounds = jest.spyOn(game,"inBounds");
      game.gameStateMachine = { stateMode : 0 };
      randomFakeCounter = 0;
    });

    it("populates currentMonster from M", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameState.currentMonster).toBe(1);
    });

    it("changes state mode to 200", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameStateMachine.stateMode).toBe(200);
    });

    it("uses helper function rnd to generate random numbers", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(rnd).toHaveBeenCalled();
    });

    it("uses spawnMonsterAt to safely generate the monster position", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(spawn).toHaveBeenCalled();
    });

    it("uses inbounds function to check validity of coordinates", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(bounds).toHaveBeenCalled();
    });

    it("populates the F1 and F2 global variables after the spawn completes", function() {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameState.F1).toBe(1);
      expect(game.gameState.F2).toBe(2);
    });

    it("safely completes if map data prevents successful spawn", function() {
      // generate random results correct for test - needs 11 failed attempts at scanning to trip fail safe
      randomResults = [
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8,
        0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.1, 0.8, 0.8, 0.8, 0.1, 0.1, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8
      ];
      let attempts = game.makeAMonster();
      expect(game.gameState.F1).toBe(-1);
      expect(game.gameState.F2).toBe(-1);
      expect(attempts).toBe(11);
    });
  });
});