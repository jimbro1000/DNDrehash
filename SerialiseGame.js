import {setCookie} from './helper';

class SerialiseGame {
  #gameStateObject;

  constructor(stateObject) {
    this.#gameStateObject = stateObject;
  }

  #serialiseMapRow = (row) => {
    let result = "";
    for (let col = 0; col <= 25; col++) result += this.#gameStateObject.dungeonMap[row][col] + "|";
    return result;
  }

  #serialiseInventory = () => {
    let result = "";
    for (let index= 1; index <= this.#gameStateObject.inventoryCounter; index++)
      result += this.#gameStateObject.inventory[index] + "|";
    return result;
  }

  #serialiseMonsterNames = () => {
    let result = "";
    for (let index= 1; index <= 10; index++)
      result += this.#gameStateObject.monsterNames[index] + "|";
    return result;
  }

  #serialiseMonsterStats = (index) => {
    let result = "";
    for (let item= 1; item <= 6; item++)
      result += this.#gameStateObject.monsterStats[index][item] + "|";
    return result;
  }

  #serialiseAttributes = () => {
    let result = "";
    for (let index = 0; index <= 7; index++)
      result += this.#gameStateObject.attributeNames[index] + "|" + this.#gameStateObject.attributes[index] + "|";
    return result;
  }

  #serialiseEquipment = () => {
    let result = "";
    for (let index = 1; index <= 15; ++index)
      result += this.#gameStateObject.equipmentNames[index] + "|";
    return result;
  }

  #serialiseSpellbook = () => {
    let result = "";
    for (let index = 1; index <= this.#gameStateObject.wizardSpellCounter; ++index)
      result += this.#gameStateObject.wizardSpellbook[index] + "|";
    return result;
  }

  #serialisePrayerbook = () => {
    let result = "";
    for (let index = 1; index <= this.#gameStateObject.clericSpellCounter; index++)
      result += this.#gameStateObject.clericSpellbook[index] + "|";
    return result;
  }

  serialise = () => {
    const result= new Map();
    result.set('dungeonMap', this.#gameStateObject.Dn);
    result.set('inventoryCounter', this.#gameStateObject.inventoryCounter);
    result.set('currentWeaponIndex', this.#gameStateObject.currentWeaponIndex);
    for (let row= 0; row < 24; ++row) {
      result.set("dungeonMap." + row, this.#serialiseMapRow(row));
    }
    result.set('inventory', this.#serialiseInventory());
    result.set('monsterNames', this.#serialiseMonsterNames());
    for (let monster = 1; monster <= 10; monster++) {
     result.set('monsterStats.' + monster, this.#serialiseMonsterStats(monster));
    }
    result.set('attributes', this.#serialiseAttributes());
    result.set('characterName', this.#gameStateObject.characterName);
    result.set('F1', this.#gameStateObject.F1);
    result.set('equipment', this.#serialiseEquipment());
    result.set('wizardSpellCounter', this.#gameStateObject.wizardSpellCounter);
    result.set('wizardSpellbook', this.#serialiseSpellbook());
    result.set('clericSpellCounter', this.#gameStateObject.clericSpellCounter);
    result.set('clericSpellbook', this.#serialisePrayerbook());
    result.set('F2', this.#gameStateObject.F2);
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
      this.#gameStateObject.dungeonMap[row][col] = values[col];
    }
  }

  #deSerialiseInventory = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index= 0; index < values.length; ++index) {
      this.#gameStateObject.inventory[index] = values[index];
    }
  }

  #deSerialiseMonsterNames = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < 10; ++index) {
      this.#gameStateObject.monsterNames[index + 1] = values[index];
    }
  }

  #deSerialiseMonsterStats = (monster, value) => {
    const values = this.#valueStringToArray(value);
    for (let index= 0; index < 6; ++index) {
      this.#gameStateObject.monsterStats[monster][index + 1] = values[index];
    }
  }

  #deSerialiseAttributes = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index <= 7; index++) {
      this.#gameStateObject.attributeNames[index] = values[index * 2];
      this.#gameStateObject.attributes[index] = values[1 + index * 2];
    }
  }

  #deSerialiseEquipment = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < 15; ++index)
      this.#gameStateObject.equipmentNames[index + 1] = values[index];
  }

  #deSerialiseSpellbook = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < values.length; ++index)
      this.#gameStateObject.wizardSpellbook[index + 1] = values[index];
  }

  #deSerialisePrayerbook = (value) => {
    const values = this.#valueStringToArray(value);
    for (let index = 0; index < values.length; ++index)
      this.#gameStateObject.clericSpellbook[index + 1] = values[index];
  }

  deSerialise = (map) => {
    this.#gameStateObject.Dn = map.get('Dn');
    this.#gameStateObject.inventoryCounter = map.get('inventoryCounter');
    this.#gameStateObject.currentWeaponIndex = map.get('currentWeaponIndex');
    for (let row= 0; row < 24; ++row) {
      this.#deSerialiseMapRow(row, map.get('dungeonMap.' + row));
    }
    this.#deSerialiseMonsterNames(map.get('monsterNames'));
    for (let monster = 1; monster <= 10; monster++) {
      this.#deSerialiseMonsterStats(monster, map.get('monsterStats.' + monster));
    }
    this.#deSerialiseAttributes(map.get('attributes'));
    this.#gameStateObject.characterName = map.get('characterName');
    this.#gameStateObject.F1 = map.get('F1');
    this.#deSerialiseEquipment(map.get('equipment'));
    this.#gameStateObject.wizardSpellCounter = map.get('wizardSpellCounter');
    this.#deSerialiseSpellbook(map.get('wizardSpellbook'));
    this.#gameStateObject.clericSpellCounter = map.get('clericSpellCounter');
    this.#deSerialisePrayerbook(map.get('clericSpellbook'));
    this.#gameStateObject.F2 = map.get('F2');
  }
}