import {setCookie} from './helper';

export default class GameState {
  #Dn = 1;
  #dungeonMap = [];
  #inventoryCounter = 0;
  #currentWeaponIndex = -1;
  #inventory = [];
  #monsterNames = [];
  #monsterStats = [];
  #attributes = [];
  #characterName = '';
  #F1 = 0;
  #F2 = 0;
  #equipmentNames = [];
  #clericSpellCounter = 0;
  #wizardSpellCounter = 0;
  #wizardSpellbook = [];
  #clericSpellbook = [];

  #mapSize = 50;
  #maxMonster = 100;

  constructor() {
    for (let m = 0; m < this.#mapSize; ++m) {
      this.#dungeonMap[m] = [];
      for (let n = 0; n < this.#mapSize; ++n) this.#dungeonMap[m][n] = 1;
    }
    for (let m = 1; m < 8; ++m) {
      this.#attributes[m] = 0;
    }
    for (let m = 0; m < this.#maxMonster; ++m) {
      this.#monsterNames[m] = '';
      this.#monsterStats[m] = [];
      for (let n = 0; n <= 6; ++n) {
        this.#monsterStats[m][n] = 0;
      }
    }
  }

  get Dn() {
    return this.#Dn;
  }

  set Dn(floor) {
    this.#Dn = floor;
  }

  get dungeonMap() {
    return this.#dungeonMap;
  }

  get inventoryCounter() {
    return this.#inventoryCounter;
  }

  set inventoryCounter(count) {
    this.#inventoryCounter = count;
  }

  get currentWeaponIndex() {
    return this.#currentWeaponIndex;
  }

  set currentWeaponIndex(index) {
    this.#currentWeaponIndex = index;
  }

  get inventory() {
    return this.#inventory;
  }

  get attributes() {
    return this.#attributes;
  }

  get characterName() {
    return this.#characterName;
  }

  get monsterNames() {
    return this.#monsterNames;
  }

  get monsterStats() {
    return this.#monsterStats;
  }

  get F1() {
    return this.#F1;
  }

  set F1(x) {
    this.#F1 = x;
  }

  get F2() {
    return this.#F2;
  }

  set F2(y) {
    this.#F2 = y;
  }

  get equipmentNames() {
    return this.#equipmentNames;
  }

  get clericSpellCounter() {
    return this.#clericSpellCounter;
  }

  get wizardSpellCounter() {
    return this.#wizardSpellCounter;
  }

  get clericSpellbook() {
    return this.#clericSpellbook;
  }

  get wizardSpellbook() {
    return this.#wizardSpellbook;
  }

  #serialiseMapRow = (row) => {
    let result = "";
    for (let col = 0; col < this.#mapSize; col++) result += this.#dungeonMap[row][col] + "|";
    return result;
  }

  #serialiseInventory = () => {
    let result = "";
    for (let index= 1; index <= this.#inventoryCounter; index++)
      result += this.#inventory[index] + "|";
    return result;
  }

  #serialiseMonsterNames = () => {
    let result = "";
    for (let index= 1; index < this.#maxMonster; index++)
      result += this.#monsterNames[index] + "|";
    return result;
  }

  #serialiseMonsterStats = (index) => {
    let result = "";
    for (let item= 1; item <= 6; item++)
      result += this.#monsterStats[index][item] + "|";
    return result;
  }

  #serialiseAttributes = () => {
    let result = "";
    for (let index = 1; index <= 7; index++)
      result += this.#attributes[index] + "|";
    return result;
  }

  #serialiseEquipment = () => {
    let result = "";
    for (let index = 1; index <= 15; ++index)
      result += this.#equipmentNames[index] + "|";
    return result;
  }

  #serialiseSpellbook = () => {
    let result = "";
    for (let index = 1; index <= this.#wizardSpellCounter; ++index)
      result += this.#wizardSpellbook[index] + "|";
    return result;
  }

  #serialisePrayerbook = () => {
    let result = "";
    for (let index = 1; index <= this.#clericSpellCounter; index++)
      result += this.#clericSpellbook[index] + "|";
    return result;
  }

  serialise = () => {
    const result= new Map();
    result.set('dungeonMap', this.#Dn);
    result.set('inventoryCounter', this.#inventoryCounter);
    result.set('currentWeaponIndex', this.#currentWeaponIndex);
    for (let row= 0; row < this.#mapSize; ++row) {
      result.set("dungeonMap." + row, this.#serialiseMapRow(row));
    }
    result.set('inventory', this.#serialiseInventory());
    result.set('monsterNames', this.#serialiseMonsterNames());
    for (let monster = 1; monster < this.#maxMonster; monster++) {
     result.set('monsterStats.' + monster, this.#serialiseMonsterStats(monster));
    }
    result.set('attributes', this.#serialiseAttributes());
    result.set('characterName', this.#characterName);
    result.set('F1', this.#F1);
    result.set('equipment', this.#serialiseEquipment());
    result.set('wizardSpellCounter', this.#wizardSpellCounter);
    result.set('wizardSpellbook', this.#serialiseSpellbook());
    result.set('clericSpellCounter', this.#clericSpellCounter);
    result.set('clericSpellbook', this.#serialisePrayerbook());
    result.set('F2', this.#F2);
    return result;
  }

  serialiseToCookie = (client, prefix, lifespan) => {
    const map = this.serialise();
    for(const [key, value] of map) {
      setCookie(client, prefix + '.' + key, value, lifespan);
    }
  }

  deSerialiseFromCookie = (client, prefix) => {
    const allCookies = client.cookie.split(';');
    const map = new Map();
    allCookies.forEach((value, index, array) => {
      if (value.startsWith(prefix)) {
        const item = value.split('=');
        const key = item[0].substring(prefix.length + 1);
        map.set(key, item[1]);
      }
    });
  }

  #valueStringToArray = (string) => {
    return string.split('|');
  }

  #deSerialiseMapRow = (row, value) => {
    const values = this.#valueStringToArray(value);
    for (let col = 0; col < 24; ++col) {
      this.#dungeonMap[row][col] = values[col];
    }
  }

  #deSerialiseInventory = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index= 0; index < values.length; ++index) {
      this.#inventory[index] = values[index];
    }
  }

  #deSerialiseMonsterNames = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < this.#maxMonster; ++index) {
      this.#monsterNames[index + 1] = values[index];
    }
  }

  #deSerialiseMonsterStats = (monster, value) => {
    const values = this.#valueStringToArray(value);
    for (let index= 0; index < 6; ++index) {
      this.#monsterStats[monster][index + 1] = values[index];
    }
  }

  #deSerialiseAttributes = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < 7; index++) {
      this.#attributes[1 + index] = values[index];
    }
  }

  #deSerialiseEquipment = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < 15; ++index)
      this.#equipmentNames[index + 1] = values[index];
  }

  #deSerialiseSpellbook = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < values.length; ++index)
      this.#wizardSpellbook[index + 1] = values[index];
  }

  #deSerialisePrayerbook = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < values.length; ++index)
      this.#clericSpellbook[index + 1] = values[index];
  }

  deSerialise = (map) => {
    this.#Dn = map.get('Dn');
    this.#inventoryCounter = map.get('inventoryCounter');
    this.#currentWeaponIndex = map.get('currentWeaponIndex');
    for (let row= 0; row < 24; ++row) {
      this.#deSerialiseMapRow(row, map.get('dungeonMap.' + row));
    }
    this.#deSerialiseMonsterNames(map.get('monsterNames'));
    for (let monster = 1; monster < this.#maxMonster; monster++) {
      this.#deSerialiseMonsterStats(monster, map.get('monsterStats.' + monster));
    }
    this.#deSerialiseAttributes(map.get('attributes'));
    this.#characterName = map.get('characterName');
    this.#F1 = map.get('F1');
    this.#deSerialiseEquipment(map.get('equipment'));
    this.#wizardSpellCounter = map.get('wizardSpellCounter');
    this.#deSerialiseSpellbook(map.get('wizardSpellbook'));
    this.#clericSpellCounter = map.get('clericSpellCounter');
    this.#deSerialisePrayerbook(map.get('clericSpellbook'));
    this.#F2 = map.get('F2');
  }
}

// module.exports = GameState;