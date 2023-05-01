/**
 * @jest-environment jsdom
 */
import GameState from '../../src/GameState'

describe('GameState', () => {
  let game;
  beforeEach(() => {
    game = new GameState();
  });

  describe('Serialise to map', () => {
    let init;
    beforeEach(() => {
      init = game.serialise();
    });
    it('generates a map snapshot of data', () => {
      expect(init instanceof Map).toBeTruthy();
    });
    describe('Dungeon Map', () => {
      it('holds a value for dungeonMap', () => {
        expect(init.keys()).toContain('dungeonMap');
      });
      it('records the value of Dn in dungeonMap', () => {
        expect(game.Dn).toBe(init.get('dungeonMap'));
      });
      it('holds all 50 rows of data for the map', () => {
        const mapKeys = Array.from(init.keys()).filter((key) => {
          return key.startsWith('dungeonMap.');
        });
        expect(mapKeys.length).toBe(50);
      });
    });
    describe('Inventory', () => {
      it('holds a value for inventory counter', () => {
        expect(init.keys()).toContain('inventoryCounter');
      });
      it('records the value of inventoryCounter', () => {
        expect(game.inventoryCounter).toBe(init.get('inventoryCounter'));
      });
      it('holds a value for inventory contents', () => {
        expect(init.keys()).toContain('inventory');
      });
    });
    describe('Monsters', () => {
      it('holds a value for monster names', () => {
        expect(init.keys()).toContain('monsterNames');
      });
      it('stores all names in one field', () => {
        const nameValue = init.get('monsterNames');
        const names = nameValue.split('|');
        expect(names.length).toBe(100);
      });
      it('holds a value for each set of monster attributes', () => {
        const mapKeys = Array.from(init.keys()).filter((key) => {
          return key.startsWith('monsterStats.');
        });
        expect(mapKeys.length).toBe(100);
      });
      it('holds values for current monster position on map', () => {
        expect(init.keys()).toContain('F1');
        expect(init.keys()).toContain('F2');
      });
    });
    describe('Attributes', () => {
      it('holds a value for all of the player character stats', () => {
        expect(init.keys()).toContain('attributes');
      });
      it('stores all stats in one field', () => {
        const nameValue = init.get('attributes');
        const names = nameValue.split('|');
        expect(names.length).toBe(7);
      });
      it('holds a value for character name', () => {
        expect(init.keys()).toContain('characterName');
      });
    });
    describe('Magic', () => {
      describe('Wizards', () => {
        it('holds a value for how many spells you have', () => {
          expect(init.keys()).toContain('wizardSpellCounter');
        });
        it('holds a value for all of the wizard spells you have', () => {
          expect(init.keys()).toContain('wizardSpellbook');
        });
        it('holds all of the spells in one value', () => {
          const spellbook = init.get('wizardSpellbook');
          const spells = spellbook.split('|');
          expect(spells.length).toBe(init.get('wizardSpellCounter') + 1);
        });
      });
      describe('Clerics', () => {
        it('holds a value for how many spells you have', () => {
          expect(init.keys()).toContain('clericSpellCounter');
        });
        it('holds a value for all of the cleric spells you have', () => {
          expect(init.keys()).toContain('clericSpellbook');
        });
        it('holds all of the spells in one value', () => {
          const spellbook = init.get('clericSpellbook');
          const spells = spellbook.split('|');
          expect(spells.length).toBe(init.get('clericSpellCounter') + 1);
        });
      });
    });
  });
  describe("Serialise to cookie", () => {
    it("writes the game state to a named cookie", () => {
      const client = jest.spyOn(document, 'cookie', 'set');
      const mapper = jest.spyOn(game, 'serialise');
      game.serialiseToCookie(document, 'prefix', 100);
      expect(mapper).toHaveBeenCalled();
      expect(client).toHaveBeenCalledTimes(164);
    });
  });
  describe("deSerialise", () => {
    describe('converts a map to game state', () => {
      let gameMap;
      let game;
      beforeEach(() => {
        game = new GameState();
        gameMap = new Map();
        gameMap.set('Dn', 10);
        for (let i=0;i<50;++i) {
          let map = "";
          for (let j=i;j<i+50;++j) {
            map += j + '|';
          }
          gameMap.set('dungeonMap.'+i, map);
        }
        gameMap.set('inventoryCounter', 12);
        let inv="";
        for (let i=0;i<12;++i) {
          inv += i + '|';
        }
        gameMap.set('inventory', inv);
        gameMap.set('currentWeaponIndex', 2);
        let names = '';
        for (let i=1;i<100;++i) {
          names += genName(i) + '|';
        }
        gameMap.set('monsterNames', names);
        for (let i=1;i<100;++i) {
          gameMap.set('monsterStats.'+i, '0|1|2|3|4|5|6');
        }
        gameMap.set('F1', 99);
        gameMap.set('F2', 98);
        gameMap.set('attributes', "1|2|3|4|5|6|7");
        gameMap.set('characterName', 'SAVEMAN');
        gameMap.set('equipment', "1|2|3|4|5|6|7|8|9|10|11|12|13|14|15");
        gameMap.set('wizardSpellCounter', 1);
        gameMap.set('wizardSpellbook', 'A|');
        gameMap.set('clericSpellCounter', 2);
        gameMap.set('clericSpellbook', 'B|C|');
        game.deSerialise(gameMap);
      });
      it("populates Dn from the deserialise map", () => {
        expect(game.Dn).toBe(10);
      });
      it('populates dungeonMap from the deserialise map', () => {
        const map = game.dungeonMap;
        for (let i=0;i<50;++i) {
          for (let j=0;j<50;++j) {
            expect(map[i][j]).toBe(i+j);
          }
        }
      });
      it('populates inventory counter from the deserialise map', () => {
        expect(game.inventoryCounter).toBe(12);
      });
      it('populates inventory from the deserialise map', () => {
        const inv = game.inventory;
        for (let i=0;i<12;++i) {
          expect(inv[i]).toEqual(''+i);
        }
      });
      it('populates equipment from the deserialise map', () => {
        const equip = game.equipmentNames;
        for (let i=1;i<16;++i) {
          expect(equip[i]).toEqual(''+i);
        }
      });
      it('populates attributes from the deserialise map', () => {
        const stats = game.attributes;
        for (let i=1;i<=7;++i) {
          expect(stats[i]).toBe(i);
        }
      });
      it('populates characterName from the deserialise map', () => {
        expect(game.characterName).toBe('SAVEMAN');
      });
      it('populates the current monster position', () => {
        expect(game.F1).toBe(99);
        expect(game.F2).toBe(98);
      });
      it('populates monster names', () => {
        const names = game.monsterNames;
        for (let i=1;i<100;++i) {
          expect(names[i]).toBe(genName(i));
        }
      });
      it('populates monster stats', () => {
        const stats = game.monsterStats;
        for (let i=1;i<100;++i) {
          for (let j=0;j<7;++j) {
            expect(stats[i][j]).toBe(j);
          }
        }
      });
      it('populates wizard spell counter', () => {
        expect(game.wizardSpellCounter).toBe(1);
      });
      it('populates wizard spell book', () => {
        expect(game.wizardSpellbook[1]).toBe('A');
      });
      it('populates cleric spell counter', () => {
        expect(game.clericSpellCounter).toBe(2);
      });
      it('populates cleric spell book', () => {
        expect(game.clericSpellbook[1]).toBe('B');
        expect(game.clericSpellbook[2]).toBe('C');
      });
    });
  });
});

const genName = (i) => {
  let result = "";
  let c1 = i % 26;
  let c2 = (i - c1) / 26;
  if (c2 > 0)
    result += String.fromCharCode(64 + c2);
  return result + String.fromCharCode(65 + c1);
}