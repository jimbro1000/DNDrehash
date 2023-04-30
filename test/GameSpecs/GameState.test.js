import GameState from '../../src/GameState'

describe('GameState', () => {
  let game;
  beforeEach(() => {
    game = new GameState();
  });

  describe('Serialise', () => {
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
});