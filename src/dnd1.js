/*
 Port of Richard Garriott's DND #1
 © 1977-2014 Richard Garriott
 Ported by Julian Brown
 all rights to this port remain property of Richard Garriott
 Modified 30 Apr 2023
 */
import Console from "./Console";
import GameState from "./GameState";
import {getCookie, rnd, int, isNumber, setCookie} from "./helper";
import StateMachine from "./StateMachine";
import StateModel from "./StateModel";
import $ from "jquery";

/*
 ToDo:
 Create maps
 Test Case Scripts
 */
const debug = false; //global debug flag to enable logging
let difficultyFactor = 0;
let J6; //only used once - investigate
let K1 = 0;
// var J9 = 0; //random seed
let attributeNames = [];
// var D2 = 1; // target map for modification actions, currently redundant
let equipmentPrice = [];
let maxMonsterIndex = 0;
// var E = []; // (100)
// var F = []; // (100)
let clericSpellPrices = []; //(100) cleric spell prices
let wizardSpellPrices = []; // (100) wizard spell prices
let mapY; // map y
let mapX; // map x
let R; // only appears to be used once - investigate
let S; // move delta
let T; // turn input / move delta
let M; // general purpose loop counter - dangerous reuse observed for other calculations
let N; // general purpose loop counter
let P0; //used but never modified - investigate
let inputInt;
let Z;
let Z5; //only used once - investigate
let range, toHitRoll, rangeRowOffset, rangeColumnOffset; //range and hit calculations
let R3, R4, R5; //combat calculations
let terminal; // display terminal
let Q; // numeric input
let strQ; //string input
let characterName; // player name
let vbTab; // tab character

let gameState;

let reading; // block key press event when true
let inputString;
let inputStrings = [];
let inputsCount;
let inputFilter;

let gameStateMachine;

let inputRow;
let inputColumn;

let cookieLifespan;

const constants = {
    playerHp: 0,
    playerStr: 1,
    playerDex: 2,
    playerCon: 3,
    playerCha: 4,
    playerWis: 5,
    playerInt: 6,
    playerGold: 7,
    playerClass: 0,
    monsterLevel: 1,
    monsterStrength: 2,
    monsterHp: 3,
    monsterStartHp: 4,
    monsterStartGold: 5,
    monsterGold: 6
};

function buildStateModel() {
    gameStateMachine = new StateMachine();
    gameStateMachine.addState(new StateModel(1, "loading", loadScreen));
    gameStateMachine.addState(new StateModel(2, "accept instructions input", gotInstructionInput));
    gameStateMachine.addState(new StateModel(3, "old or new game", gotLoadInput));
    gameStateMachine.addState(new StateModel(4, "cheeky instructions", showInstructions));
    gameStateMachine.addState(new StateModel(5, "accept old or new input", gotLoadInput));
    gameStateMachine.addState(new StateModel(6, "accept dungeon # input", gotDungeonInput));
    gameStateMachine.addState(new StateModel(7, "load old dungeon", fetchDungeonSave));
    gameStateMachine.addState(new StateModel(8, "continues reset", gotResetInput));
    gameStateMachine.addState(new StateModel(9, "accept player name", gotNameInput));
    gameStateMachine.addState(new StateModel(10, "roll", rollNew));
    gameStateMachine.addState(new StateModel(10.5, "pick class", pickClass));
    gameStateMachine.addState(new StateModel(11, "accept class input", gotClassInput));
    gameStateMachine.addState(new StateModel(12, "picked fighter", gotFighter));
    gameStateMachine.addState(new StateModel(13, "picked cleric", gotCleric));
    gameStateMachine.addState(new StateModel(14, "picked wizard", gotWizard));
    gameStateMachine.addState(new StateModel(15, "go shopping", shopTop));
    gameStateMachine.addState(new StateModel(16, "accept fast-norm shop", gotShopFastNorm));
    gameStateMachine.addState(new StateModel(17, "shopping list", shopList));
    gameStateMachine.addState(new StateModel(18, "buy goods", shopping));
    gameStateMachine.addState(new StateModel(19, "buying goods", gotShoppingInput));
    gameStateMachine.addState(new StateModel(20, "finished buying", showInvQuestion));
    gameStateMachine.addState(new StateModel(20.5, "accept show inv", gotInvQuestion));
    gameStateMachine.addState(new StateModel(21, "show inv", showInventory));
    gameStateMachine.addState(new StateModel(22, "show stats", showStats));
    gameStateMachine.addState(new StateModel(23, "main game", welcome));
    gameStateMachine.addState(new StateModel(23.5, "accept show commands", gotCommandsQuestion));
    gameStateMachine.addState(new StateModel(24, "show commands", showCommands));
    gameStateMachine.addState(new StateModel(25, "get command", getCommand));
    gameStateMachine.addState(new StateModel(26, "route command", gotCommand));
    gameStateMachine.addState(new StateModel(30, "get pretend basic interpreter input", getBASIC));
    gameStateMachine.addState(new StateModel(31, "got pretend basic interpreter input", gotBASIC));
    gameStateMachine.addState(new StateModel(45, "make a move", startMove));
    gameStateMachine.addState(new StateModel(46, "accept a move", gotMove));
    gameStateMachine.addState(new StateModel(47, "finish move", completeMove));
    gameStateMachine.addState(new StateModel(48, "into a wall", thud));
    gameStateMachine.addState(new StateModel(49, "into a trap", itsATrap));
    gameStateMachine.addState(new StateModel(50, "secret door", hush));
    gameStateMachine.addState(new StateModel(51, "boost str", boost1));
    gameStateMachine.addState(new StateModel(52, "boost con", boost2));
    gameStateMachine.addState(new StateModel(53, "into a bod", surprise));
    gameStateMachine.addState(new StateModel(54, "gold", gold));
    gameStateMachine.addState(new StateModel(55, "open door", openDoor));
    gameStateMachine.addState(new StateModel(56, "accept door move", gotDoorMove));
    gameStateMachine.addState(new StateModel(57, "search", searching));
    gameStateMachine.addState(new StateModel(58, "change weapon", swapWeapon));
    gameStateMachine.addState(new StateModel(59, "accept change weapon", gotSwap));
    gameStateMachine.addState(new StateModel(60, "start player fight", resolveFight));
    gameStateMachine.addState(new StateModel(61, "punch", knuckles));
    gameStateMachine.addState(new StateModel(62, "attack with a sword", swingASword));
    gameStateMachine.addState(new StateModel(63, "attack with a 2h-sword", swingABigSword));
    gameStateMachine.addState(new StateModel(64, "attack with a dagger", pokeADagger));
    gameStateMachine.addState(new StateModel(65, "attack with a mace", swingAMace));
    gameStateMachine.addState(new StateModel(66, "attack with something", improvise));
    gameStateMachine.addState(new StateModel(67, "throw food", throwFood));
    gameStateMachine.addState(new StateModel(68, "really punch", knucklehead));
    gameStateMachine.addState(new StateModel(69, "resolve improvised attack", resolveImprov));
    gameStateMachine.addState(new StateModel(70, "accept club-sight", gotSilverCross));
    gameStateMachine.addState(new StateModel(71, "remove used weapon or ammo", consumeWpn));
    gameStateMachine.addState(new StateModel(72, "hit monster with food", peltMonster));
    gameStateMachine.addState(new StateModel(73, "distract monster with food", kiteMonster));
    gameStateMachine.addState(new StateModel(74, "loose thrown food", consumeFood));
    gameStateMachine.addState(new StateModel(75, "look command", looking));
    gameStateMachine.addState(new StateModel(76, "save", saveGame));
    gameStateMachine.addState(new StateModel(77, "cast a spell", casting));
    gameStateMachine.addState(new StateModel(78, "cast a cleric spell", gotClericSpell));
    gameStateMachine.addState(new StateModel(79, "cast cleric spell 1 (kill)", clericSpellKill));
    gameStateMachine.addState(new StateModel(80, "cast cleric spell 2 (magic missile #2)", clericSpellMagicMissileAdvanced));
    gameStateMachine.addState(new StateModel(81, "cast cleric spell 3 (cure light wounds #1)", clericSpellCureLight));
    gameStateMachine.addState(new StateModel(82, "cast cleric spell 4/8 (find all traps/s.doors)", clericSpellFindTraps));
    gameStateMachine.addState(new StateModel(83, "cast cleric spell 5 (magic missile #1)", clericSpellMagicMissile));
    gameStateMachine.addState(new StateModel(84, "cast cleric spell 6 (magic missile #3)", clericSpellMagicMissileUltimate));
    gameStateMachine.addState(new StateModel(85, "cast cleric spell 7 (cure light wounds #2)", clericSpellCureLightAdvanced));
    gameStateMachine.addState(new StateModel(86, "cast cleric spell 9 (cheat - push)", clericSpell9));
    gameStateMachine.addState(new StateModel(87, "cast a wizard spell", gotWizardSpell));
    gameStateMachine.addState(new StateModel(88, "cast wizard spell 2", wizardSpellKill));
    gameStateMachine.addState(new StateModel(89, "cast wizard spell 3", wizardSpellFindTrap));
    gameStateMachine.addState(new StateModel(90, "cast wizard spell 4", wizardSpellTeleport));
    gameStateMachine.addState(new StateModel(91, "accept wizard spell 4", gotTeleportCoordinates));
    gameStateMachine.addState(new StateModel(91.5, "cast wizard spell CHANGE 5 and 10", gotSpellChange));
    gameStateMachine.addState(new StateModel(91.6, "accept wizard spell CHANGE coordinates", gotChangeCoordinates));
    gameStateMachine.addState(new StateModel(92, "buy spells", buyMagic));
    gameStateMachine.addState(new StateModel(93, "cleric spell choice question", askACleric));
    gameStateMachine.addState(new StateModel(94, "wizard spell choice question", askAWizard));
    gameStateMachine.addState(new StateModel(95, "cleric spell list", clericSpellChoices));
    gameStateMachine.addState(new StateModel(96, "wizard spell list", wizardSpellChoices));
    gameStateMachine.addState(new StateModel(97, "cleric spell transaction", clericSpellPurchase));
    gameStateMachine.addState(new StateModel(98, "wizard spell transaction", wizardSpellPurchase));
    gameStateMachine.addState(new StateModel(99, "cheat: show map", showCheatMap));
    gameStateMachine.addState(new StateModel(100, "gold into sauce", buyHP));
    gameStateMachine.addState(new StateModel(101, "got gold get sauce", addHP));
    gameStateMachine.addState(new StateModel(102, "start edit map", modifyMap));
    gameStateMachine.addState(new StateModel(102.5, "got map number", modifyGotMap));
    gameStateMachine.addState(new StateModel(103, "get map pos", modifyMapPos));
    gameStateMachine.addState(new StateModel(104, "update map pos", modifyMapDone));
    gameStateMachine.addState(new StateModel(105, "save map changes", modifyMapSave));
    gameStateMachine.addState(new StateModel(200, "route post-player actions", routeGameMove));
    gameStateMachine.addState(new StateModel(201, "got answer to more equipment", gotMoreEquipment));
    gameStateMachine.addState(new StateModel(202, "check if map is cleared", monsterMove));
    gameStateMachine.addState(new StateModel(203, "report kill", confirmedKill));
    gameStateMachine.addState(new StateModel(204, "make a monster (spawn)", makeAMonster));
    gameStateMachine.addState(new StateModel(205, "got reset answer", resetAfterClear));
    gameStateMachine.addState(new StateModel(206, "make a monster move small step", monsterAction));
    gameStateMachine.addState(new StateModel(207, "monster attacks player", monsterSwings));
    gameStateMachine.stateMode = 1;
}

function getCurrentWeapon() {
    if (gameState.currentWeaponIndex === -1) return 0;
    return gameState.inventory[currentWeaponIndex];
}

function setCurrentWeapon(item) {
    if (item === -1) {
        gameState.currentWeaponIndex = -1;
        return true;
    }
    for (let i = 0; i <= gameState.inventoryCounter; i++)
        if (gameState.inventory[i] === item) {
            gameState.currentWeaponIndex = i;
            return true;
        }
    return false;
}

/***
 * Check if given coordinates are inside map bounds
 * @param row
 * @param column
 * @returns {boolean} true if inside map limits
 */
function inBounds(row, column) {
    return (row >= 0) && (row <= 25) && (column >= 0) && (column <= 25);
}

function findRange() {
    //range and hit check
    let m, n;
    let tempY, tempX;
    range = 1000;
    tempY = 26;
    tempX = 26;
    for (m = -25; m <= 25; m++) {
        for (n = -25; n <= 25; n++) {
            if (inBounds(mapY + m, mapX + n)) {
                if (gameState.dungeonMap[mapY + m][mapX + n] === 5) {
                    tempY = m;
                    tempX = n;
                    range = Math.sqrt(tempY * tempY + tempX * tempX);
                    m = 26;
                    n = 26;
                }
            }
        }
    }
    rangeRowOffset = tempY;
    rangeColumnOffset = tempX;
    if (int(rnd(20) + 1) > 18) {
        toHitRoll = 3;
    } else {
        if (rnd(20) > (gameState.monsterStats[gameState.currentMonster][2] - gameState.attributes[constants.playerDex] / 3)) {
            toHitRoll = 2;
        } else {
            if (rnd(2) > 1.7) {
                toHitRoll = 1;
            } else {
                toHitRoll = 0;
            }
        }
    }
}

function initialiseGlobals(gameConsole) {
    cookieLifespan = 365; //cookie lifespan
    mapY = 1; //int(rnd(24) + 2);
    mapX = 12; //int(rnd(24) + 2);
    terminal = gameConsole;
    reading = false;
    inputString = "";
    vbTab = String.fromCharCode(9);
    gameState = new GameState();
    P0 = 0;

    gameState.equipmentNames = ["", "SWORD", "2-H-SWORD", "DAGGER", "MACE", "SPEAR", "BOW", "ARROWS", "LEATHER MAIL", "CHAIN MAIL", "PLATE MAIL", "ROPE", "SPIKES", "FLASK OF OIL", "SILVER CROSS", "SPARE FOOD"];
    equipmentPrice = [0, 10, 15, 3, 5, 2, 25, 2, 15, 30, 50, 1, 1, 2, 25, 5];
    attributeNames = ["", "STR", "DEX", "CON", "CHAR", "WIS", "INT", "GOLD"];
    clericSpellPrices = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
    wizardSpellPrices = [0, 75, 500, 200, 750, 600, 100, 200, 300, 200, 600];

    buildStateModel();
}

function loadMonster(index, name, stats) {
    gameState.monsterNames[index] = name;
    gameState.monsterStats[index] = stats;
    gameState.monsterStats[index][4] = gameState.monsterStats[index][3];
    gameState.monsterStats[index][5] = gameState.monsterStats[index][6];
    gameState.monsterStats[index][1] = 1;
}

function loadMonsters() {
    let index = 0;
    loadMonster(index++, "", []);
    loadMonster(index++, "MAN", [0, 1, 13, 26, 1, 1, 500]);
    loadMonster(index++, "GOBLIN", [0, 2, 13, 24, 1, 1, 600]);
    loadMonster(index++, "TROLL", [0, 3, 15, 35, 1, 1, 1000]);
    loadMonster(index++, "SKELETON", [0, 4, 22, 12, 1, 1, 50]);
    loadMonster(index++, "BALROG", [0, 5, 18, 110, 1, 1, 5000]);
    loadMonster(index++, "OCHRE JELLY", [0, 6, 11, 20, 1, 1, 0]);
    loadMonster(index++, "GREY OOZE", [0, 7, 11, 13, 1, 1, 0]);
    loadMonster(index++, "GNOME", [0, 8, 13, 30, 1, 1, 100]);
    loadMonster(index++, "KOBOLD", [0, 9, 15, 16, 1, 1, 500]);
    loadMonster(index++, "MUMMY", [0, 10, 16, 30, 1, 1, 100]);
    maxMonsterIndex = index;
}

function partial() {
    terminal.printAt(inputRow, inputColumn, inputString.toUpperCase() + "_ ");
}

function input() {
    gameStateMachine.setWait();
    inputFilter = 1;
    inputString = "";
    inputsCount = 0;
    reading = true;
    // wait for enter to be pressed (reading is cleared)
    // use gotInput to capture event
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined"))
        terminal.printAt(inputRow, inputColumn, "_");
    console.info("waiting for input");
}

function inputStr() {
    gameStateMachine.setWait();
    inputFilter = 0;
    inputString = "";
    inputsCount = 0;
    reading = true;
    // wait for enter to be pressed (reading is cleared)
    // use gotInput to capture event
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined"))
        terminal.printAt(inputRow, inputColumn, "_");
    console.info("waiting for input");
}

function inputX(items) {
    gameStateMachine.setWait();
    inputsCount = items;
    inputFilter = 1;
    inputString = "";
    reading = true;
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined"))
        terminal.printAt(inputRow, inputColumn, "_");
    console.info("waiting for input");
}

function gotInput() {
    reading = false;
    let value = inputString.toUpperCase();
    terminal.setCursorPos(inputRow, inputColumn);
    terminal.print(value);
    inputString = value;
    if (inputsCount > 0) {
        inputStrings[inputsCount - 1] = inputString.trim();
        inputString = "";
        inputsCount--;
        if (inputsCount > 0) {
            terminal.print(",");
            reading = true;
            inputRow = terminal.cursorPosition.row;
            inputColumn = terminal.cursorPosition.column;
            if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined")) {
                terminal.printAt(inputRow, inputColumn, "_");
            }
            console.info("waiting for input");
        } else {
            terminal.println("");
            gameStateMachine.modelEngine();
        }
    } else {
        terminal.println("");
        gameStateMachine.modelEngine();
    }
}

function main(terminal) {
    //main loop
    initialiseGlobals(terminal);
    gameStateMachine.modelEngine();
}

/* main game code starts here - each function (unless stated otherwise) represents a game state */

function loadScreen() { //1
    terminal.printc("DUNGEONS AND DRAGONS #1");
    terminal.printc("(C) 1977-2014 RICHARD GARRIOTT");
    terminal.printc("PORTED BY JULIAN BROWN");
    terminal.printc("ALL RIGHTS TO THIS PORT REMAIN PROPERTY");
    terminal.printc("OF RICHARD GARRIOTT");
    terminal.printc("******UPDATED 30 APR 2023******");
    terminal.printc("");
    terminal.printc("WARNING! THIS SITE USES COOKIES");
    terminal.printc("IF YOU DON'T WANT TO STORE COOKIES");
    terminal.printc("PLEASE STOP NOW");
    terminal.println("");
    terminal.print("DO YOU NEED INSTRUCTIONS ");
    gameStateMachine.stateMode = 2;
    inputStr();
}

function gotInstructionInput() { //2
    let strQ = inputString.trim();
    if (strQ === "YES" || strQ === "Y") {
        gameStateMachine.stateMode = 4;
    }
    else {
        terminal.print("OLD OR NEW GAME ");
        gameStateMachine.stateMode = 3;
        inputStr();
    }
}

function gotLoadInput() { //3
    let strQ = inputString.trim();
    if (strQ === "OLD") {
        gameStateMachine.stateMode = 7;
    } else {
        terminal.print("DUNGEON # ");
        gameStateMachine.stateMode = 6;
        input();
    }
}

function showInstructions() { //4
    terminal.println("WHO SAID YOU COULD PLAY");
    terminal.println("[STOP]");
    gameStateMachine.stateMode = 30;
}

function gotDungeonInput() { //6
    let Q = parseInt(inputString.trim());
    gameState.Dn = Math.floor(Q);
    terminal.print("CONTINUES RESET 1=YES,2=NO ");
    gameStateMachine.stateMode = 8;
    input();
}

function fetchDungeonSave() { //7
    if (getCookie(Document, 'dnd1file7.' + Dn) !== '') {
        gameState.deSerialiseFromCookie(Document, 'dnd1file7');
        gameStateMachine.stateMode = 23;
    } else {
        terminal.println("ERROR FILE #7 DOES NOT EXIST");
        terminal.println("[STOP]");
        gameStateMachine.stateMode = 30;
    }
}

function defaultMap() {
    gameState.dungeonMap[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    gameState.dungeonMap[1] = [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 3, 0, 1, 6, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    gameState.dungeonMap[2] = [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1, 0, 1, 1, 0, 1];
    gameState.dungeonMap[3] = [1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0, 1, 0, 0, 1, 0, 1];
    gameState.dungeonMap[4] = [1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 4, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1];
    gameState.dungeonMap[5] = [1, 0, 0, 6, 1, 0, 0, 6, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 6, 1, 0, 0, 1, 0, 1];
    gameState.dungeonMap[6] = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1];
    gameState.dungeonMap[7] = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 6, 0, 1, 1, 1, 0, 1];
    gameState.dungeonMap[8] = [1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1];
    gameState.dungeonMap[9] = [1, 0, 6, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1];
    gameState.dungeonMap[10] = [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 1, 0, 1];
    gameState.dungeonMap[11] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1];
    gameState.dungeonMap[12] = [1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 6, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1];
    gameState.dungeonMap[13] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1];
    gameState.dungeonMap[14] = [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1];
    gameState.dungeonMap[15] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
    gameState.dungeonMap[16] = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1];
    gameState.dungeonMap[17] = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1];
    gameState.dungeonMap[18] = [1, 0, 1, 0, 0, 0, 1, 0, 1, 3, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1];
    gameState.dungeonMap[19] = [1, 0, 1, 0, 1, 1, 1, 0, 3, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1];
    gameState.dungeonMap[20] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1];
    gameState.dungeonMap[21] = [1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1];
    gameState.dungeonMap[22] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 4, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1];
    gameState.dungeonMap[23] = [1, 1, 1, 0, 0, 0, 2, 4, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1];
    gameState.dungeonMap[24] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1];
    gameState.dungeonMap[25] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
}

function readMapFromCookie(id) {
    let stream, elements;
    for (let m = 0; m <= 25; m++) {
        stream = getCookie(document, "dnd1file" + id + ".dungeonMap." + m);
        elements = stream.split("|");
        for (let n = 0; n <= 25; n++) gameState.dungeonMap[m][n] = parseInt(elements[n]);
    }
}

//load default dungeon where not locally saved
function loadDungeon(d) {
    terminal.println("READING DUNGEON # " + d);
    gameState.dungeonMap[0][0] = getCookie(document, "dnd1file" + d + ".dungeonMap.0");
    if (gameState.dungeonMap[0][0] === "") {
        defaultMap();
    } else {
        readMapFromCookie(d);
    }
    for (let m = 0; m <= 25; m++) {
        for (let n = 0; n <= 25; n++) {
            if (d !== 0) {
                console.info("M=" + m + " N=" + n);
                if (gameState.dungeonMap[m][n] === 0) {
                    if (rnd(0) >= 0.97) {
                        gameState.dungeonMap[m][n] = 7;
                    } else if (rnd(0) >= 0.97) {
                        gameState.dungeonMap[m][n] = 8;
                    }
                }
            }
        }
    }
    loadMonsters();
}

function gotResetInput() { //8
    J6 = Math.floor(inputString);
    terminal.print("PLAYERS NAME ");
    gameStateMachine.stateMode = 9;
    inputStr();
}

function gotNameInput() {
    characterName = inputString.trim();
    if (characterName === "SHAVS") {
        gameStateMachine.stateMode = 10;
    } else {
        gameStateMachine.stateMode = 4;
    }
}

function rollNew() {
    for (let M = 1; M <= 7; M++) {
        for (let N = 1; N <= 3; N++) {
            let R = int(rnd(6) + 1);
            gameState.attributes[M] = gameState.attributes[M] + R;
        }
        if (M === 7) {
            gameState.attributes[M] = gameState.attributes[M] * 15;
        }
        terminal.println(attributeNames[M] + "=" + gameState.attributes[M]);
    }
    gameStateMachine.stateMode = 10.5;
}

function pickClass() {
    terminal.println("");
    terminal.println("CLASSIFICATION");
    terminal.println("WHICH DO YOU WANT TO BE");
    terminal.print("FIGHTER ,CLERIC ,OR WIZARD ");
    gameStateMachine.stateMode = 11;
    inputStr();
}

function gotClassInput() {
    attributeNames[constants.playerHp] = inputString.trim();
    if (attributeNames[0] === "NONE") {
        for (let M = 0; M <= 7; M++) {
            gameState.attributes[M] = 0;
        }
        gameStateMachine.stateMode = 10;
    } else {
        switch (attributeNames[constants.playerClass]) {
            case "FIGHTER":
                gameStateMachine.stateMode = 12;
                break;
            case "CLERIC":
                gameStateMachine.stateMode = 13;
                break;
            case "WIZARD":
                gameStateMachine.stateMode = 14;
                break;
            default:
                gameStateMachine.stateMode = 10.5;
        }
    }
}

function gotFighter() {
    gameState.attributes[constants.playerHp] = int(rnd(8) + 1);
    gameStateMachine.stateMode = 15;
}

function gotCleric() {
    gameState.attributes[constants.playerHp] = int(rnd(6) + 1);
    gameStateMachine.stateMode = 15;
}

function gotWizard() {
    gameState.attributes[constants.playerHp] = int(rnd(4) + 1);
    gameStateMachine.stateMode = 15;
}

function shopTop() {
    terminal.println("BUYING WEAPONS");
    terminal.println("FAST OR NORM ");
    gameStateMachine.stateMode = 16;
    inputStr();
}

function gotShopFastNorm() {
    strQ = inputString.trim();
    if (strQ === "FAST") {
        gameStateMachine.stateMode = 18;
    } else {
        gameStateMachine.stateMode = 17;
    }
    terminal.println("NUMBER" + vbTab + "ITEM" + vbTab + "PRICE");
    terminal.println("-1-STOP");
}

function shopList() { //17
    for (let M = 1; M <= 15; M++) {
        terminal.println(M + vbTab + gameState.equipmentNames[M] + vbTab + equipmentPrice[M]);
    }
    gameStateMachine.stateMode = 18;
}

function shopping() { //18
    gameStateMachine.stateMode = 19;
    input();
}

function buyItem(item) {
    gameState.inventoryCounter++;
    gameState.attributes[constants.playerGold] -= equipmentPrice[item];
    terminal.println("GP= " + gameState.attributes[constants.playerGold]);
    gameState.inventory[gameState.inventoryCounter] = item;
}

function gotShoppingInput() {
    let inputInt = Math.floor(inputString);
    if (inputInt < 0 || inputInt > 15) {
        gameStateMachine.stateMode = 20; //stop shopping
    } else {
        if (gameState.attributes[constants.playerGold] < equipmentPrice[inputInt]) {
            terminal.println("COSTS TOO MUCH");
            terminal.println("TRY AGAIN ");
        } else {
            if (attributeNames[constants.playerClass] === "CLERIC") {
                if (inputInt === 4 || inputInt === 8 || inputInt === 9 || inputInt > 10) {
                    buyItem(inputInt);
                }
                else {
                    terminal.println("YOUR A CLERIC YOU CANT USE THAT ");
                }
            } else if (attributeNames[constants.playerClass] === "WIZARD") {
                if (inputInt === 3 || inputInt === 8 || inputInt > 10) {
                    buyItem(inputInt);
                }
                else {
                    terminal.println("YOUR A WIZARD YOU CANT USE THAT ");
                }
            } else {
                buyItem(inputInt);
            }
        }
        gameStateMachine.stateMode = 18;
    }
}

function showInvQuestion() {
    terminal.print("EQ LIST ");
    gameStateMachine.stateMode = 20.5;
    inputStr();
}

function gotInvQuestion() {
    strQ = inputString.trim();
    if (strQ === "NO") {
        gameStateMachine.stateMode = 22;
    } else {
        gameStateMachine.stateMode = 21;
    }
}

function showInventory() {
    for (let m = 1; m <= gameState.inventoryCounter; m++) {
        if (gameState.inventory[m] !== 0) {
            terminal.println(gameState.inventory[m] + vbTab + gameState.equipmentNames[gameState.inventory[m]]);
        }
    }
    gameStateMachine.stateMode = 22;
}

function showStats() {
    terminal.println("YOUR CHARACTERISTICS ARE:");
    terminal.println(attributeNames[constants.playerClass]);
    if (gameState.attributes[constants.playerHp] === 1) {
        gameState.attributes[constants.playerHp] = 2;
    }
    terminal.println("HIT POINTS" + vbTab + gameState.attributes[constants.playerHp]);
    terminal.println("");
    terminal.println("");
    gameStateMachine.stateMode = 23;
}

function welcome() {
    loadDungeon(gameState.Dn);
    terminal.println("");
    terminal.println("");
    terminal.println("");
    terminal.println("WELCOME TO DUNGEON #" + gameState.Dn);
    terminal.println("YOU ARE AT (" + mapY + "," + mapX + ")");
    terminal.println("");
    terminal.print("COMMANDS LIST" + vbTab);
    gameStateMachine.stateMode = 23.5;
    inputStr();
}

function gotCommandsQuestion() {
    strQ = inputString.trim();
    if (strQ === "YES") {
        gameStateMachine.stateMode = 24;
    } else {
        gameStateMachine.stateMode = 25;
    }
}

function showCommands() {
    terminal.println("");
    terminal.println("1=MOVE  2=OPEN DOOR  3=SEARCH FOR TRAPS AND SECRET DOORS");
    terminal.println("4=SWITCH WEAPON HN HAND  5=FIGHT");
    terminal.println("6=LOOK AROUND  7=SAVE GAME  8=USER MAGIC  9=BUY MAGIC");
    terminal.println("0=PASS  11=BUY H.P.");
    gameStateMachine.stateMode = 25;
}

function getCommand() { //25
    terminal.print("COMMAND=");
    gameStateMachine.stateMode = 26;
    input();
}

function gotCommand() {
    switch (parseInt(inputString.trim())) {
        case 1: // move
            gameStateMachine.stateMode = 45;
            break;
        case 2: // open door
            gameStateMachine.stateMode = 55;
            break;
        case 3: // search
            gameStateMachine.stateMode = 57;
            break;
        case 4: // change weapon
            gameStateMachine.stateMode = 58;
            break;
        case 5: // fight
            gameStateMachine.stateMode = 60;
            break;
        case 6: // look around
            gameStateMachine.stateMode = 75;
            break;
        case 7: // save game
            gameStateMachine.stateMode = 76;
            break;
        case 8: // use magic
            gameStateMachine.stateMode = 77;
            break;
        case 9: // buy magic
            gameStateMachine.stateMode = 92;
            break;
        case 10: // cheat show map
            gameStateMachine.stateMode = 99;
            break;
        case 11: // buy hp
            gameStateMachine.stateMode = 100;
            break;
        case 12: // cheat modify map
            gameStateMachine.stateMode = 102;
            break;
        case 0: //pass
            gameStateMachine.stateMode = 200;
            break;
        default:
            terminal.println("COME ON ");
            gameStateMachine.stateMode = 25;
            break;
    }
}

function getBASIC() { //30
    terminal.print(">");
    inputStr();
    gameStateMachine.stateMode = 31;
}

function gotBASIC() { //31
    strQ = inputString.trim();
    if (strQ === "RUN") {
        gameStateMachine.stateMode = 1;
    } else if (strQ === "CLS") {
        terminal.cls();
        gameStateMachine.stateMode = 30;
    } else {
        terminal.println("SYNTAX ERROR");
        gameStateMachine.stateMode = 30;
    }
}

function startMove() { //45
    terminal.println("YOU ARE AT " + mapY + " , " + mapX);
    terminal.println("  DOWN  RIGHT  LEFT  OR  UP");
    inputStr();
    gameStateMachine.stateMode = 46;
}

function gotMove() {
    strQ = inputString.trim();
    S = 0;
    T = 0;
    if (strQ === "RIGHT" || strQ === "R") {
        T = 1;
    }
    if (strQ === "LEFT" || strQ === "L") {
        T = -1;
    }
    if (strQ === "UP" || strQ === "U") {
        S = -1;
    }
    if (strQ === "DOWN" || strQ === "n") {
        S = 1;
    }
    if (S === 0 && T === 0) {
        gameStateMachine.stateMode = 45;
    } else {
        let look = gameState.dungeonMap[mapY + S][mapX + T];
        switch (look) {
            case 0:
                gameStateMachine.stateMode = 47; // space
                break;
            case 2:
                gameStateMachine.stateMode = 49; // trap
                break;
            case 3:
                gameStateMachine.stateMode = 50; // secret door
                break;
            case 7:
                gameStateMachine.stateMode = 51; // inc str
                break;
            case 8:
                gameStateMachine.stateMode = 52; // inc con
                break;
            case 5:
                gameStateMachine.stateMode = 53; // monster
                break;
            case 6:
                gameStateMachine.stateMode = 54; // gold
                break;
            default:
                gameStateMachine.stateMode = 48; // wall
                break;
        }
    }
}

function completeMove() {
    mapY += S;
    mapX += T;
    terminal.println("DONE");
    gameStateMachine.stateMode = 200;
}

function thud() {
    terminal.println("YOU RAN INTO A WALL");
    if ((rnd(12) + 1) > 9) {
        terminal.println("AND LOOSE 1 HIT POINT");
        attributes[constants.playerHp] -= 1;
    } else {
        terminal.println("BUT NO DAMAGE WAS INFLICTED");
    }
    gameStateMachine.stateMode = 200;
}

function itsATrap() {
    let m;
    terminal.println("OOPS A TRAP AND YOU FELL IN");
    if ((rnd(2)) < 2) {
        terminal.println("AND HIT POINTS LOOSE 1");
        attributes[constants.playerHp] -= 1;
    }
    terminal.println("I HOPE YOU HAVE SOME SPIKES AND PREFERABLY ROPE");
    terminal.println("LET ME SEE");
    let found1 = false;
    let found2 = false;
    for (m = 1; m <= inventoryCounter; m++) {
        if (inventory[m] === 12) {
            inventory[m] = 0;
            m = inventoryCounter + 1;
            found1 = true;
        }
    }
    if (found1) {
        for (m = 1; m <= inventoryCounter; m++) {
            if (inventory[m] === 11) {
                inventory[m] = 0;
                m = inventoryCounter + 1;
                found2 = true;
            }
        }
        if (found2) {
            terminal.println("GOOD BOTH");
            terminal.println("YOU MANAGE TO GET OUT EASY");
            terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
            gameStateMachine.stateMode = 45;
        } else {
            terminal.println("NO ROPE BUT AT LEAST SPIKES");
            let loop = true;
            while (loop) {
                if (int(rnd(3)) + 1 !== 2) {
                    terminal.println("YOU MANAGE TO GET OUT EASY");
                    terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
                    gameStateMachine.stateMode = 45;
                    loop = false;
                } else {
                    terminal.println("YOU FALL HALFWAY UP");
                    if (int(rnd(6)) > attributes[constants.playerStr] / 3) {
                        terminal.println("OOPS mapX.equipmentPrice. LOOSE 1");
                        attributes[0] -= 1;
                    }
                    terminal.println("TRY AGAIN ");
                }
            }
        }
    } else {
        terminal.println("NO SPIKES AH THAT'S TOO BAD 'CAUSE YOU'RE DEAD");
        terminal.println("[STOP]");
        gameStateMachine.stateMode = 30;
    }
}

function hush() {
    if (int(rnd(6)) < 1) { //check original code - only partial logic present
        terminal.println("YOU JUST RAN INTO A SECRET DOOR");
        terminal.println("AND OPENED IT");
        mapY += S;
        mapX += T;
        gameStateMachine.stateMode = 200;
    } else {
        gameStateMachine.stateMode = 48;
    }
}

function boost1() {
    gameState.attributes[constants.playerStr] += 1;
    gameState.dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        gameState.attributes[constants.playerHp] -= int(rnd(4) + 1);
        terminal.println("HP= " + gameState.attributes[constants.playerHp]);
    }
    gameStateMachine.stateMode = 47;
}

function boost2() {
    gameState.attributes[constants.playerCon] += 1;
    gameState.dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        gameState.attributes[0] -= int(rnd(0) * 4 + 1);
        terminal.println("HP= " + gameState.attributes[constants.playerHp]);
    }
    gameStateMachine.stateMode = 47;
}

function surprise() {
    terminal.println("YOU RAN INTO THE MONSTER");
    terminal.println("HE SHOVES YOU BACK");
    terminal.println("");
    if (int(rnd(2)) + 1 !== 2) {
        terminal.println("YOU LOOSE 6 HIT POINT ");
        gameState.attributes[constants.playerHp] -= 6
    }
    gameStateMachine.stateMode = 200;
}

function gold() {
    terminal.println("AH......GOLD......");
    let goldFind = int(rnd(500) + 10);
    terminal.println(goldFind + "PIECES");
    gameState.attributes[constants.playerGold] += goldFind;
    terminal.println("GP= " + gameState.attributes[constants.playerGold]);
    gameState.dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.printc("POISON");
        gameState.attributes[constants.playerHp] -= int(rnd(4) + 1);
        terminal.println("HP= " + gameState.attributes[constants.playerHp]);
    }
    gameStateMachine.stateMode = 47;
}

function openDoor() {
    terminal.println("DOOR LEFT RIGHT UP OR DOWN");
    gameStateMachine.stateMode = 56;
    inputStr();
}

function gotDoorMove() {
    strQ = inputString.trim();
    S = 0;
    T = 0;
    if (strQ === "RIGHT" || strQ === "R") {
        T = 1;
    }
    if (strQ === "LEFT" || strQ === "L") {
        T = -1;
    }
    if (strQ === "UP" || strQ === "U") {
        S = -1;
    }
    if (strQ === "DOWN" || strQ === "D") {
        S = 1;
    }
    if (S === 0 && T === 0) {
        gameStateMachine.stateMode = 55;
    } else {
        let look = gameState.dungeonMap[mapY + S][mapX + T];
        if (look === 3 || look === 4) {
            terminal.println("PUSH");
            if (int(rnd(20)) + 1 >= gameState.attributes[constants.playerStr]) {
                terminal.println("DIDNT BUDGE");
                gameStateMachine.stateMode = 200;
            } else {
                terminal.println("ITS OPEN");
                mapY += S;
                mapX += T;
                gameStateMachine.stateMode = 47;
            }
        } else {
            terminal.println("THERE IS NOT A DOOR THERE");
            gameStateMachine.stateMode = 25;
        }
    }
}

function searching() {
    terminal.println("SEARCH.........SEARCH...........SEARCH...........");
    Z = 0;
    if (int(rnd(40)) < gameState.attributes[constants.playerWis] + gameState.attributes[constants.playerInt]) {
        for (M = -1; M <= 1; M++) {
            for (N = -1; N <= 1; N++) {
                if (gameState.dungeonMap[mapY + M][mapX + N] === 2) {
                    terminal.println("YES THERE IS A TRAP");
                    terminal.println("IT IS " + M + "VERTICALLY  " + N + "HORIZONTALLY FROM YOU");
                    Z = 1;
                }
                if (gameState.dungeonMap[mapY + M][mapX + N] === 3) {
                    terminal.println("YES ITS A DOOR");
                    terminal.println("IT IS " + M + "VERTICALLY  " + N + "HORIZONTALLY");
                    Z = 1;
                }
            }
        }
    }
    if (Z === 0) terminal.println("NO NOT THAT YOU CAN TELL");
    gameStateMachine.stateMode = 200;
}

function swapWeapon() { //58
    terminal.println("WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON ");
    gameStateMachine.stateMode = 59;
    input();
}

function gotSwap() { //59
    inputInt = parseInt(inputString.trim());
    if (inputInt !== 0) {
        let originalChoice = gameState.currentWeaponIndex;
        let found = setCurrentWeapon(inputInt);
        if (found) {
            terminal.println("O.K. YOU ARE NOW HOLDING A " + gameState.equipmentNames[inputInt]);
            gameStateMachine.stateMode = 200;
        } else {
            gameState.currentWeaponIndex = originalChoice;
            terminal.println("SORRY YOU DONT HAVE THAT ONE");
            gameStateMachine.stateMode = 58;
        }
    } else {
        gameStateMachine.stateMode = 200;
    }
}

function resolveFight() { //60
    terminal.println("YOUR WEAPON IS " + gameState.equipmentNames[getCurrentWeapon()]);
    if (gameState.currentMonster === 0) {
        gameStateMachine.stateMode = 25;
    } else {
        terminal.println(gameState.monsterNames[gameState.currentMonster]);
        terminal.println("HP=" + gameState.monsterStats[gameState.currentMonster][3]);
        if (getCurrentWeapon() === 0) {
            gameStateMachine.stateMode = 61;
        }
        if (getCurrentWeapon() === 1) {
            gameStateMachine.stateMode = 62;
        }
        if (getCurrentWeapon() === 2) {
            gameStateMachine.stateMode = 63;
        }
        if (getCurrentWeapon() === 3) {
            gameStateMachine.stateMode = 64;
        }
        if (getCurrentWeapon() === 4) {
            gameStateMachine.stateMode = 65;
        }
        if (getCurrentWeapon() > 4 && getCurrentWeapon() < 15) { //no weapon
            gameStateMachine.stateMode = 66;
        }
        if (getCurrentWeapon() === 15) {
            terminal.println("FOOD ???.... WELL O.K.");
            terminal.print("IS IT TO HIT OR DISTRACT");
            gameStateMachine.stateMode = 67;
            inputStr();
        }
    }
}

function knuckles() { //61
    terminal.println("DO YOU REALIZE YOU ARE BARE HANDED");
    terminal.print("DO YOU WANT TO MAKE ANOTHER CHOICE");
    gameStateMachine.stateMode = 68;
    inputStr();
}

function swingASword() { //62
    terminal.println("SWING");
    findRange();
    if (range >= 2) {
        terminal.println("HE IS OUT OF RANGE");
        gameStateMachine.stateMode = 200;
    } else {
        switch (toHitRoll) {
            case 0:
                terminal.println("MISSED TOTALLY");
                gameStateMachine.stateMode = 200;
                break;
            case 1:
                terminal.println("NOT GOOD ENOUGH");
                gameStateMachine.stateMode = 25;
                break;
            case 2:
                terminal.println("GOOD HIT");
                gameState.monsterStats[currentMonster][3] -= int(gameState.attributes[constants.playerStr] * 4 / 5);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                gameState.monsterStats[currentMonster][3] -= int(gameState.attributes[constants.playerStr] / 2);
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function swingABigSword() { //63
    terminal.println("SWING");
    findRange();
    if (range > 2) {
        terminal.println("HE IS OUT OF RANGE");
        gameStateMachine.stateMode = 200;
    } else {
        switch (toHitRoll) {
            case 0:
                terminal.println("MISSED TOTALLY");
                gameStateMachine.stateMode = 200;
                break;
            case 1:
                terminal.println("HIT BUT NOT WELL ENOUGH");
                gameStateMachine.stateMode = 25;
                break;
            case 2:
                terminal.println("HIT");
                gameState.monsterStats[currentMonster][3] -= int(gameState.attributes[constants.playerStr] * 5 / 7);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                gameState.monsterStats[currentMonster][3] -= gameState.attributes[constants.playerStr];
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function pokeADagger() { //64
    if (getCurrentWeapon() !== 3) {
        terminal.println("YOU DONT HAVE A DAGGER");
    } else {
        findRange();
        if (range > 5) { //Then Goto 04710 'OUT OF RANGE
            terminal.println("HE IS OUT OF RANGE");
        } else {
            switch (toHitRoll) {
                case 0:
                    terminal.println("MISSED TOTALLY");
                    break;
                case 1:
                    terminal.println("HIT BUT NO DAMAGE");
                    break;
                case 2:
                    terminal.println("HIT");
                    gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] / 4);
                    break;
                default:
                    terminal.println("CRITICAL HIT");
                    gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] * 3 / 10);
                    break;
            }
            if (range >= 2) {
                gameState.inventory[gameState.currentWeaponIndex] = 0;
                gameState.currentWeaponIndex = -1;
                for (M = 1; M <= gameState.inventoryCounter; M++)
                    if (gameState.inventory[M] === 3)
                        gameState.currentWeaponIndex = M;
            }
        }
    }
    gameStateMachine.stateMode = 200;
}

function swingAMace() { //65
    terminal.println("SWING");
    findRange();
    if (range >= 2) {
        terminal.println("HE IS OUT OF RANGE");
        gameStateMachine.stateMode = 200;
    } else {
        switch (toHitRoll) {
            case 0:
                terminal.println("MISS");
                gameStateMachine.stateMode = 200;
                break;
            case 1:
                terminal.println("HIT BUT NO DAMAGE");
                gameStateMachine.stateMode = 25;
                break;
            case 2:
                terminal.println("HIT");
                gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] * 5 / 11);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] * 4 / 9);
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function improvise() { //66
    let found = (getCurrentWeapon() > 0);
    if (!found) {
        terminal.println("NO WEAPON FOUND");
        gameStateMachine.stateMode = 25;
    } else {
        findRange();
        switch (getCurrentWeapon()) {
            case 5:
                R3 = 10;
                R4 = 3 / 7;
                R5 = 5 / 11;
                gameStateMachine.stateMode = 69;
                break;
            case 6:
                R3 = 15;
                R4 = 3 / 7;
                R5 = 5 / 11;
                found = false;
                let arrowIndex = -1;
                for (let i = 0; (i <= gameState.inventoryCounter && !found); i++)
                    if (gameState.inventory[i] === 7) {
                        arrowIndex = i;
                        found = true;
                    }
                if (!found) {
                    terminal.println("MISS");
                    gameStateMachine.stateMode = 71;
                } else {
                    gameState.inventory[arrowIndex] = 0;
                    gameStateMachine.stateMode = 69;
                }
                break;
            case 7:
                R3 = 1.5;
                R4 = 1 / 7;
                R5 = 1 / 5;
                gameStateMachine.stateMode = 69;
                break;
            case 8:
                R3 = 4;
                R4 = 1 / 10;
                R5 = 1 / 8;
                gameStateMachine.stateMode = 69;
                break;
            case 9:
                R3 = 4;
                R4 = 1 / 7;
                R5 = 1 / 6;
                gameStateMachine.stateMode = 69;
                break;
            case 10:
                R3 = 3;
                R4 = 1 / 8;
                R5 = 1 / 5;
                gameStateMachine.stateMode = 69;
                break;
            case 11:
                R3 = 5;
                R4 = 1 / 9;
                R5 = 1 / 6;
                gameStateMachine.stateMode = 69;
                break;
            case 12:
                R3 = 8;
                R4 = 1 / 9;
                R5 = 1 / 4;
                gameStateMachine.stateMode = 69;
                break;
            case 13:
                R3 = 6;
                R4 = 1 / 3;
                R5 = 2 / 3;
                gameStateMachine.stateMode = 69;
                break;
            default: //14
                terminal.print("AS A CLUB OR SIGHT");
                gameStateMachine.stateMode = 70;
                inputStr();
                break;
        }
    }
}

function throwFood() { //67
    strQ = inputString.trim();
    if (strQ === "HIT") {
        gameStateMachine.stateMode = 72;
    } else {
        terminal.print("THROW A-ABOVE,B-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER");
        Z5 = 0;
        gameStateMachine.stateMode = 73;
        inputStr();
    }
}

function knucklehead() { //68
    strQ = inputString.trim();
    if (strQ !== "NO") {
        gameStateMachine.stateMode = 25;
    } else {
        terminal.println("O.K. PUNCH BITE SCRATCH HIT ........");
        let m = 0;
        let n = 0;
        for (M = -1; M <= 1; M++) {
            for (N = -1; N <= 1; N++) {
                if (gameState.dungeonMap[mapY + M][mapX + N] === 5) {
                    m = M;
                    M = 2;
                    n = N;
                    N = 2;
                }
            }
        }
        if (m === 0 && n === 0) {
            terminal.println("NO GOOD ONE");
            gameStateMachine.stateMode = 25;
        } else {
            if (int(rnd(0) * 20) + 1 > gameState.monsterStats[gameState.currentMonster][2]) {
                terminal.println("GOOD A HIT");
                gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] / 6);
                gameStateMachine.stateMode = 25;
            } else {
                terminal.println("TERRIBLE NO GOOD");
                gameStateMachine.stateMode = 200;
            }
        }
    }
}

function resolveImprov() { //69
    if (range > R3) {
        terminal.println("HE IS OUT OF RANGE");
        gameStateMachine.stateMode = 200;
    } else {
        switch (toHitRoll) {
            case 0:
                terminal.println("MISS");
                break;
            case 1:
                terminal.println("HIT BUT NO DAMAGE");
                break;
            case 2:
                terminal.println("HIT");
                gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] * R4);
                break;
            default:
                terminal.println("CRITICAL HIT");
                gameState.monsterStats[gameState.currentMonster][3] -= int(gameState.attributes[constants.playerStr] * R5);
                break;
        }
        gameStateMachine.stateMode = 71;
    }
}

function gotSilverCross() { //70
    strQ = inputString.trim();
    if (strQ === "SIGHT") {
        if (range < 10) {
            terminal.println("THE MONSTER IS HURT");
            R5 = 1 / 6;
            if (gameState.currentMonster === 2 || gameState.currentMonster === 10 || gameState.currentMonster === 4) {
                toHitRoll = 3;
            } else {
                toHitRoll = 1;
            }
            range = R3 - 1;
            gameStateMachine.stateMode = 69;
        } else {
            terminal.println("FAILED");
            gameStateMachine.stateMode = 200;
        }
    } else {
        if (getCurrentWeapon() === 14) {
            R3 = 1.5;
            R4 = 1 / 3;
            R5 = 1 / 2;
            gameStateMachine.stateMode = 69;
        } else {
            terminal.println("NO WEAPON FOUND");
            gameStateMachine.stateMode = 25;
        }
    }
}

/***
 * Uses up the player's weapon when used at range
 */
function consumeWpn() { //71 //line 6300
    if (getCurrentWeapon() === 14) { //silver cross as sight
        gameStateMachine.stateMode = 200;
    } else {
        let weapon = getCurrentWeapon();
        gameState.inventory[gameState.currentWeaponIndex] = 0;
        if (weapon !== 7) { //not arrows
            setCurrentWeapon(0);
        } else {
            setCurrentWeapon(7);
        }
        if (toHitRoll > 0) {
            gameStateMachine.stateMode = 25;
        } else {
            gameStateMachine.stateMode = 200;
        }
    }
}

/***
 * Pelt the monster with food to damage it
 */
function peltMonster() { //72
    if (int(rnd(20)) + 1 === 20) {
        terminal.println("DIRECT HIT");
        gameState.monsterStats[gameState.currentMonster][constants.monsterHp] -= int(gameState.attributes[constants.playerStr] / 6);
    } else if (int(rnd(20)) + 1 > gameState.monsterStats[gameState.currentMonster][2] - gameState.attributes[constants.playerDex] / 3) {
        terminal.println("HIT");
        gameState.monsterStats[gameState.currentMonster][constants.monsterHp] -= int(gameState.attributes[constants.playerStr] / 8);
    } else if (int(rnd(20)) + 1 > 10 - gameState.attributes[constants.playerDex] / 3) {
        terminal.println("YOU HIT HIM BUT NOT GOOD ENOUGH");
    } else {
        terminal.println("TOTAL MISS");
    }
    gameStateMachine.stateMode = 74;
}

/***
 * Bait the monster with food to steer it
 */
function kiteMonster() { //73
    strQ = inputString.trim();
    if (strQ === "B") {
        S = -1;
        T = 0;
    } else if (strQ === "A") {
        S = 1;
        T = 0;
    } else if (strQ === "L") {
        S = 0;
        T = -1;
    } else if (strQ === "R") {
        S = 0;
        T = 1;
    }
    let look = gameState.dungeonMap[gameState.F1 + S][gameState.F2 + T];
    if (look === 0) {
        terminal.println("MONSTER MOVED BACK");
        gameState.dungeonMap[gameState.F1][gameState.F2] = 0;
        gameState.F1 += S;
        gameState.F2 += T;
        gameState.dungeonMap[gameState.F1][gameState.F2] = 5;
    } else if (look === 2) { //Then Goto 04280
        terminal.println("GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD");
        K1 = -1;
        gameState.monsterStats[gameState.currentMonster][constants.monsterHp] = 0;
        gameState.dungeonMap[gameState.F1][gameState.F2] = 0; //bug - monster stayed on map
        //stateMode = 200; //bug - kept the food
    } else {
        terminal.println("DIDN'T WORK");
    }
    gameStateMachine.stateMode = 74;
}

/***
 * Use up the food being equipped after baiting a monster
 */
function consumeFood() { //74
    if (Z5 === 0) {
        for (M = 1; M <= gameState.inventoryCounter; M++) {
            let weapon = getCurrentWeapon();
            gameState.inventory[gameState.currentWeaponIndex] = 0;
            setCurrentWeapon(weapon);
        }
    }
    gameStateMachine.stateMode = 200;
}

/***
 * Display the surroundings of the player
 * Obscure secret details
 */
function looking() { //75
    let line, m, n;
    for (M = -5; M < 6; M++) {
        line = "";
        for (N = -5; N < 6; N++) {
            m = M + mapY;
            n = N + mapX;
            if (inBounds(m, n)) {
                if ((M === 0) && (N === 0)) {
                    line += "9";
                } else {
                    switch (gameState.dungeonMap[m][n]) {
                        case 3:
                            line += "1";
                            break;
                        case 2:
                        case 7:
                        case 8:
                            line += "0";
                            break;
                        default:
                            line += gameState.dungeonMap[m][n];
                    }
                }
            }
        }
        if (line !== "") terminal.println(line);
    }
    gameStateMachine.stateMode = 200;
}

function saveGame() { //76
    gameState.serialiseToCookie(Document, 'dnd1file7', cookieLifespan);
    gameStateMachine.stateMode = 25;
}

function casting() { //77
    terminal.println("MAGIC");
    if (getCurrentWeapon() !== 0) { //Then Goto 08740
        terminal.println("YOU CANT USE MAGIC WITH WEAPON IN HAND");
        gameStateMachine.stateMode = 200;
    } else if (attributeNames[constants.playerClass] === "CLERIC") {
        terminal.print("CLERICAL SPELL #");
        gameStateMachine.stateMode = 78;
        input();
    } else if (attributeNames[constants.playerClass] === "WIZARD") {
        terminal.print("SPELL #");
        gameStateMachine.stateMode = 87;
        input();
    } else {
        terminal.println("YOU CANT USE MAGIC YOUR NOT A M.U.");
        gameStateMachine.stateMode = 200;
    }
}

function gotClericSpell() { //78
    Q = parseInt(inputString.trim());
    let found = false;
    let spellChoice;
    for (let m = 1; m <= gameState.clericSpellCounter; m++) {
        if (Q === gameState.clericSpellbook[m]) {
            M = m;
            found = true;
            m = gameState.clericSpellCounter + 1;
        }
    }
    if (!found) {
        terminal.println("YOU DONT HAVE THAT SPELL");
        gameStateMachine.stateMode = 200;
    } else {
        spellChoice = gameState.clericSpellbook[M];
        gameState.clericSpellbook[M] = 0;
        //route clerical spell choice
        if (spellChoice > 3) {
            Q = 2;
        } //bug fix - find all spell uses Q to match floor tile types, not Q2 or Q3
        if (spellChoice > 4) {
            Q = 3;
        }
        switch (spellChoice) {
            case 1:
                gameStateMachine.stateMode = 79;
                break;
            case 2:
                gameStateMachine.stateMode = 80;
                break;
            case 3:
                gameStateMachine.stateMode = 81;
                break;
            case 4:
                gameStateMachine.stateMode = 82;
                break;
            case 5:
                gameStateMachine.stateMode = 83;
                break;
            case 6:
                gameStateMachine.stateMode = 84;
                break;
            case 7:
                gameStateMachine.stateMode = 85;
                break;
            case 8:
                gameStateMachine.stateMode = 82;
                break;
            case 9: //cheat - there is no spell #9 for clerics, this is the push spell
                gameStateMachine.stateMode = 86;
                break;
            default:
                terminal.println("YOU DONT HAVE THAT SPELL");
                gameStateMachine.stateMode = 200;
                break;
        }
    }
}

function clericSpellKill() { //79
    if (rnd(3) > 1) {
        terminal.println("FAILED");
    } else {
        terminal.println("DONE");
        K1 = -1;
    }
    gameState.clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpellMagicMissileAdvanced() { //80
    terminal.println("DONE");
    gameState.monsterStats[currentMonster][constants.monsterHp] -= 4;
    gameState.clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpellCureLight() { //81
    gameState.attributes[constants.playerCon] += 3;
    gameState.clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpellFindTraps() { //82
    gameState.clericSpellbook[M] = 0;
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (!((mapY + M < 0) || (mapY + M > 25) || (mapX + N < 0) || (mapX + N > 25))) {
                if (gameState.dungeonMap[mapY + M][mapX + N] === Q)
                    terminal.println("THERE IS ONE AT " + (mapY + M) + "LAT." + (mapX + N) + "LONG.");
            }
        }
    }
    terminal.println("NO MORE");
    gameStateMachine.stateMode = 200;
}

function clericSpellMagicMissile() { //83
    terminal.println("DONE");
    gameState.clericSpellbook[M] = 0;
    gameState.monsterStats[currentMonster][constants.monsterHp] -= 2;
    gameStateMachine.stateMode = 200;
}

function clericSpellMagicMissileUltimate() { //84
    terminal.println("DONE");
    gameState.clericSpellbook[M] = 0;
    gameState.monsterStats[currentMonster][constants.monsterHp] -= 6;
    gameStateMachine.stateMode = 200;
}

function clericSpellCureLightAdvanced() { //85
    terminal.println("DONE");
    gameState.attributes[constants.playerCon] += 3;
    gameStateMachine.stateMode = 200;
}

function clericSpell9() { //86
    if (gameState.currentMonster === 4 || gameState.currentMonster === 10) {
        terminal.println("DONE");
        terminal.println("YOU DONT HAVE THAT ONE");
        gameStateMachine.stateMode = 25;
    } else {
        terminal.println("FAILED");
        gameStateMachine.stateMode = 200;
    }
}

function gotWizardSpell() { //87  //09320
    Q = parseInt(inputString.trim());
    let found = false;
    for (let m = 1; m <= gameState.wizardSpellCounter; m++) {
        if (Q === gameState.wizardSpellbook[m]) {
            found = true;
            M = m;
            m = gameState.wizardSpellCounter + 1;
        }
    }
    if (found) {  //09380
        if (gameState.wizardSpellbook[M] === 1) { // push
            // var F2 = 0;
            if ((gameState.F1 - mapY === 0) && (gameState.F2 - mapX === 0)) {
                S = 0;
                T = 0;
                Z5 = 1; // stop food being used at end of bait action
                inputString = "";
            } else {
                terminal.println("ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
                inputStr();
            }
            gameStateMachine.stateMode = 73;
        } else {
            R = 5;
            switch (gameState.wizardSpellbook[M]) {
                case 2:
                    gameStateMachine.stateMode = 88;
                    break;
                case 3:
                    Q = 2;
                    gameStateMachine.stateMode = 89;
                    break;
                case 4:
                    Q = 2;
                    gameStateMachine.stateMode = 90;
                    break;
                case 5:
                    Q = 0;
                    gameStateMachine.stateMode = 91.5;
                    break;
                case 6:
                    Q = 3;
                    gameStateMachine.stateMode = 83; // shared with cleric
                    break;
                case 7:
                    Q = 6;
                    gameStateMachine.stateMode = 80; // shared with cleric
                    break;
                case 8:
                    Q = 9;
                    gameStateMachine.stateMode = 84; // shared with cleric
                    break;
                case 9:
                    Q = 3;
                    gameStateMachine.stateMode = 89;
                    break;
                case 10:
                    Q = 1;
                    gameStateMachine.stateMode = 91.5;
                    break;
                default:
                    terminal.println("YOU DONT HAVE THAT ONE");
                    gameStateMachine.stateMode = 25;
                    break;
            }
        }
    } else {
        terminal.println("YOU DONT HAVE THAT ONE");
        gameStateMachine.stateMode = 25;
    }
}

function wizardSpellKill() { //88 KILL
    if (rnd(3) > 1) {
        terminal.println("DONE");
        K1 = -1;
    } else {
        terminal.println("FAILED");
    }
    gameStateMachine.stateMode = 200;
}

function wizardSpellFindTrap() { //89 find traps
    gameState.wizardSpellbook[M] = 0; //?
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (inBounds(mapY + M, mapX + N))
                if (gameState.dungeonMap[mapY + M][mapX + N] === Q) terminal.println("THERE IS ONE AT " + (mapY + M) + "LAT." + (mapX + N) + "LONG.");
        }
    }
    terminal.println("NO MORE");
    gameStateMachine.stateMode = 200;
}

function wizardSpellTeleport() { //90 teleport
    gameStateMachine.stateMode = 91;
    getSpellCoordinates();
}

function gotTeleportCoordinates() { //91 teleport
    M = parseInt(inputStrings[1]);
    N = parseInt(inputStrings[0]);
    if (inBounds(M, N)) {
        terminal.println("DONE");
        mapY = M;
        mapX = N;
    } else {
        terminal.println("FAILED");
    }
    gameStateMachine.stateMode = 200;
}

function getSpellCoordinates() {
    terminal.print("INPUT CO-ORDINATES");
    inputX(2);
}

function gotSpellChange() { //91.5
    terminal.print("INPUT CO-ORDINATES");
    gameStateMachine.stateMode = 91.6;
    getSpellCoordinates();
}

function gotChangeCoordinates() { //91.6
    let toCell;
    let fromCell;
    if (Q === 1) {
        fromCell = 0;
        toCell = 1;
    } else {
        fromCell = 1;
        toCell = 0;
    }
    M = parseInt(inputStrings[1]);
    N = parseInt(inputStrings[0]);
    if (inBounds(M, N)) {
        if (gameState.dungeonMap[M][N] === fromCell) {
            gameState.dungeonMap[M][N] = toCell;
            terminal.println("DONE");
        } else {
            terminal.println("FAILED");
        }
    } else {
        terminal.println("FAILED");
    }
    gameStateMachine.stateMode = 200;
}

function buyMagic() { //92
    if (attributeNames[constants.playerClass] === "CLERIC") {
        gameStateMachine.stateMode = 93;
    } else if (attributeNames[constants.playerClass] === "WIZARD") {
        gameStateMachine.stateMode = 94;
    } else {
        terminal.println("YOU CANT BUY ANY");
        gameStateMachine.stateMode = 25;
    }
}

function askACleric() { //93
    terminal.println("DO YOU KNOW THE CHOICES");
    inputStr();
    gameStateMachine.stateMode = 95;
}

function askAWizard() { //94
    terminal.println("DO YOU KNOW THE SPELLS");
    inputStr();
    gameStateMachine.stateMode = 96;
}

function clericSpellChoices() { //95
    strQ = inputString.trim();
    if (strQ === "NO") {
        terminal.println("1-KILL-500  5-MAG. MISS. #1-100");
        terminal.println("2-MAG. MISS. #2-200  6-MAG.MISS. #3-300");
        terminal.println("3-CURE LIGHT #1-200  7-CURE LIGHT #2-1000");
        terminal.println("4-FIND ALL TRAPS-200  8-FIND ALL S.DOORS-200");
        terminal.print("INPUT # WANTED   NEG.NUM.TO STOP");
    }
    input();
    gameStateMachine.stateMode = 97;
}

function wizardSpellChoices() { //96
    strQ = inputString.trim();
    if (strQ === "NO") {
        terminal.println("1-PUSH-75   6-MAG. MISS. #1-100");
        terminal.println("2-KIHL-500  7-MAG. MISS. #2-200");
        terminal.println("3-FIND TRAPS-200  8-MAG. MISS. #3-300");
        terminal.println("4-TELEPORT-750  9-FIND S.DOORS-200");
        terminal.println("5-CHANGE 1+0-600  10-CHANGE 0+1-600");
        terminal.print("#OF ONE YOU WANT  NEG.NUM.TO STOP");
    }
    input();
    gameStateMachine.stateMode = 98;
}

function clericSpellPurchase() { //97
    if (Q > 0) { //Then Goto 10290
        if (Q <= 8) { //Then Goto 10100
            if (gameState.attributes[constants.playerGold] - clericSpellPrices[int(Q)] < 0) {// Then Goto 10270
                terminal.println("COSTS TOO MUCH");
            } else {
                gameState.attributes[constants.playerGold] -= clericSpellPrices[int(Q)];
                terminal.println("IT IS YOURS");
                gameState.clericSpellbook[gameState.clericSpellCounter] = int(Q);
                gameState.clericSpellCounter += 1;
            }
        }
        input();
        gameStateMachine.stateMode = 97;
    } else {
        terminal.println("YOUR SPELLS ARE");
        for (M = 1; M <= gameState.clericSpellCounter; M++) {
            if (gameState.clericSpellbook[M] !== 0) terminal.println("#" + gameState.clericSpellbook[M]);
        }
        terminal.println("DONE");
        gameStateMachine.stateMode = 25;
    }
}

function wizardSpellPurchase() { //98
    if (Q > 0) {
        if (Q <= 10) {
            if (gameState.attributes[constants.playerGold] - wizardSpellPrices[int(Q)] < 0) {
                terminal.println("COSTS TOO MUCH");
            } else {
                gameState.attributes[constants.playerGold] -= wizardSpellPrices[int(Q)];
                terminal.println("IT IS YOURS");
                gameState.wizardSpellCounter += 1;
                gameState.wizardSpellbook[gameState.wizardSpellCounter] = int(Q);
            }
        }
        input();
        gameStateMachine.stateMode = 98;
    } else {
        terminal.println("YOU NOW HAVE");
        for (M = 1; M <= wizardSpellCounter; M++) {
            if (gameState.wizardSpellbook[M] !== 0) terminal.println("#" + gameState.wizardSpellbook[M]);
        }
        gameStateMachine.stateMode = 25;
    }
}

function showCheatMap() { //99 - cheating
    let line;
    for (M = 0; M <= 25; M++) {
        line = "";
        for (N = 0; N <= 25; N++) line += gameState.dungeonMap[M][N];
        terminal.println(line);
    }
    gameStateMachine.stateMode = 25;
}

function buyHP() { //100
    terminal.print("HOW MANY 200 GP. EACH ");
    input();
    gameStateMachine.stateMode = 101;
}

function addHP() { //101
    Q = parseInt(inputString.trim());
    if (gameState.attributes[7] - 200 * Q < 0) {
        terminal.println("NO");
        gameStateMachine.stateMode = 100;
    } else {
        gameState.attributes[constants.playerHp] += int(Q);
        gameState.attributes[constants.playerGold] -= int(Q) * 200;
        terminal.println("OK DONE");
        terminal.println("HP= " + gameState.attributes[0]);
        for (M = 1; M <= 7; M++) terminal.println(attributeNames[M] + "= " + gameState.attributes[M]);
        gameStateMachine.stateMode = 200;
    }
}

function modifyMap() { //102
    terminal.print("DNG");
    input();
    gameStateMachine.stateMode = 102.5;
}

function modifyGotMap() { //102.5
    gameState.Dn = parseInt(inputString.trim());
    gameStateMachine.stateMode = 103;
}

function modifyMapPos() { //103
    terminal.print("X,Y,C");
    inputX(3);
    gameStateMachine.stateMode = 104;
}

function modifyMapDone() { //104
    let targetX = parseInt(inputStrings[2]);
    let targetY = parseInt(inputStrings[1]);
    let content = parseInt(inputStrings[0]);
    if (content < 0) {
        terminal.println("SAVE");
        input();
        gameStateMachine.stateMode = 105;
    } else {
        gameState.dungeonMap[targetY][targetX] = content;
        gameStateMachine.stateMode = 103;
    }
}

function modifyMapSave() {
    let stream;
    Q = parseInt(inputString.trim());
    if (Q === 1) {
        let DName = "dnd1file" + gameState.Dn + ".dungeonMap.";
        for (M = 0; M <= 25; M++) {
            stream = "";
            for (N = 0; N <= 25; N++) {
                if (gameState.dungeonMap[M][N] !== 7 && gameState.dungeonMap[M][N] !== 8) {
                    stream += gameState.dungeonMap[M][N] + "|";
                } else {
                    stream += "0|";
                }
            }
            setCookie(Document, DName + M, stream, cookieLifespan);
        }
    }
    gameStateMachine.stateMode = 200;
}

function checkPlayerHealth() {
    if (gameState.attributes[constants.playerHp] < 2) { // low on health
        if (gameState.attributes[constants.playerHp] < 1) { // bleeding out
            while (gameState.attributes[constants.playerHp] < 0) {
                if (gameState.attributes[constants.playerCon] < 9) {
                    gameState.attributes[constants.playerHp] = 0;
                    gameState.attributes[constants.playerCon] = 0; //exit loop, force dead
                } else {
                    gameState.attributes[constants.playerCon] -= 2;
                    gameState.attributes[constants.playerHp] += 1;
                }
            }
            if (gameState.attributes[constants.playerHp] === 0) {
                if (gameState.attributes[constants.playerCon] < 9) {
                    terminal.println("SORRY YOUR DEAD");
                    gameStateMachine.stateMode = 30;
                } else {
                    terminal.println("H.P.=0 BUT CONST. HOLDS");
                }
            }
        } else {
            terminal.println("WATCH IT H.P.=" + gameState.attributes[constants.playerHp]);
        }
    }
}

function testForCloneMove() { // 50% change to start a clone move
    if (rnd(20) > 10) gameStateMachine.stateMode = 202; else gameStateMachine.stateMode = 25;
}

/***
 * Route game move
 * One of the trickier pieces of code to decipher
 *
 */
function routeGameMove() { //200
    gameStateMachine.stateMode = 0;
    if (K1 === -1) { // if target is dead credit the kill
        gameStateMachine.stateMode = 203;
    } else { //check player health and report
        checkPlayerHealth();
    }
    if (gameStateMachine.stateMode === 0) {
        if (gameState.currentMonster > 0) { // 07160
            gameStateMachine.stateMode = 206;    //monster action (actual move)
        } else if (!(mapY === 1 && mapX === 12)) {
            testForCloneMove();
        } else {
            terminal.println("SO YOU HAVE RETURNED");
            if (gameState.attributes[constants.playerGold] < 100) {
                testForCloneMove();
            } else {
                gameState.attributes[constants.playerGold] -= 100;
                terminal.println("WANT TO BUY MORE EQUIPMENT");
                inputStr();
                gameStateMachine.stateMode = 201;
            }
        }
    }
}

/***
 * Response to user input to buy more equipment
 */
function gotMoreEquipment() { //201
    strQ = inputString.trim();
    if (strQ === "YES") {
        terminal.println("YOUR H.P. ARE RESTORED 2 POINTS");
        gameState.attributes[constants.playerHp] += 2;
        gameStateMachine.stateMode = 18;
    } else {
        testForCloneMove();
    }
}

/***
 * Moves one monster - not so much a move as a clone as it
 * potentially leaves a "5" on the map elsewhere.
 * Scan all living monsters and give each one a 7.5% change to "move"
 * Make 50 attempts and stop after the first successful move
 */
function monsterMove() { //202
    let moved = false;
    let alive = false;
    let Z7 = 1;
    while (!moved && Z7 <= 50) {
        M = 1;
        while (!moved && M <= 10) {
            if (gameState.monsterStats[M][constants.monsterHp] > 0) {
                alive = true;
                if (rnd(0) > 0.925) {
                    moved = true;
                    gameStateMachine.stateMode = 204;
                    M--; // retard M for a moment to give the right result at the end of the routine
                }
            }
            M++;
        }
        Z7++;
    }
    if (!moved) {
        if (!alive) {
            terminal.println("ALL MONSTERS DEAD");
            terminal.print("RESET?");
            inputStr();
            gameStateMachine.stateMode = 205;
        } else {
            gameStateMachine.stateMode = 200;
        }
    }
}

function confirmedKill() { //203
    K1 = 0;
    const current = gameState.currentMonster;
    gameState.attributes[constants.playerGold] += gameState.monsterStats[current][constants.monsterStartHp];
    gameState.F1 = 0;
    gameState.F2 = 0;
    terminal.println("GOOD WORK YOU JUST KILLED A " + gameState.monsterNames[current]);
    terminal.println("AND GET " + gameState.monsterStats[current][constants.monsterStartHp] + "GOLD PIECES");
    if (J6 !== 1) gameState.monsterStats[current][constants.monsterStartHp] = 0;
    terminal.println("YOU HAVE" + gameState.attributes[constants.playerGold] + " GOLD ");
    gameState.monsterStats[current][constants.monsterHp] = 0;
    if (J6 === 1) {
        gameState.monsterStats[current][3] = gameState.monsterStats[gameState.currentMonster][4]
            * gameState.monsterStats[gameState.currentMonster][1];
        gameState.monsterStats[current][constants.monsterHp] = gameState.monsterStats[current][constants.monsterStartHp]
            * gameState.monsterStats[current][1];
    }
    gameState.currentMonster = 0;
    gameStateMachine.stateMode = 25;
}

/***
 * scans map around player and creates current monster at a random location
 * Sets up F1 and F2 after spawn prior to action check
 */
function makeAMonster() { //204 line 8000
    let loopCounter = 0;
    gameState.currentMonster = M; // value carried from move a monster (202)
    let moved = false;
    while (!moved) { //dangerous - but statistically should never lock unless it is a very poor map
        loopCounter++; //stop it locking permanently
        let M1 = int(rnd(5) + 3); //select a random range 3-7
        M = M1 * -1; // vertical from negative range to positive range
        while (!moved && M <= M1) {
            N = M1 * -1; // horizontal from negative range to positive range
            while (!moved && N <= M1) {
                if (Math.abs(M) > 2 || Math.abs(N) > 2) { // if outside attack range
                    if (inBounds(mapY + M, mapX + N)) {
                        if (rnd(0) <= 0.7) { // 70% chance
                            if (gameState.dungeonMap[mapY + M][mapX + N] === 0) { //if cell is empty
                                moved = true;
                                spawnMonsterAt(mapY + M, mapX + N);
                            }
                        }
                    }
                }
                N++;
            }
            M++;
        }
        if (loopCounter > 10) {
            moved = true;
        } //break out of loop
    }
    gameStateMachine.stateMode = 200;
    return loopCounter;
}

/***
 * Sets a map cell to 5 (monster)
 * @param Y
 * @param X
 */
function spawnMonsterAt(Y, X) {
    gameState.dungeonMap[Y][X] = 5;
    gameState.F1 = Y;
    gameState.F2 = X;
}

/***
 * on "yes":
 * resets monsters, increases difficulty level
 * else quit
 */
function resetAfterClear() { //205
    strQ = inputString.trim();
    if (strQ === "YES") {
        // reset
        difficultyFactor += 1; //up difficultly level
        for (let m = 1; m <= 10; m++) {
            gameState.monsterStats[m][3] = gameState.monsterStats[m][4] * difficultyFactor;
            gameState.monsterStats[m][constants.monsterHp] = gameState.monsterStats[m][constants.monsterStartHp] * difficultyFactor;
        }
        gameState.attributes[constants.playerHp] += 5;
        gameStateMachine.stateMode = 25;
    } else {
        gameStateMachine.stateMode = 30;
        terminal.println("[STOP]");
    }
}

/***
 * refactored from state 206 (monsterAction)
 * if in range - attack
 * else move closer
 */
function monsterMovement() {
    findRange();
    if (range < 2.0) { //Then Goto 07600
        //it attacks
        gameStateMachine.stateMode = 207;
    } else if (P0 > 10) { //Then Goto 01590 //note P0 is NEVER modified from 0 suspect typo in original printout
        gameStateMachine.stateMode = 25;
    } else {
        resolveMonsterMove();
    }
}

/***
 * determine direction of movement and if the move can be made complete it
 */
function resolveMonsterMove() {
    let mapRowDelta = 0, mapColumnDelta = 0;
    // direction of movement
    if (Math.abs(rangeRowOffset) > Math.abs(rangeColumnOffset)) { //Then Goto 07260
        mapRowDelta = -(rangeRowOffset / Math.abs(rangeRowOffset));
    } else {
        if (M !== 1) { // Then Goto 07270 - obscure logic
            mapColumnDelta = -(rangeColumnOffset / Math.abs(rangeColumnOffset))
        }
    }
    // check movement is possible and resolve
    gameStateMachine.stateMode = 25;
    if (inBounds(gameState.F1 + mapRowDelta, gameState.F2 + mapColumnDelta)) {
        switch (gameState.dungeonMap[gameState.F1 + mapRowDelta][gameState.F2 + mapColumnDelta]) {
            case 0:
            case 6:
            case 7:
            case 8:
                translateMonsterPosition(mapRowDelta, mapColumnDelta);
                break;
            case 2:
                terminal.println("GOOD WORK  YOU LED HIM INTO A TRAP");
                K1 = -1;
                gameState.monsterStats[gameState.currentMonster][constants.monsterHp] = 0;
                gameStateMachine.stateMode = 200; //auto kill
                break;
            case 3:
            case 4:
                //through a door
                if (gameState.dungeonMap[gameState.F1 + 2 * mapRowDelta][gameState.F2 + 2 * mapColumnDelta] === 0) { // Then Goto 07510
                    mapRowDelta = mapRowDelta * 2;
                    mapColumnDelta = mapColumnDelta * 2;
                    translateMonsterPosition(mapRowDelta, mapColumnDelta);
                }
                break;
        }
    }
}

/***
 * Move monster from A to B
 * note the move destroys anything that the monster moves over
 * @param rowDelta
 * @param columnDelta
 */
function translateMonsterPosition(rowDelta, columnDelta) {
    gameState.dungeonMap[gameState.F1][gameState.F2] = 0;
    gameState.F1 += rowDelta;
    gameState.F2 += columnDelta;
    gameState.dungeonMap[gameState.F1][gameState.F2] = 5;
    findRange();
}

/***
 * dead or alive?
 */
function monsterAction() { //206
    if (gameState.monsterStats[gameState.currentMonster][3] < 1) { //Then Goto 08290
        gameStateMachine.stateMode = 203; //it's a kill
    } else {
        monsterMovement();
    }
}

/***
 * Calculate protection value based on stat and equipment
 * note: current method is very stupid
 * @returns {int} protection value
 */
function calculatePlayerProtection() {
    let result = 6 + gameState.attributes[constants.playerDex];
    let i = 1, found = false;
    while (i <= gameState.inventoryCounter && !found) {
        switch (gameState.inventory[i]) {
            case 10:
                found = true;
                result = 20 + gameState.attributes[constants.playerDex];
                break;
            case 9:
                found = true;
                result = 16 + gameState.attributes[constants.playerDex];
                break;
            case 8:
                found = true;
                result = 8 + gameState.attributes[constants.playerDex];
                break;
        }
        i++;
    }
    return result;
}

/***
 * Determines if the monster's attack connects or not
 * On a hit HP is reduced by 1-n
 * On a miss there is a 50% chance to end the attack
 */
function monsterSwings() { //207
    terminal.println(gameState.monsterNames[gameState.currentMonster] + " WATCH IT");
    if (rnd(40) > calculatePlayerProtection()) {
        terminal.println("MONSTER SCORES A HIT");
        gameState.attributes[constants.playerHp] -= int(rnd(gameState.monsterStats[gameState.currentMonster][2]) + 1);
        terminal.println("H.P.=" + gameState.attributes[constants.playerHp]);
        gameStateMachine.stateMode = 200;
    } else {
        if (rnd(2) > 1) {
            terminal.println("HE HIT BUT NOT GOOD ENOUGH");
            gameStateMachine.stateMode = 200;
        } else {
            terminal.println("HE MISSED");
            gameStateMachine.stateMode = 25;
        }
    }
}

//global routines
function initialiseGame() {
    main(new Console('mainConsole', 30, 40));
    $(document).on("endInput", function (event) {
        if (debug) console.log(event);
        gotInput();
    });
    $(document).on("partialInput", function (event) {
        if (debug) console.log(event);
        partial();
    });
    $(document).keypress(function (event) {
        console.info(reading, event.which);
        let charCode = parseInt(event.which);
        if (reading && charCode === 13) {
            event.preventDefault();
            reading = false;
            $(document).trigger("endInput", [{
                type: "endInput",
                message: "EOL",
                time: new Date(),
                inner: event
            }]);
        } else if (reading) {
            if (
                isNumber(inputString + String.fromCharCode(charCode))
                || (String.fromCharCode(charCode) === "-"
                && (inputString.length === 0))
            ) {
                inputString += String.fromCharCode(charCode);
            } else {
                inputString += String.fromCharCode(charCode);
            }
            $(document).trigger("partialInput", [{
                type: "partialInput",
                message: "DELTA",
                time: new Date(),
                inner: event
            }]);
        }
    });
    $(document).keydown(function (event) {
        if (reading) {
            if (event.keyCode === 8) {
                event.preventDefault();
                if (inputString.length > 0) {
                    inputString = inputString.substring(0, inputString.length);
                    $(document).trigger("partialInput", [{
                        type: "partialInput",
                        message: "DELTA",
                        time: new Date(),
                        inner: event
                    }]);
                }
            }
        }
    });
}

$(function() {
    initialiseGame();
});
