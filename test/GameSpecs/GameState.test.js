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
  });
});