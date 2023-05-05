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
        stateMode: 0
      };
    });

    it("detects dead monsters and routes to the killed routine", () => {
      game.gameState.monsterStats[game.gameState.currentMonster][3] = 0;
      game.monsterAction();
      expect(game.gameStateMachine.stateMode === 203).toBe(true);
    });

    it("routes active monsters to action logic", () => {
      const spy = jest.spyOn(game, 'monsterMovement').mockImplementation(() => {
      });
      game.monsterAction();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("Monster position translation", () => {
    beforeEach(function () {
      game = new dnd1();
      game.initialiseGlobals(new Console())
      game.loadMonsters();
      game.gameState.F1 = 1;
      game.gameState.F2 = 1;
      game.gameState.dungeonMap[0] = [0, 0, 0];
      game.gameState.dungeonMap[1] = [0, 5, 0];
      game.gameState.dungeonMap[2] = [0, 0, 0];
    });

    it("moves monster from A to B", () => {
      jest.spyOn(game, 'findRange').mockImplementationOnce(() => {
      });
      game.translateMonsterPosition(1, 0);
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
        jest.spyOn(game, 'findRange').mockImplementationOnce(() => {
        });
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
        jest.spyOn(Console.prototype, 'println').mockImplementationOnce(() => {
        });
        game = new dnd1();
        game.initialiseGlobals(new Console())
        game.gameState.F1 = 1;
        game.gameState.F2 = 1;
        game.gameState.dungeonMap[0] = [0, 1, 0, 0];
        game.gameState.dungeonMap[1] = [0, 5, 2, 0];
        game.loadMonsters();
        game.gameState.currentMonster = 1;
        spyBounds = jest.spyOn(game, "inBounds").mockImplementationOnce(() => {
          return true;
        });
        spyRange = jest.spyOn(game, "findRange").mockImplementationOnce(() => {
        });
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

    describe("Routes control according to range", function () {
      beforeEach(function () {
        game.gameStateMachine = {stateMode: 0};
      });

      it("calculates the range from player to monster", () => {
        const rangeSpy = jest.spyOn(game, "findRange").mockImplementationOnce(() => {
          game.range = 0;
        });
        game.monsterMovement();
        expect(rangeSpy).toHaveBeenCalled();
      });

      it("routes to attack if range < 2", () => {
        jest.spyOn(game, "findRange").mockImplementationOnce(() => {
          game.range = 0;
        });
        game.monsterMovement();
        expect(game.gameStateMachine.stateMode).toBe(207);
      });

      it("routes back to main loop if range >= 2 and P0 > 10", () => {
        jest.spyOn(game, "findRange").mockImplementationOnce(() => {
          game.range = 2;
        });
        game.P0 = 11;
        game.monsterMovement();
        expect(game.gameStateMachine.stateMode).toBe(25);
      });

      it("routes back to movement if range >= 2 and P0 <= 10", () => {
        jest.spyOn(game, "findRange").mockImplementationOnce(() => {
          game.range = 2;
        });
        const resolveMonsterMove = jest.spyOn(game, "resolveMonsterMove").mockImplementationOnce(() => {
        });
        game.P0 = 9;
        game.monsterMovement();
        expect(resolveMonsterMove).toHaveBeenCalled();
      });
    });
  });

  describe("Reset after clear", () => {
    beforeEach(() => {
      game.loadMonsters();
      for (let i = 1; i < 11; i++) {
        game.gameState.monsterStats[i][3] = 0;
        game.gameState.monsterStats[i][game.constants.monsterHp] = 0;
      }
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.difficultyFactor = 1;
      game.gameStateMachine = {
        stateMode: 0
      };
    });

    it("checks player input for a 'YES'", () => {
      game.inputString = "YES";
      game.resetAfterClear();
      expect(game.gameStateMachine.stateMode).toBe(25);
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(15);
      expect(game.difficultyFactor).toBe(2);
      for (let i = 1; i < 11; i++) {
        expect(game.gameState.monsterStats[i][3]).toBe(game.gameState.monsterStats[i][4] * game.difficultyFactor);
        expect(game.gameState.monsterStats[i][game.constants.monsterHp]).toBe(game.gameState.monsterStats[i][game.constants.monsterStartHp] * game.difficultyFactor);
      }
    });

    it("stops the game if input is not a 'YES'", () => {
      game.inputString = "";
      const print = jest.spyOn(Console.prototype, "println").mockImplementationOnce(() => {
      });
      game.resetAfterClear();
      expect(game.gameStateMachine.stateMode).toBe(30);
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(10);
      expect(game.difficultyFactor).toBe(1);
      for (let i = 1; i < 11; i++) {
        expect(game.gameState.monsterStats[i][3]).toBe(0);
        expect(game.gameState.monsterStats[i][game.constants.monsterHp]).toBe(0);
      }
      expect(print).toHaveBeenCalled();
    });
  });

  describe("Make a monster", () => {
    let randomResults = [];
    let randomFakeCounter;
    let rnd;
    let spawn;
    let bounds;

    beforeEach(() => {
      game.loadMonsters();
      game.defaultMap();
      game.gameState.currentMonster = 0;
      game.M = 1;
      game.mapX = 5;
      game.mapY = 4;
      game.gameState.F1 = -1;
      game.gameState.F2 = -1;
      rnd = jest.spyOn(helper, "rnd").mockImplementation(() => {
        return randomResults[randomFakeCounter++];
      });
      spawn = jest.spyOn(game, "spawnMonsterAt");
      bounds = jest.spyOn(game, "inBounds");
      game.gameStateMachine = {stateMode: 0};
      randomFakeCounter = 0;
    });

    it("populates currentMonster from M", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameState.currentMonster).toBe(1);
    });

    it("changes state mode to 200", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameStateMachine.stateMode).toBe(200);
    });

    it("uses helper function rnd to generate random numbers", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(rnd).toHaveBeenCalled();
    });

    it("uses spawnMonsterAt to safely generate the monster position", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(spawn).toHaveBeenCalled();
    });

    it("uses inbounds function to check validity of coordinates", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(bounds).toHaveBeenCalled();
    });

    it("populates the F1 and F2 global variables after the spawn completes", () => {
      randomResults = [0, 0.1];
      game.makeAMonster();
      expect(game.gameState.F1).toBe(1);
      expect(game.gameState.F2).toBe(2);
    });

    it("safely completes if map data prevents successful spawn", () => {
      // generate random results correct for test - needs 11 failed attempts at scanning to trip fail-safe
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

  describe("Spawn monster at", () => {
    beforeEach(() => {
      game.defaultMap();
      game.gameState.F1 = -1;
      game.gameState.F2 = -1;
    });

    it("sets the given map coordinates to 5", () => {
      game.spawnMonsterAt(1, 1);
      expect(game.gameState.dungeonMap[1][1]).toBe(5);
    });

    it("populates the global map coordinate variables for monster actions", () => {
      game.spawnMonsterAt(2, 1);
      expect(game.gameState.F1).toBe(2);
      expect(game.gameState.F2).toBe(1);
    });
  });

  describe("Confirmed kill", () => {
    let spy;

    beforeEach(() => {
      game.loadMonsters();
      game.gameState.F1 = -1;
      game.gameState.F2 = -1;
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.gameStateMachine = {
        stateMode: 0
      };
      game.terminal = {};
      game.terminal.println = () => {
      };
      game.gameState.currentMonster = 1;
      game.K1 = -1;
      spy = jest.spyOn(game.terminal, "println");
    });

    it("reports the kill to the terminal", () => {
      game.confirmedKill();
      expect(game.terminal.println).toHaveBeenCalledTimes(3);
    });

    it("gives the player a gold reward", () => {
      let initialGold = game.gameState.attributes[game.constants.playerGold];
      let reward = game.gameState.monsterStats[game.gameState.currentMonster][game.constants.monsterStartHp];
      game.confirmedKill();
      expect(game.gameState.attributes[game.constants.playerGold]).toBe(initialGold + reward);
    });

    it("clears the monster temporary data", () => {
      game.confirmedKill();
      expect(game.gameState.currentMonster).toBe(0);
      expect(game.K1).toBe(0);
      expect(game.gameState.F1).toBe(0);
      expect(game.gameState.F2).toBe(0);
    });

    it("resets the monster health and strength for a respawn if J6 = 1", () => {
      let targetMonster = game.gameState.currentMonster;
      game.J6 = 1;
      game.confirmedKill();
      expect(game.gameState.monsterStats[targetMonster][3]).toBe(game.gameState.monsterStats[targetMonster][4] * game.gameState.monsterStats[targetMonster][1]);
      expect(game.gameState.monsterStats[targetMonster][game.constants.monsterHp]).not.toBe(0);
    });

    it("sets monster health to 0 if J6 != 1", () => {
      let targetMonster = game.gameState.currentMonster;
      game.J6 = 0;
      game.confirmedKill();
      expect(game.gameState.monsterStats[targetMonster][game.constants.monsterHp]).toBe(0);
    });

    it("routes game state to 25", () => {
      game.confirmedKill();
      expect(game.gameStateMachine.stateMode).toBe(25);
    });
  });

  describe("Monster move", () => {
    let randomResults = [];
    let randomFakeCounter;

    let println;
    let print;
    let rndspy;
    let inputstr;

    beforeEach(() => {
      game.loadMonsters();
      game.gameStateMachine = {
        stateMode: 0
      };
      game.terminal = {};
      game.terminal.println = function () {
      };
      game.terminal.print = function () {
      };
      println = jest.spyOn(game.terminal, "println");
      print = jest.spyOn(game.terminal, "print");
      rndspy = jest.spyOn(helper, "rnd").mockImplementation(() => {
        return randomResults[randomFakeCounter++];
      });
      inputstr = jest.spyOn(game, "inputStr").mockImplementation(() => {
      });
      randomFakeCounter = 0;
    });

    it("routes game state to 205 if no monsters left to move (all dead)", () => {
      for (let i = 1; i < 11; i++) {
        game.gameState.monsterStats[i][game.constants.monsterHp] = 0;
      }
      game.monsterMove();
      expect(game.gameStateMachine.stateMode).toBe(205);
    });

    it("routes game state to 204 once a 'move' is identified", () => {
      randomResults = [0.95];
      game.monsterMove();
      expect(game.gameStateMachine.stateMode).toBe(204);
    });

    it("routes game state to 200 if no moves are identified", () => {
      for (let i = 0; i < 500; i++) {
        randomResults[i] = 0;
      }
      game.monsterMove();
      expect(game.gameStateMachine.stateMode).toBe(200);
    });

    it("asks the user if a reset is desired if all monsters are dead", () => {
      for (let i = 1; i < 11; i++) {
        game.gameState.monsterStats[i][game.constants.monsterHp] = 0;
      }
      game.monsterMove();
      expect(println).toHaveBeenCalled();
      expect(print).toHaveBeenCalled();
      expect(inputstr).toHaveBeenCalled();
    });

    it("uses rnd to generate random numbers for determining move", () => {
      randomResults = [9.5];
      game.monsterMove();
      expect(rndspy).toHaveBeenCalled();
    });

    it("stores the monster id moved in M", () => {
      randomResults = [0, 9.5];
      game.monsterMove();
      expect(game.M).toBe(2);
    });
  });

  describe("Got more equipment", () => {
    let randomResults = [];
    let randomFakeCounter;

    let println;
    let rndspy;

    beforeEach(() => {
      game.gameStateMachine = {
        stateMode: 0
      };
      game.terminal = {};
      game.terminal.println = function () {
      };
      println = jest.spyOn(game.terminal, "println");
      rndspy = jest.spyOn(helper, "rnd").mockImplementation(() => {
        return randomResults[randomFakeCounter++];
      });
      randomFakeCounter = 0;
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
    });

    it("checks user input for a 'YES' and routes to state 25 (shop) if true", () => {
      game.inputString = "YES";
      game.gotMoreEquipment();
      expect(game.gameStateMachine.stateMode).toBe(18);
    });

    it("gifts the player 2 hp if a 'YES' and informs the player", () => {
      game.inputString = "YES";
      game.gotMoreEquipment();
      expect(println).toHaveBeenCalled();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(12);
    });

    it("runs a 50% chance to move a monster if user input is not a 'YES'", () => {
      game.inputString = "NO";
      randomResults = [20];
      game.gotMoreEquipment();
      expect(game.gameStateMachine.stateMode).toBe(202);
    });

    it("routes to the main loop if all other tests are false", () => {
      game.inputString = "NO";
      randomResults = [0];
      game.gotMoreEquipment();
      expect(game.gameStateMachine.stateMode).toBe(25);
    });
  });

  describe("check for clone move", () => {
    let randomResults = [];
    let randomFakeCounter;

    let rndspy;

    beforeEach(() => {
      game.gameStateMachine = {
        stateMode: 0
      };
      rndspy = jest.spyOn(helper, "rnd").mockImplementation(() => {
        return randomResults[randomFakeCounter++];
      });
      randomFakeCounter = 0;
    });

    it("uses rnd to generate random numbers for determining move", () => {
      randomResults = [20];
      game.testForCloneMove();
      expect(rndspy).toHaveBeenCalled();
    });

    it("sets state to 25 (main loop) on 50%", () => {
      randomResults = [10];
      game.testForCloneMove();
      expect(game.gameStateMachine.stateMode).toBe(25);
    });

    it("sets state to 202 (clone move) on other 50%", () => {
      randomResults = [11];
      game.testForCloneMove();
      expect(game.gameStateMachine.stateMode).toBe(202);
    });
  });

  describe("Check Player Health", () => {
    let println;

    beforeEach(function () {
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.terminal = {
        lastInput: ""
      };
      game.terminal.println = (value) => {
        game.terminal.lastInput = value;
      };
      game.gameStateMachine = {
        stateMode: 1
      };
      println = jest.spyOn(game.terminal, "println");
    });

    it("checks HP to see if it is 2 or over and does nothing if true", () => {
      game.gameState.attributes[game.constants.playerHp] = 2;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(2);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(10);
      expect(println).not.toHaveBeenCalled();
    });

    it("checks if HP is 1 and warns player if true", () => {
      game.gameState.attributes[game.constants.playerHp] = 1;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(1);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(10);
      expect(println).toHaveBeenCalled();
      expect(game.terminal.lastInput).toBe("WATCH IT H.P.=1");
    });

    it("checks if HP is 0 and kills player if Con is less than 9", () => {
      game.gameState.attributes[game.constants.playerHp] = 0;
      game.gameState.attributes[game.constants.playerCon] = 8;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(0);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(8);
      expect(println).toHaveBeenCalled();
      expect(game.terminal.lastInput).toBe("SORRY YOU'RE DEAD");
      expect(game.gameStateMachine.stateMode).toBe(30);
    });

    it("checks if HP is 0 and warns player if Con is 9 or more", () => {
      game.gameState.attributes[game.constants.playerHp] = 0;
      game.gameState.attributes[game.constants.playerCon] = 9;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(0);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(9);
      expect(println).toHaveBeenCalled();
      expect(game.terminal.lastInput).toBe("H.P.=0 BUT CONST. HOLDS");
    });

    it("checks if HP is less than 0 and transfers Con to HP (2:1) until HP is 0 and Con is 9 or more then warns player", () => {
      game.gameState.attributes[game.constants.playerHp] = -2;
      game.gameState.attributes[game.constants.playerCon] = 14;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(0);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(10);
      expect(println).toHaveBeenCalled();
      expect(game.terminal.lastInput).toBe("H.P.=0 BUT CONST. HOLDS");
    });

    it("checks if HP is less than 0 and transfers Con to HP (2:1) until HP is less than 0 and Con is less than 9 then kills player", () => {
      game.gameState.attributes[game.constants.playerHp] = -3;
      game.gameState.attributes[game.constants.playerCon] = 12;
      game.checkPlayerHealth();
      expect(game.gameState.attributes[game.constants.playerHp]).toBe(0);
      expect(game.gameState.attributes[game.constants.playerCon]).toBe(0);
      expect(println).toHaveBeenCalled();
      expect(game.terminal.lastInput).toBe("SORRY YOU'RE DEAD");
      expect(game.gameStateMachine.stateMode).toBe(30);
    });
  });

  describe("Route Game Move", () => {
    let println;
    let health;
    let move;

    beforeEach(() => {
      game.K1 = 0;
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.terminal = {
        lastInput: ""
      };
      game.terminal.println = (value) => {
        game.terminal.lastInput = value;
      };
      game.gameStateMachine = {
        stateMode: 1,
        waitTransition: false
      };
      println = jest.spyOn(game.terminal, "println");
      health = jest.spyOn(game, "checkPlayerHealth");
      move = jest.spyOn(game, "testForCloneMove").mockImplementation(() => {
        game.gameStateMachine.stateMode = 25;
      });
    });

    it("checks for a kill", () => {
      game.K1 = -1;
      game.routeGameMove();
      expect(game.gameStateMachine.stateMode).toBe(203);
    });

    it("checks if not a kill then check player is dead", () => {
      game.gameState.attributes[game.constants.playerHp] = -1;
      game.gameState.attributes[game.constants.playerCon] = 8;
      game.routeGameMove();
      expect(game.gameStateMachine.stateMode).toBe(30);
      expect(health).toHaveBeenCalled();
    });

    it("checks if a monster is waiting to move", () => {
      game.gameState.currentMonster = 1;
      game.routeGameMove();
      expect(game.gameStateMachine.stateMode).toBe(206);
    });

    it("checks if player is at the starting position and offers to shop if gold >= 100", () => {
      game.gameState.currentMonster = 0;
      game.mapY = 1;
      game.mapX = 12;
      jest.spyOn(game, "inputStr").mockImplementation(() => {
        game.gameStateMachine.waitTransition = true;
      });
      game.routeGameMove();
      expect(game.gameStateMachine.stateMode).toBe(201);
      expect(game.gameState.attributes[game.constants.playerGold]).toBe(900);
      expect(game.gameStateMachine.waitTransition).toBe(true);
      expect(game.terminal.lastInput).toBe("WANT TO BUY MORE EQUIPMENT");
    });

    it("checks if player is at the starting position and welcomes if gold < 100 and hands off to main routine", () => {
      game.gameState.currentMonster = 0;
      game.mapY = 1;
      game.mapX = 12;
      game.gameState.attributes[game.constants.playerGold] = 99;
      game.routeGameMove();
      expect(move).toHaveBeenCalled();
      expect(game.gameState.attributes[game.constants.playerGold]).toBe(99);
      expect(game.terminal.lastInput).toBe("SO YOU HAVE RETURNED");
      expect(game.gameStateMachine.stateMode).not.toBe(0);
    });

    it("checks the player is not at the starting position and hands off to main routine", () => {
      game.gameState.currentMonster = 0;
      game.mapY = 2;
      game.mapX = 12;
      game.routeGameMove();
      expect(move).toHaveBeenCalled();
      expect(game.gameStateMachine.stateMode).not.toBe(0);
    });
  })

  describe("Modify Map Process", () => {
    describe("Modify Map Save", () => {
      let cookie;

      beforeEach(() => {
        game.defaultMap();
        game.gameStateMachine = {
          stateMode: 1
        };
        game.cookieLifespan = 2000;
        cookie = jest.spyOn(helper, "setCookie").mockImplementation(() => {});
      });

      afterEach(() => {
        jest.clearAllMocks();
      });

      it("checks player input to confirm save (1) and writes to cookie", () => {
        game.inputString = "1";
        game.gameState.Dn = 1;
        game.modifyMapSave();
        expect(cookie).toHaveBeenCalledTimes(26);
        expect(cookie).toHaveBeenNthCalledWith(1, Document, "dnd1file1.dungeonMap.0", "1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|1|", 2000);
        expect(game.gameStateMachine.stateMode).toBe(200);
      });

      it("checks player input to confirm save (0)", () => {
        game.inputString = "0";
        game.gameState.Dn = 1;
        game.modifyMapSave();
        expect(cookie).not.toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(200);
      });
    });

    describe("Modify Map Done", () => {
      let cookie;
      let println;
      let input;

      beforeEach(() => {
        game.terminal = {
          lastInput : ""
        };
        game.terminal.println = (value) => { game.terminal.lastInput = value; };
        game.gameStateMachine = {
          stateMode : 1,
          waitTransition : false
        };
        game.defaultMap();
        cookie = jest.spyOn(helper,"setCookie").mockImplementation(() => {});
        println = jest.spyOn(game.terminal,"println");
        input = jest.spyOn(game,"input").mockImplementation(() => { game.gameStateMachine.waitTransition = true; });
      });

      it("accepts player input x,y,content and modifies map", () => {
        game.inputStrings[2] = "1";
        game.inputStrings[1] = "2";
        game.inputStrings[0] = "5";
        game.modifyMapDone();
        expect(game.gameState.dungeonMap[2][1]).toBe(5);
        expect(input).not.toHaveBeenCalled();
        expect(println).not.toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(103);
      });

      it("treats a negative content value as an instruction to stop", () => {
        game.inputStrings[2] = "1";
        game.inputStrings[1] = "2";
        game.inputStrings[0] = "-5";
        game.modifyMapDone();
        expect(input).toHaveBeenCalled();
        expect(game.gameState.dungeonMap[2][1]).toBe(0);
        expect(println).toHaveBeenCalled();
        expect(game.terminal.lastInput).toBe("SAVE");
        expect(game.gameStateMachine.stateMode).toBe(105);
      });
    });

    describe("Modify Got Map", () => {
      beforeEach(() => {
        game.gameStateMachine = {
          stateMode : 1
        };
      });

      it("converts user input into dungeon number", () => {
        game.gameState.Dn = 0;
        game.inputString = "1";
        game.modifyGotMap();
        expect(game.gameState.Dn).toBe(1);
        expect(game.gameStateMachine.stateMode).toBe(103);
      });
    });

    describe("Modify Map", () => {
      let print;
      let input;

      beforeEach(() => {
        game.terminal = {
          lastInput : ""
        };
        game.terminal.print = function(value) { game.terminal.lastInput = value; };
        game.gameStateMachine = {
          stateMode : 1,
          waitTransition : false
        };
        print = jest.spyOn(game.terminal,"print");
        input = jest.spyOn(game,"input").mockImplementation(() => { game.gameStateMachine.waitTransition = true; })
      });

      it("prompts the user for a dungeon number", () => {
        game.modifyMap();
        expect(print).toHaveBeenCalledWith("DNG");
        expect(input).toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(102.5);
      });
    });
  });

  describe("Buy Health", () => {
    let println;
    let print;
    let input;

    beforeEach(() => {
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.terminal = {
        lastInput : ""
      };
      game.terminal.println = (value) => { game.terminal.lastInput = value; };
      game.terminal.print = (value) => { game.terminal.lastInput = value; };
      game.gameStateMachine = {
        stateMode : 1,
        waitTransition : false
      };
      println = jest.spyOn(game.terminal,"println");
      print = jest.spyOn(game.terminal,"print");
      input = jest.spyOn(game,"input").mockImplementation(() => {});
    });

    describe("Add HP", () => {
      it("accepts player input and converts gold to health if enough gold is carried and reports result", () => {
        game.inputString = "4";
        game.addHP();
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(200);
        expect(game.gameState.attributes[game.constants.playerHp]).toBe(14);
        expect(game.gameStateMachine.stateMode).toBe(200);
        expect(println).toHaveBeenCalledTimes(9);
      });

      it("rejects player input if insufficient gold carried", () => {
        game.inputString = "6";
        game.addHP();
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(1000);
        expect(game.gameState.attributes[game.constants.playerHp]).toBe(10);
        expect(game.gameStateMachine.stateMode).toBe(100);
        expect(println).toHaveBeenCalledTimes(1);
      });
    });

    describe("Buy HP", () => {
      it("prompts the user for quantity of hp to buy", () => {
        game.buyHP();
        expect(input).toHaveBeenCalled();
        expect(print).toHaveBeenCalledWith("HOW MANY 200 GP. EACH ");
        expect(game.gameStateMachine.stateMode).toBe(101);
      });
    });
  });

  describe("Show Cheat Map", () => {
    let println;

    beforeEach(() => {
      game.terminal = {
        lastInput : ""
      };
      game.terminal.println = (value) => { game.terminal.lastInput = value; };
      game.gameStateMachine = {
        stateMode : 1,
        waitTransition : false
      };
      game.defaultMap();
      println = jest.spyOn(game.terminal,"println");
    });

    it("displays the entire map to the player", () => {
      game.showCheatMap();
      expect(println).toHaveBeenCalledTimes(26);
      expect(game.gameStateMachine.stateMode).toBe(25);
    });
  });

  describe("Purchase Magic (Cleric & Wizard)", () => {
    let println;
    let print;
    let inputStr;
    let input;

    beforeEach(() => {
      game.gameState.attributes = [10, 10, 10, 10, 10, 10, 10, 1000];
      game.gameState.attributeNames = [];
      game.terminal = {
        lastInput : ""
      };
      game.terminal.println = (value) => { game.terminal.lastInput = value; };
      game.terminal.print = (value) => { game.terminal.lastInput = value; };
      game.gameStateMachine = {
        stateMode : 1,
        waitTransition : false
      };
      game.gameState.clearClericSpellbook();
      game.gameState.clearWizardSpellbook();
      game.gameState.clericSpellPrices = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
      game.gameState.wizardSpellPrices = [0, 75, 500, 200, 750, 600, 100, 200, 300, 200, 600];
      println = jest.spyOn(game.terminal,"println");
      print = jest.spyOn(game.terminal,"print");
      inputStr = jest.spyOn(game,"inputStr").mockImplementation(() => {});
      input = jest.spyOn(game,"input").mockImplementation(() => {});
    });

    describe("Buy Magic Prompt", () => {
      it("rejects non-MU", () => {
        game.gameState.attributeNames[game.constants.playerClass] = "FIGHTER";
        game.buyMagic();
        expect(println).toHaveBeenCalledWith("YOU CAN'T BUY ANY");
        expect(game.gameStateMachine.stateMode).toBe(25);
      });

      it("accepts cleric class", () => {
        game.gameState.attributeNames[game.constants.playerClass] = "CLERIC";
        game.buyMagic();
        expect(println).not.toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(93);
      });

      it("accepts wizard class", () => {
        game.gameState.attributeNames[game.constants.playerClass] = "WIZARD";
        game.buyMagic();
        expect(println).not.toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(94);
      });
    });

    describe("Ask A Cleric", () => {
      it("prompts the user if the list of spell choices is known", () => {
        game.askACleric();
        expect(println).toHaveBeenCalledWith("DO YOU KNOW THE CHOICES");
        expect(inputStr).toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(95);
      });
    });

    describe("Ask A Wizard", () => {
      it("prompts the user if the list of spell choices is known", () => {
        game.askAWizard();
        expect(println).toHaveBeenCalledWith("DO YOU KNOW THE SPELLS");
        expect(inputStr).toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(96);
      });
    });

    describe("Cleric Spell Choices", () => {
      it("routes to the input response for cleric spell choices", () => {
        game.inputString = "";
        game.clericSpellChoices();
        expect(input).toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(97);
      });

      it("if the user inputs 'NO' the list of spells is shown", () => {
        game.inputString = "NO";
        game.clericSpellChoices();
        expect(println).toHaveBeenCalledTimes(4);
        expect(print).toHaveBeenCalledTimes(1);
      });

      it("if the user doesn't input 'NO' the list of spells is skipped", () => {
        game.inputString = "YES";
        game.clericSpellChoices();
        expect(println).not.toHaveBeenCalled();
        expect(print).not.toHaveBeenCalled();
      });
    });

    describe("Wizard Spell Choices", () => {
      it("routes to the input response for wizard spell choices", () => {
        game.inputString = "";
        game.wizardSpellChoices();
        expect(input).toHaveBeenCalled();
        expect(game.gameStateMachine.stateMode).toBe(98);
      });

      it("if the user inputs 'NO' the list of spells is shown", () => {
        game.inputString = "NO";
        game.wizardSpellChoices();
        expect(println).toHaveBeenCalledTimes(5);
        expect(print).toHaveBeenCalledTimes(1);
      });

      it("if the user doesn't input 'NO' the list of spells is skipped", () => {
        game.inputString = "YES";
        game.wizardSpellChoices();
        expect(println).not.toHaveBeenCalled();
        expect(print).not.toHaveBeenCalled();
      });
    });

    describe("Purchase Cleric Spell", () => {
      it("checks input for a negative number and lists spellbook and exits purchase if true", () => {
        game.Q = -1;
        game.gameState.addClericSpell("A");
        game.gameState.addClericSpell("B");
        game.gameState.addClericSpell("C");
        game.clericSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(25);
        expect(println).toHaveBeenCalledWith("YOUR SPELLS ARE");
        expect(println).toHaveBeenCalledTimes(5);
      });

      it("checks input for the upper positive limit and if true skips input and repeats", () => {
        game.Q = 9;
        game.clericSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(97);
        expect(input).toHaveBeenCalled();
        expect(println).not.toHaveBeenCalled();
      });

      it("adds the chosen spell if enough gold is carried", () => {
        game.Q = 4;
        game.clericSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(97);
        expect(input).toHaveBeenCalled();
        expect(println).toHaveBeenCalledWith("IT IS YOURS");
        expect(game.gameState.clericSpellCounter).toBe(1);
        expect(game.gameState.clericSpellbook[1]).toBe(4);
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(800);
      });

      it("warns player if insufficient gold is carried", () => {
        game.Q = 4;
        game.gameState.attributes[game.constants.playerGold] = 0;
        game.clericSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(97);
        expect(input).toHaveBeenCalled();
        expect(println).toHaveBeenCalledWith("COSTS TOO MUCH");
        expect(game.gameState.clericSpellCounter).toBe(0);
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(0);
      });
    });

    describe("Purchase Wizard Spell", () => {
      it("checks input for a negative number and lists spellbook and exits purchase if true", () => {
        game.Q = -1;
        game.gameState.addWizardSpell("A");
        game.gameState.addWizardSpell("B");
        game.gameState.addWizardSpell("C");
        game.wizardSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(25);
        expect(println).toHaveBeenCalledWith("YOU NOW HAVE");
        expect(println).toHaveBeenCalledTimes(4);
      });

      it("checks input for the upper positive limit and if true skips input and repeats", () => {
        game.Q = 11;
        game.wizardSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(98);
        expect(input).toHaveBeenCalled();
        expect(println).not.toHaveBeenCalled();
      });

      it("adds the chosen spell if enough gold is carried", () => {
        game.Q = 4;
        game.wizardSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(98);
        expect(input).toHaveBeenCalled();
        expect(println).toHaveBeenCalledWith("IT IS YOURS");
        expect(game.gameState.wizardSpellCounter).toBe(1);
        expect(game.gameState.wizardSpellbook[1]).toBe(4);
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(250);
      });

      it("warns player if insufficient gold is carried", () => {
        game.Q = 4;
        game.gameState.attributes[game.constants.playerGold] = 0;
        game.wizardSpellPurchase();
        expect(game.gameStateMachine.stateMode).toBe(98);
        expect(input).toHaveBeenCalled();
        expect(println).toHaveBeenCalledWith("COSTS TOO MUCH");
        expect(game.gameState.wizardSpellCounter).toBe(0);
        expect(game.gameState.attributes[game.constants.playerGold]).toBe(0);
      });
    });
  });

  describe("Casting Spells (Cleric & Wizard)", () => {
    let randomResults = [];
    let randomCounter;
    let println;
    let print;
    let input;
    let inputStr;
    let inputX;
    let rndSpy;
    let inBounds;

    beforeAll(() => {
      game = new dnd1();
      game.initialiseGlobals({
        lastInput: "",
        println: (value) => {
          game.terminal.lastInput = value;
        },
        print: (value) => {
          game.terminal.lastInput = value;
        }
      });
      game.defaultMap();
    });

    beforeEach(() => {
      game.gameStateMachine = {
        stateMode : 1,
        waitTransition : false
      };
      game.gameState.currentWeaponIndex = 0;
      randomCounter = 0;
      println = jest.spyOn(game.terminal,"println");
      print = jest.spyOn(game.terminal,"print");
      input = jest.spyOn(game,"input").mockImplementation(() => {});
      inputStr = jest.spyOn(game,"inputStr").mockImplementation(() => {});
      inputX = jest.spyOn(game, "inputX").mockImplementation(() => {});
      rndSpy = jest.spyOn(helper, "rnd").mockImplementation(() => { return randomResults[randomCounter++]; });
      inBounds = jest.spyOn(game, "inBounds");
    });

    describe("Validate Casting Action Choice", () => {
      it("checks that a weapon isn't equipped", () => {
        game.gameState.currentWeaponIndex = 1;
        game.casting();
        expect(game.gameStateMachine.stateMode).toBe(200);
        expect(println).toHaveBeenCalledWith("YOU CAN'T USE MAGIC WITH WEAPON IN HAND");
      });

      it("checks that the player is not a magic user", () => {
        game.attributeNames[game.constants.playerClass] = "FIGHTER";
        game.casting();
        expect(game.gameStateMachine.stateMode).toBe(200);
        expect(println).toHaveBeenCalledWith("YOU CAN'T USE MAGIC YOUR NOT A M.U.");
      });

      it("checks that the player is a wizard", () => {
        game.attributeNames[game.constants.playerClass] = "WIZARD";
        game.casting();
        expect(game.gameStateMachine.stateMode).toBe(87);
        expect(print).toHaveBeenCalledWith("SPELL #");
        expect(input).toHaveBeenCalled();
      });

      it("checks that the player is a cleric", () => {
        game.attributeNames[game.constants.playerClass] = "CLERIC";
        game.casting();
        expect(game.gameStateMachine.stateMode).toBe(78);
        expect(print).toHaveBeenCalledWith("CLERICAL SPELL #");
        expect(input).toHaveBeenCalled();
      });
    });

    describe("Wizard Spell Casting", () => {
      beforeEach(() => {
        game.gameState.clearWizardSpellbook();
        for (let i = 0; i < 11; ++i)
          game.gameState.addWizardSpell(i);
        game.mapX = 5;
        game.mapY = 5;
      });

      describe("Route Spell Choice", () => {
        it("accepts user input and checks it is a valid spell choice, warns user if not", () => {
          game.gameState.wizardSpellbook[5] = 0;
          game.inputString = "5";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(25);
          expect(println).toHaveBeenCalledWith("YOU DON'T HAVE THAT ONE");
        });

        it("accepts PUSH(1) spell and skips input if range is 0", () => {
          game.inputString = "1";
          game.gameState.F1 = mapY;
          game.gameState.F2 = mapX;
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(73);
          expect(game.S).toBe(0);
          expect(game.T).toBe(0);
          expect(game.Z5).toBe(1);
          expect(game.inputString).toBe("");
          expect(println).not.toHaveBeenCalled();
        });

        it("accepts PUSH(1) spell and prompts user for further input if range > 0", () => {
          game.inputString = "1";
          game.gameState.F1 = 1;
          game.gameState.F2 = 1;
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(73);
          expect(println).toHaveBeenCalledWith("ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
          expect(inputStr).toHaveBeenCalled();
        });

        it("accepts KILL(2) and routes to function", () => {
          game.inputString = "2";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(88);
        });

        it("accepts FIND TRAPS(3) and routes to function", () => {
          game.inputString = "3";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(89);
          expect(game.Q).toBe(2);
        });

        it("accepts TELEPORT(4) and routes to function", () => {
          game.inputString = "4";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(90);
          expect(game.Q).toBe(2);
        });

        it("accepts CHANGE(5) and routes to function", () => {
          game.inputString = "5";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(91.5);
          expect(game.Q).toBe(0);
        });

        it("accepts MAG.MISS 1(6) and routes to equivalent cleric function", () => {
          game.inputString = "6";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(83);
          expect(game.Q).toBe(3);
        });

        it("accepts MAG.MISS 2(7) and routes to equivalent cleric function", () => {
          game.inputString = "7";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(80);
          expect(game.Q).toBe(6);
        });

        it("accepts MAG.MISS 3(8) and routes to equivalent cleric function", () => {
          game.inputString = "8";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(84);
          expect(game.Q).toBe(9);
        });

        it("accepts FIND SECRET DOORS (9) and routes to function", () => {
          game.inputString = "9";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(89);
          expect(game.Q).toBe(3);
        });

        it("accepts CHANGE(10) and routes to function", () => {
          game.inputString = "10";
          game.gotWizardSpell();
          expect(game.gameStateMachine.stateMode).toBe(91.5);
          expect(game.Q).toBe(1);
        });
      });

      describe("KILL spell", () => {
        it("fails on the first 33% chance", () => {
          randomResults = [ 1 ];
          game.wizardSpellKill();
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(rndSpy).toHaveBeenCalled();
          expect(println).toHaveBeenCalledWith("FAILED");
        });

        it("succeeds on the upper 66% chance", () => {
          game.randomResults = [ 1.1 ];
          game.wizardSpellKill();
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(rndSpy).toHaveBeenCalled();
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.K1).toBe(-1);
        });
      });

      describe("FIND TRAPS spell", () => {
        it("identifies any traps within a 7x7 area centred on the player", () => {
          game.Q = 2;
          game.wizardSpellFindTrap();
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 3LAT.6LONG.");
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(println).toHaveBeenCalledWith("NO MORE");
          expect(inBounds).toHaveBeenCalled();
        });
      });

      describe("TELEPORT spell", () => {
        it("prompts user for a target location on map", () => {
          game.wizardSpellTeleport();
          expect(inputX).toHaveBeenCalled();
          expect(print).toHaveBeenCalledWith("INPUT CO-ORDINATES");
          expect(game.gameStateMachine.stateMode).toBe(91);
        });

        it("accepts user input for a target location on map and moves the player to that point if in bounds", () => {
          game.inputStrings = ["6", "7"];
          game.gotTeleportCoordinates();
          expect(mapX).toBe(6);
          expect(mapY).toBe(7);
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });

        it("accepts user input for a target location on map and blocks the move if not in bounds", () => {
          game.inputStrings = ["6", "27"];
          game.gotTeleportCoordinates();
          expect(mapX).toBe(5);
          expect(mapY).toBe(5);
          expect(println).toHaveBeenCalledWith("FAILED");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("CHANGE spell", () => {
        it("prompts the user for map coordinates", () => {
          game.gotSpellChange();
          expect(inputX).toHaveBeenCalled();
          expect(print).toHaveBeenCalledWith("INPUT CO-ORDINATES");
          expect(game.gameStateMachine.stateMode).toBe(91.6);
        });

        it("rejects map coordinates outside the bounds of the map", () => {
          game.inputStrings = ["28", "1"];
          game.gotChangeCoordinates();
          expect(println).toHaveBeenCalledWith("FAILED");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });

        it("converts a map cell from a wall to open space", () => {
          game.Q = 0;
          game.inputStrings = ["6", "6"];
          game.gotChangeCoordinates();
          expect(game.gameState.dungeonMap[6][6]).toBe(0);
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });

        it("fails to convert anything but wall to open space", () => {
          game.Q = 0;
          game.inputStrings = ["8", "1"];
          game.gotChangeCoordinates();
          expect(game.gameState.dungeonMap[1][8]).toBe(4);
          expect(println).toHaveBeenCalledWith("FAILED");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });

        it("converts a map cell from open space to a wall", () => {
          game.Q = 1;
          game.inputStrings = ["5", "6"];
          game.gotChangeCoordinates();
          expect(game.gameState.dungeonMap[6][5]).toBe(1);
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });

        it("fails to convert anything but open space to wall", () => {
          game.Q = 1;
          game.inputStrings = ["8", "1"];
          game.gotChangeCoordinates();
          expect(game.gameState.dungeonMap[1][8]).toBe(4);
          expect(println).toHaveBeenCalledWith("FAILED");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("FIND SECRET DOORS spell", () => {
        it("identifies any secret doors within a 7x7 area centred on the player", () => {
          game.Q = 3;
          game.wizardSpellFindTrap();
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 4LAT.3LONG.");
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 8LAT.4LONG.");
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(println).toHaveBeenCalledWith("NO MORE");
          expect(inBounds).toHaveBeenCalled();
        });
      });
    });

    describe("Cleric Spell Casting", () => {
      beforeEach(() => {
        game.gameState.clearClericSpellbook();
        for (let i = 1; i < 10; ++i)
          game.gameState.addClericSpell(i);
        game.mapX = 5;
        game.mapY = 5;
        game.loadMonsters();
      });

      describe("Route Spell Choice", () => {
        it("accepts user input and checks it is a valid spell choice, warns user if not", () => {
          game.gameState.clericSpellbook[5] = 0;
          game.inputString = "5";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(println).toHaveBeenCalledWith("YOU DON'T HAVE THAT SPELL");
        });

        it("accepts KILL(1) and routes to function", () => {
          game.inputString = "1";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(79);
        });

        it("accepts MAG.MISS 2(2) and routes to function", () => {
          game.inputString = "2";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(80);
        });

        it("accepts CURE LIGHT WOUNDS(3) and routes to function", () => {
          game.inputString = "3";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(81);
        });

        it("accepts FIND TRAPS(4) and routes to function", () => {
          game.inputString = "4";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(82);
          expect(game.Q).toBe(2);
        });

        it("accepts MAG.MISS 1(5) and routes to function", () => {
          game.inputString = "5";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(83);
        });

        it("accepts MAG.MISS 3(6) and routes to function", () => {
          game.inputString = "6";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(84);
        });

        it("accepts CURE LIGHT WOUNDS 2(7) and routes to function", () => {
          game.inputString = "7";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(85);
        });

        it("accepts FIND SECRET DOORS(8) and routes to function", () => {
          game.inputString = "8";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(82);
          expect(game.Q).toBe(3);
        });

        it("accepts UNKNOWN(9) and routes to function", () => {
          game.inputString = "9";
          game.gotClericSpell();
          expect(game.gameStateMachine.stateMode).toBe(86);
        });
      });

      describe("KILL spell", () => {
        it("is removed from the cleric spellbook after casting", () => {
          game.M = 1;
          game.clericSpellKill();
          expect(game.gameState.clericSpellbook[game.M]).toBe(0);
        });

        it("fails on the upper 66% chance", () => {
          randomResults = [ 1.1 ];
          game.clericSpellKill();
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(rndSpy).toHaveBeenCalled();
          expect(println).toHaveBeenCalledWith("FAILED");
        });

        it("succeeds on the first 33% chance", () => {
          randomResults = [ 1 ];
          game.K1 = 1;
          game.clericSpellKill();
          expect(game.gameStateMachine.stateMode).toBe(200);
          expect(rndSpy).toHaveBeenCalled();
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.K1).toBe(-1);
        });
      });

      describe("MAGIC MISSILE 2 spell", () => {
        it("is removed from the cleric spellbook after casting", () => {
          game.M = 2;
          game.currentMonster = 1;
          game.clericSpellMagicMissileAdvanced();
          expect(game.gameState.clericSpellbook[2]).toBe(0);
        });

        it("decreases the health of the current monster by 4", () => {
          game.currentMonster = 1;
          game.M = 2;
          game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp] = 10;
          game.clericSpellMagicMissileAdvanced();
          expect(game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp]).toBe(6);
        });

        it("notifies the player that the action is complete", () => {
          game.currentMonster = 1;
          game.M = 2;
          game.clericSpellMagicMissileAdvanced();
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("CURE LIGHT WOUNDS 1 spell", () => {
        beforeEach(() => {
          game.M = 3;
          game.gameState.clericSpellbook[game.M] = 3;
          game.gameState.attributes[game.constants.playerCon] = 10;
          game.clericSpellCureLight();
        });

        it("is removed from the cleric spellbook after casting", () => {
          expect(game.gameState.clericSpellbook[game.M]).toBe(0);
        });

        it("increases the constitution of the player by 3", () => {
          expect(game.gameState.attributes[game.constants.playerCon]).toBe(13);
        });

        it("routes control to the main loop", () => {
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("FIND TRAPS spell", () => {
        beforeEach(() => {
          game.Q = 2;
          game.M = 4; // M is destroyed by the spell function
        });

        it("is removed from the cleric spellbook after casting", () => {
          game.clericSpellFindTraps();
          expect(game.gameState.clericSpellbook[4]).toBe(0);
        });

        it("reports findings to the player", () => {
          game.clericSpellFindTraps();
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 3LAT.6LONG.");
          expect(println).toHaveBeenCalledWith("NO MORE");
        });

        it("routes control to the main loop", () => {
          game.clericSpellFindTraps();
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("MAGIC MISSILE 1 spell", () => {
        beforeEach(() => {
          game.M = 5;
          game.currentMonster = 1;
        });

        it("is removed from the cleric spellbook after casting", () => {
          game.clericSpellMagicMissile();
          expect(game.gameState.clericSpellbook[game.M]).toBe(0);
        });

        it("decreases the health of the current monster by 2", () => {
          game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp] = 10;
          game.clericSpellMagicMissile();
          expect(game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp]).toBe(8);
        });

        it("notifies the player that the action is complete", () => {
          game.clericSpellMagicMissile();
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("MAGIC MISSILE 3 spell", () => {
        beforeEach(() => {
          game.M = 6;
          game.currentMonster = 1;
        });

        it("is removed from the cleric spellbook after casting", () => {
          game.clericSpellMagicMissileUltimate();
          expect(game.gameState.clericSpellbook[game.M]).toBe(0);
        });

        it("decreases the health of the current monster by 6", () => {
          game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp] = 10;
          game.clericSpellMagicMissileUltimate();
          expect(game.gameState.monsterStats[game.currentMonster][game.constants.monsterHp]).toBe(4);
        });

        it("notifies the player that the action is complete", () => {
          game.clericSpellMagicMissileUltimate();
          expect(println).toHaveBeenCalledWith("DONE");
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("CURE LIGHT WOUNDS 2 spell", () => {
        beforeEach(() => {
          game.M = 7;
          game.gameState.attributes[game.constants.playerCon] = 10;
          game.clericSpellCureLightAdvanced();
        });

        it("is stays in the cleric spellbook after casting", () => {
          expect(game.gameState.clericSpellbook[game.M]).toBe(7);
        });

        it("increases the constitution of the player by 3", () => {
          expect(game.gameState.attributes[game.constants.playerCon]).toBe(13);
        });

        it("routes control to the main loop", () => {
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      describe("FIND SECRET DOORS spell", () => {
        beforeEach(() => {
          game.Q = 3;
          game.M = 8;
        });

        it("is removed from the cleric spellbook after casting", () => {
          game.clericSpellFindTraps();
          expect(game.gameState.clericSpellbook[8]).toBe(0);
        });

        it("reports findings to the player", () => {
          game.clericSpellFindTraps();
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 4LAT.3LONG.");
          expect(println).toHaveBeenCalledWith("THERE IS ONE AT 8LAT.4LONG.");
          expect(println).toHaveBeenCalledWith("NO MORE");
        });

        it("routes control to the main loop", () => {
          game.clericSpellFindTraps();
          expect(game.gameStateMachine.stateMode).toBe(200);
        });
      });

      // xdescribe("spell 9 (undefined)", function() {
      //   // this spell is incomplete with no definable result and cannot be purchased
      //   // original code suggests this would be a turn undead as it checks for skeleton or mummy as the current monster
      //   xit("only affects a skeleton or mummy");
      // });
    });
  });

});