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

export default class dnd1 {
    #debug; //global debug flag to enable logging
    difficultyFactor;
    J6; //only used once - investigate
    K1;
// var J9; //random seed
    attributeNames;
// var D2; // target map for modification actions, currently redundant
    equipmentPrice;
    maxMonsterIndex;
// var E = []; // (100)
// var F = []; // (100)
    clericSpellPrices; //(100) cleric spell prices
    wizardSpellPrices; // (100) wizard spell prices
    mapY; // map y
    mapX; // map x
    R; // only appears to be used once - investigate
    S; // move delta
    T; // turn input / move delta
    M; // general purpose loop counter - dangerous reuse observed for other calculations
    N; // general purpose loop counter
    P0; //used but never modified - investigate
    inputInt;
    Z;
    Z5; //only used once - investigate
    range;
    toHitRoll;
    rangeRowOffset;
    rangeColumnOffset; //range and hit calculations
    R3;
    R4;
    R5; //combat calculations
    terminal; // display terminal
    Q; // numeric input
    strQ; //string input
    vbTab; // tab character

    gameState;

    reading; // block key press event when true
    inputString;
    inputStrings;
    inputsCount;
    inputFilter;

    gameStateMachine;

    inputRow;
    inputColumn;

    cookieLifespan;

    constants = {
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

    /*
 ToDo:
 Create maps
 Test Case Scripts
 */
    constructor() {
        this.#debug = false; //global debug flag to enable logging
        this.cookieLifespan = 365; //1 year :D
        this.vbTab = String.fromCharCode(9);
        this.P0 = 0;
        this.difficultyFactor = 0;
        this.K1 = 0;
        this.attributeNames = [];
        this.equipmentPrice = [];
        this.maxMonsterIndex = 0;
        this.clericSpellPrices = []; //(100) cleric spell prices
        this.wizardSpellPrices = []; // (100) wizard spell prices
        this.inputStrings = [];
    }

    get debug() {
        return this.#debug;
    }

    buildStateModel = () => {
        this.gameStateMachine = new StateMachine();
        this.gameStateMachine.addState(new StateModel(1, "loading", this.loadScreen));
        this.gameStateMachine.addState(new StateModel(2, "accept instructions input",
            this.gotInstructionInput));
        this.gameStateMachine.addState(
            new StateModel(3, "old or new game", this.gotLoadInput));
        this.gameStateMachine.addState(
            new StateModel(4, "cheeky instructions", this.showInstructions));
        this.gameStateMachine.addState(
            new StateModel(5, "accept old or new input", this.gotLoadInput));
        this.gameStateMachine.addState(
            new StateModel(6, "accept dungeon # input", this.gotDungeonInput));
        this.gameStateMachine.addState(
            new StateModel(7, "load old dungeon", this.fetchDungeonSave));
        this.gameStateMachine.addState(
            new StateModel(8, "continues reset", this.gotResetInput));
        this.gameStateMachine.addState(
            new StateModel(9, "accept player name", this.gotNameInput));
        this.gameStateMachine.addState(new StateModel(10, "roll", this.rollNew));
        this.gameStateMachine.addState(
            new StateModel(10.5, "pick class", this.pickClass));
        this.gameStateMachine.addState(
            new StateModel(11, "accept class input", this.gotClassInput));
        this.gameStateMachine.addState(
            new StateModel(12, "picked fighter", this.gotFighter));
        this.gameStateMachine.addState(
            new StateModel(13, "picked cleric", this.gotCleric));
        this.gameStateMachine.addState(
            new StateModel(14, "picked wizard", this.gotWizard));
        this.gameStateMachine.addState(new StateModel(15, "go shopping", this.shopTop));
        this.gameStateMachine.addState(
            new StateModel(16, "accept fast-norm shop", this.gotShopFastNorm));
        this.gameStateMachine.addState(
            new StateModel(17, "shopping list", this.shopList));
        this.gameStateMachine.addState(new StateModel(18, "buy goods", this.shopping));
        this.gameStateMachine.addState(
            new StateModel(19, "buying goods", this.gotShoppingInput));
        this.gameStateMachine.addState(
            new StateModel(20, "finished buying", this.showInvQuestion));
        this.gameStateMachine.addState(
            new StateModel(20.5, "accept show inv", this.gotInvQuestion));
        this.gameStateMachine.addState(
            new StateModel(21, "show inv", this.showInventory));
        this.gameStateMachine.addState(new StateModel(22, "show stats", this.showStats));
        this.gameStateMachine.addState(new StateModel(23, "main game", this.welcome));
        this.gameStateMachine.addState(
            new StateModel(23.5, "accept show commands", this.gotCommandsQuestion));
        this.gameStateMachine.addState(
            new StateModel(24, "show commands", this.showCommands));
        this.gameStateMachine.addState(
            new StateModel(25, "get command", this.getCommand));
        this.gameStateMachine.addState(
            new StateModel(26, "route command", this.gotCommand));
        this.gameStateMachine.addState(
            new StateModel(30, "get pretend basic interpreter input",
                this.getBASIC));
        this.gameStateMachine.addState(
            new StateModel(31, "got pretend basic interpreter input",
                this.gotBASIC));
        this.gameStateMachine.addState(new StateModel(45, "make a move", this.startMove));
        this.gameStateMachine.addState(new StateModel(46, "accept a move", this.gotMove));
        this.gameStateMachine.addState(
            new StateModel(47, "finish move", this.completeMove));
        this.gameStateMachine.addState(new StateModel(48, "into a wall", this.thud));
        this.gameStateMachine.addState(new StateModel(49, "into a trap", this.itsATrap));
        this.gameStateMachine.addState(new StateModel(50, "secret door", this.hush));
        this.gameStateMachine.addState(new StateModel(51, "boost str", this.boost1));
        this.gameStateMachine.addState(new StateModel(52, "boost con", this.boost2));
        this.gameStateMachine.addState(new StateModel(53, "into a bod", this.surprise));
        this.gameStateMachine.addState(new StateModel(54, "gold", this.gold));
        this.gameStateMachine.addState(new StateModel(55, "open door", this.openDoor));
        this.gameStateMachine.addState(
            new StateModel(56, "accept door move", this.gotDoorMove));
        this.gameStateMachine.addState(new StateModel(57, "search", this.searching));
        this.gameStateMachine.addState(
            new StateModel(58, "change weapon", this.swapWeapon));
        this.gameStateMachine.addState(
            new StateModel(59, "accept change weapon", this.gotSwap));
        this.gameStateMachine.addState(
            new StateModel(60, "start player fight", this.resolveFight));
        this.gameStateMachine.addState(new StateModel(61, "punch", this.knuckles));
        this.gameStateMachine.addState(
            new StateModel(62, "attack with a sword", this.swingASword));
        this.gameStateMachine.addState(
            new StateModel(63, "attack with a 2h-sword", this.swingABigSword));
        this.gameStateMachine.addState(
            new StateModel(64, "attack with a dagger", this.pokeADagger));
        this.gameStateMachine.addState(
            new StateModel(65, "attack with a mace", this.swingAMace));
        this.gameStateMachine.addState(
            new StateModel(66, "attack with something", this.improvise));
        this.gameStateMachine.addState(new StateModel(67, "throw food", this.throwFood));
        this.gameStateMachine.addState(
            new StateModel(68, "really punch", this.knucklehead));
        this.gameStateMachine.addState(
            new StateModel(69, "resolve improvised attack", this.resolveImprov));
        this.gameStateMachine.addState(
            new StateModel(70, "accept club-sight", this.gotSilverCross));
        this.gameStateMachine.addState(
            new StateModel(71, "remove used weapon or ammo", this.consumeWpn));
        this.gameStateMachine.addState(
            new StateModel(72, "hit monster with food", this.peltMonster));
        this.gameStateMachine.addState(
            new StateModel(73, "distract monster with food", this.kiteMonster));
        this.gameStateMachine.addState(
            new StateModel(74, "loose thrown food", this.consumeFood));
        this.gameStateMachine.addState(new StateModel(75, "look command", this.looking));
        this.gameStateMachine.addState(new StateModel(76, "save", this.saveGame));
        this.gameStateMachine.addState(new StateModel(77, "cast a spell", this.casting));
        this.gameStateMachine.addState(
            new StateModel(78, "cast a cleric spell", this.gotClericSpell));
        this.gameStateMachine.addState(
            new StateModel(79, "cast cleric spell 1 (kill)", this.clericSpellKill));
        this.gameStateMachine.addState(
            new StateModel(80, "cast cleric spell 2 (magic missile #2)",
                this.clericSpellMagicMissileAdvanced));
        this.gameStateMachine.addState(
            new StateModel(81, "cast cleric spell 3 (cure light wounds #1)",
                this.clericSpellCureLight));
        this.gameStateMachine.addState(
            new StateModel(82, "cast cleric spell 4/8 (find all traps/s.doors)",
                this.clericSpellFindTraps));
        this.gameStateMachine.addState(
            new StateModel(83, "cast cleric spell 5 (magic missile #1)",
                this.clericSpellMagicMissile));
        this.gameStateMachine.addState(
            new StateModel(84, "cast cleric spell 6 (magic missile #3)",
                this.clericSpellMagicMissileUltimate));
        this.gameStateMachine.addState(
            new StateModel(85, "cast cleric spell 7 (cure light wounds #2)",
                this.clericSpellCureLightAdvanced));
        this.gameStateMachine.addState(
            new StateModel(86, "cast cleric spell 9 (cheat - push)",
                this.clericSpell9));
        this.gameStateMachine.addState(
            new StateModel(87, "cast a wizard spell", this.gotWizardSpell));
        this.gameStateMachine.addState(
            new StateModel(88, "cast wizard spell 2", this.wizardSpellKill));
        this.gameStateMachine.addState(
            new StateModel(89, "cast wizard spell 3", this.wizardSpellFindTrap));
        this.gameStateMachine.addState(
            new StateModel(90, "cast wizard spell 4", this.wizardSpellTeleport));
        this.gameStateMachine.addState(new StateModel(91, "accept wizard spell 4",
            this.gotTeleportCoordinates));
        this.gameStateMachine.addState(
            new StateModel(91.5, "cast wizard spell CHANGE 5 and 10",
                this.gotSpellChange));
        this.gameStateMachine.addState(
            new StateModel(91.6, "accept wizard spell CHANGE coordinates",
                this.gotChangeCoordinates));
        this.gameStateMachine.addState(new StateModel(92, "buy spells", this.buyMagic));
        this.gameStateMachine.addState(
            new StateModel(93, "cleric spell choice question", this.askACleric));
        this.gameStateMachine.addState(
            new StateModel(94, "wizard spell choice question", this.askAWizard));
        this.gameStateMachine.addState(
            new StateModel(95, "cleric spell list", this.clericSpellChoices));
        this.gameStateMachine.addState(
            new StateModel(96, "wizard spell list", this.wizardSpellChoices));
        this.gameStateMachine.addState(new StateModel(97, "cleric spell transaction",
            this.clericSpellPurchase));
        this.gameStateMachine.addState(new StateModel(98, "wizard spell transaction",
            this.wizardSpellPurchase));
        this.gameStateMachine.addState(
            new StateModel(99, "cheat: show map", this.showCheatMap));
        this.gameStateMachine.addState(
            new StateModel(100, "gold into sauce", this.buyHP));
        this.gameStateMachine.addState(
            new StateModel(101, "got gold get sauce", this.addHP));
        this.gameStateMachine.addState(
            new StateModel(102, "start edit map", this.modifyMap));
        this.gameStateMachine.addState(
            new StateModel(102.5, "got map number", this.modifyGotMap));
        this.gameStateMachine.addState(
            new StateModel(103, "get map pos", this.modifyMapPos));
        this.gameStateMachine.addState(
            new StateModel(104, "update map pos", this.modifyMapDone));
        this.gameStateMachine.addState(
            new StateModel(105, "save map changes", this.modifyMapSave));
        this.gameStateMachine.addState(
            new StateModel(200, "route post-player actions", this.routeGameMove));
        this.gameStateMachine.addState(
            new StateModel(201, "got answer to more equipment",
                this.gotMoreEquipment));
        this.gameStateMachine.addState(
            new StateModel(202, "check if map is cleared", this.monsterMove));
        this.gameStateMachine.addState(
            new StateModel(203, "report kill", this.confirmedKill));
        this.gameStateMachine.addState(
            new StateModel(204, "make a monster (spawn)", this.makeAMonster));
        this.gameStateMachine.addState(
            new StateModel(205, "got reset answer", this.resetAfterClear));
        this.gameStateMachine.addState(
            new StateModel(206, "make a monster move small step",
                this.monsterAction));
        this.gameStateMachine.addState(
            new StateModel(207, "monster attacks player", this.monsterSwings));
        this.gameStateMachine.stateMode = 1;
    }

    getCurrentWeapon = () => {
        if (this.gameState.currentWeaponIndex === -1) return 0;
        return this.gameState.inventory[this.gameState.currentWeaponIndex];
    }

    setCurrentWeapon = (item) => {
        if (item === -1) {
            this.gameState.currentWeaponIndex = -1;
            return true;
        }
        for (let i = 0; i <= this.gameState.inventoryCounter; i++)
            if (this.gameState.inventory[i] === item) {
                this.gameState.currentWeaponIndex = i;
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
    inBounds = (row, column) => {
        return (row >= 0) && (row <= 25) && (column >= 0) && (column <= 25);
    }

    findRange = () => {
        //range and hit check
        let tempY, tempX;
        this.range = 1000;
        tempY = 26;
        tempX = 26;
        for (let m = -25; m <= 25; m++) {
            for (let n = -25; n <= 25; n++) {
                if (this.inBounds(this.mapY + m, this.mapX + n)) {
                    if (this.gameState.dungeonMap[this.mapY + m][this.mapX + n] === 5) {
                        tempY = m;
                        tempX = n;
                        this.range = Math.sqrt(tempY * tempY + tempX * tempX);
                        m = 26;
                        n = 26;
                    }
                }
            }
        }
        this.rangeRowOffset = tempY;
        this.rangeColumnOffset = tempX;
        if (int(rnd(20) + 1) > 18) {
            this.toHitRoll = 3;
        } else {
            if (rnd(20) > (
                this.gameState.monsterStats[this.gameState.currentMonster][2] -
                this.gameState.attributes[this.constants.playerDex] / 3)
            ) {
                this.toHitRoll = 2;
            } else {
                if (rnd(2) > 1.7) {
                    this.toHitRoll = 1;
                } else {
                    this.toHitRoll = 0;
                }
            }
        }
    }

    initialiseGlobals = (gameConsole) => {
        this.mapY = 1; //int(rnd(24) + 2);
        this.mapX = 12; //int(rnd(24) + 2);
        this.reading = false;
        this.inputString = "";
        this.vbTab = String.fromCharCode(9);
        this.gameState = new GameState();
        this.terminal = gameConsole;

        this.gameState.equipmentNames = [
            "",
            "SWORD",
            "2-H-SWORD",
            "DAGGER",
            "MACE",
            "SPEAR",
            "BOW",
            "ARROWS",
            "LEATHER MAIL",
            "CHAIN MAIL",
            "PLATE MAIL",
            "ROPE",
            "SPIKES",
            "FLASK OF OIL",
            "SILVER CROSS",
            "SPARE FOOD"];
        this.equipmentPrice = [
            0,
            10,
            15,
            3,
            5,
            2,
            25,
            2,
            15,
            30,
            50,
            1,
            1,
            2,
            25,
            5];
        this.attributeNames = [
            "",
            "STR",
            "DEX",
            "CON",
            "CHAR",
            "WIS",
            "INT",
            "GOLD"];
        this.clericSpellPrices = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
        this.wizardSpellPrices = [
            0,
            75,
            500,
            200,
            750,
            600,
            100,
            200,
            300,
            200,
            600];

        this.buildStateModel();
    }

    loadMonster = (index, name, stats) => {
        this.gameState.monsterNames[index] = name;
        for(let i=0; i<7; ++i) {
            this.gameState.monsterStats[index][i] = stats[i];
        }
        this.gameState.monsterStats[index][4] = this.gameState.monsterStats[index][3];
        this.gameState.monsterStats[index][5] = this.gameState.monsterStats[index][6];
        this.gameState.monsterStats[index][1] = 1; //not sure why this is meant to happen...
    }

    loadMonsters = () => {
        let index = 0;
        this.loadMonster(index++, "", []);
        this.loadMonster(index++, "MAN", [0, 1, 13, 26, 1, 1, 500]);
        this.loadMonster(index++, "GOBLIN", [0, 2, 13, 24, 1, 1, 600]);
        this.loadMonster(index++, "TROLL", [0, 3, 15, 35, 1, 1, 1000]);
        this.loadMonster(index++, "SKELETON", [0, 4, 22, 12, 1, 1, 50]);
        this.loadMonster(index++, "BALROG", [0, 5, 18, 110, 1, 1, 5000]);
        this.loadMonster(index++, "OCHRE JELLY", [0, 6, 11, 20, 1, 1, 0]);
        this.loadMonster(index++, "GREY OOZE", [0, 7, 11, 13, 1, 1, 0]);
        this.loadMonster(index++, "GNOME", [0, 8, 13, 30, 1, 1, 100]);
        this.loadMonster(index++, "KOBOLD", [0, 9, 15, 16, 1, 1, 500]);
        this.loadMonster(index++, "MUMMY", [0, 10, 16, 30, 1, 1, 100]);
        this.maxMonsterIndex = index;
    }

    partial = () => {
        this.terminal.printAt(this.inputRow, this.inputColumn,
            inputString.toUpperCase() + "_ ");
    }

    input = () => {
        this.gameStateMachine.setWait();
        this.inputFilter = 1;
        this.inputString = "";
        this.inputsCount = 0;
        this.reading = true;
        // wait for enter to be pressed (reading is cleared)
        // use gotInput to capture event
        this.inputRow = terminal.cursorPosition.row;
        this.inputColumn = terminal.cursorPosition.column;
        if ((typeof (this.terminal) != "undefined") &&
            (typeof (this.inputRow) != "undefined"))
            terminal.printAt(this.inputRow, this.inputColumn, "_");
        console.info("waiting for input");
    }

    inputStr = () => {
        this.gameStateMachine.setWait();
        this.inputFilter = 0;
        this.inputString = "";
        this.inputsCount = 0;
        this.reading = true;
        // wait for enter to be pressed (reading is cleared)
        // use gotInput to capture event
        this.inputRow = terminal.cursorPosition.row;
        this.inputColumn = terminal.cursorPosition.column;
        if ((typeof (this.terminal) != "undefined") &&
            (typeof (this.inputRow) != "undefined"))
            this.terminal.printAt(this.inputRow, this.inputColumn, "_");
        console.info("waiting for input");
    }

    inputX = (items) => {
        this.gameStateMachine.setWait();
        this.inputsCount = items;
        this.inputFilter = 1;
        this.inputString = "";
        this.reading = true;
        this.inputRow = terminal.cursorPosition.row;
        this.inputColumn = terminal.cursorPosition.column;
        if ((typeof (this.terminal) != "undefined") &&
            (typeof (this.inputRow) != "undefined"))
            this.terminal.printAt(this.inputRow, this.inputColumn, "_");
        console.info("waiting for input");
    }

    gotInput = () => {
        this.reading = false;
        let value = this.inputString.toUpperCase();
        this.terminal.setCursorPos(this.inputRow, this.inputColumn);
        this.terminal.print(value);
        this.inputString = value;
        if (this.inputsCount > 0) {
            this.inputStrings[this.inputsCount - 1] = inputString.trim();
            this.inputString = "";
            this.inputsCount--;
            if (this.inputsCount > 0) {
                terminal.print(",");
                this.reading = true;
                this.inputRow = terminal.cursorPosition.row;
                this.inputColumn = terminal.cursorPosition.column;
                if ((typeof (this.terminal) != "undefined") &&
                    (typeof (this.inputRow) != "undefined")) {
                    this.terminal.printAt(this.inputRow, this.inputColumn, "_");
                }
                console.info("waiting for input");
            } else {
                this.terminal.println("");
                this.gameStateMachine.modelEngine();
            }
        } else {
            this.terminal.println("");
            this.gameStateMachine.modelEngine();
        }
    }

    main = (terminal) => {
        //main loop
        this.initialiseGlobals(terminal);
        this.gameStateMachine.modelEngine();
    }

    /* main game code starts here - each function (unless stated otherwise) represents a game state */
    loadScreen = () => { //1
        this.terminal.printc("DUNGEONS AND DRAGONS #1");
        this.terminal.printc("(C) 1977-2014 RICHARD GARRIOTT");
        this.terminal.printc("PORTED BY JULIAN BROWN");
        this.terminal.printc("ALL RIGHTS TO THIS PORT REMAIN PROPERTY");
        this.terminal.printc("OF RICHARD GARRIOTT");
        this.terminal.printc("******UPDATED 30 APR 2023******");
        this.terminal.printc("");
        this.terminal.printc("WARNING! THIS SITE USES COOKIES");
        this.terminal.printc("IF YOU DON'T WANT TO STORE COOKIES");
        this.terminal.printc("PLEASE STOP NOW");
        this.terminal.println("");
        this.terminal.print("DO YOU NEED INSTRUCTIONS ");
        this.gameStateMachine.stateMode = 2;
        this.inputStr();
    }

    gotInstructionInput = () => { //2
        let strQ = this.inputString.trim();
        if (strQ === "YES" || strQ === "Y") {
            this.gameStateMachine.stateMode = 4;
        } else {
            this.terminal.print("OLD OR NEW GAME ");
            this.gameStateMachine.stateMode = 3;
            this.inputStr();
        }
    }

    gotLoadInput() { //3
        let strQ = this.inputString.trim();
        if (strQ === "OLD") {
            this.gameStateMachine.stateMode = 7;
        } else {
            this.terminal.print("DUNGEON # ");
            this.gameStateMachine.stateMode = 6;
            this.input();
        }
    }

    showInstructions() { //4
        this.terminal.println("WHO SAID YOU COULD PLAY");
        this.terminal.println("[STOP]");
        this.gameStateMachine.stateMode = 30;
    }

    gotDungeonInput() { //6
        let Q = parseInt(inputString.trim());
        this.gameState.Dn = Math.floor(Q);
        this.terminal.print("CONTINUES RESET 1=YES,2=NO ");
        this.gameStateMachine.stateMode = 8;
        this.input();
    }

    fetchDungeonSave() { //7
        if (getCookie(Document, 'dnd1file7.' + Dn) !== '') {
            this.gameState.deSerialiseFromCookie(Document, 'dnd1file7');
            this.gameStateMachine.stateMode = 23;
        } else {
            this.terminal.println("ERROR FILE #7 DOES NOT EXIST");
            this.terminal.println("[STOP]");
            this.gameStateMachine.stateMode = 30;
        }
    }

    defaultMap() {
        this.gameState.dungeonMap[0] = [
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1];
        this.gameState.dungeonMap[1] = [
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            4,
            0,
            0,
            0,
            3,
            0,
            1,
            6,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[2] = [
            1,
            0,
            1,
            1,
            1,
            1,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            2,
            1,
            0,
            1,
            0,
            1,
            1,
            0,
            1];
        this.gameState.dungeonMap[3] = [
            1,
            0,
            0,
            0,
            1,
            0,
            2,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            0,
            3,
            0,
            1,
            0,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[4] = [
            1,
            1,
            1,
            3,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            4,
            0,
            0,
            1,
            0,
            1,
            1,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[5] = [
            1,
            0,
            0,
            6,
            1,
            0,
            0,
            6,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            6,
            1,
            0,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[6] = [
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[7] = [
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            6,
            0,
            1,
            1,
            1,
            0,
            1];
        this.gameState.dungeonMap[8] = [
            1,
            1,
            1,
            1,
            3,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            4,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[9] = [
            1,
            0,
            6,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            1,
            1];
        this.gameState.dungeonMap[10] = [
            1,
            0,
            1,
            1,
            0,
            1,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            3,
            0,
            1,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[11] = [
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[12] = [
            1,
            1,
            1,
            1,
            0,
            1,
            1,
            4,
            1,
            1,
            1,
            6,
            0,
            0,
            0,
            4,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[13] = [
            1,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[14] = [
            1,
            0,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            1];
        this.gameState.dungeonMap[15] = [
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            1,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[16] = [
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            1,
            1,
            1,
            0,
            1];
        this.gameState.dungeonMap[17] = [
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            1];
        this.gameState.dungeonMap[18] = [
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            3,
            1,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[19] = [
            1,
            0,
            1,
            0,
            1,
            1,
            1,
            0,
            3,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            1,
            1,
            1];
        this.gameState.dungeonMap[20] = [
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            0,
            1];
        this.gameState.dungeonMap[21] = [
            1,
            1,
            1,
            1,
            1,
            3,
            1,
            1,
            1,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            1,
            0,
            1];
        this.gameState.dungeonMap[22] = [
            1,
            6,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            4,
            0,
            1,
            1,
            1,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            1];
        this.gameState.dungeonMap[23] = [
            1,
            1,
            1,
            0,
            0,
            0,
            2,
            4,
            0,
            1,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            1];
        this.gameState.dungeonMap[24] = [
            1,
            6,
            0,
            0,
            1,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            1,
            1,
            0,
            0,
            0,
            1,
            0,
            1,
            0,
            1,
            0,
            0,
            1];
        this.gameState.dungeonMap[25] = [
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1,
            1];
    }

    readMapFromCookie = (id) => {
        let stream, elements;
        for (let m = 0; m <= 25; m++) {
            stream = getCookie(document, "dnd1file" + id + ".dungeonMap." + m);
            elements = stream.split("|");
            for (let n = 0; n <= 25; n++)
                this.gameState.dungeonMap[m][n] = parseInt(elements[n]);
        }
    }

//load default dungeon where not locally saved
    loadDungeon = (d) => {
        this.terminal.println("READING DUNGEON # " + d);
        this.gameState.dungeonMap[0][0] = getCookie(document,
            "dnd1file" + d + ".dungeonMap.0");
        if (this.gameState.dungeonMap[0][0] === "") {
            this.defaultMap();
        } else {
            this.readMapFromCookie(d);
        }
        for (let m = 0; m <= 25; m++) {
            for (let n = 0; n <= 25; n++) {
                if (d !== 0) {
                    console.info("M=" + m + " N=" + n);
                    if (this.gameState.dungeonMap[m][n] === 0) {
                        if (rnd(0) >= 0.97) {
                            this.gameState.dungeonMap[m][n] = 7;
                        } else if (rnd(0) >= 0.97) {
                            this.gameState.dungeonMap[m][n] = 8;
                        }
                    }
                }
            }
        }
        this.loadMonsters();
    }

    gotResetInput = () => { //8
        this.J6 = Math.floor(this.inputString);
        this.terminal.print("PLAYERS NAME ");
        this.gameStateMachine.stateMode = 9;
        this.inputStr();
    }

    gotNameInput = () => {
        this.gameState.characterName = this.inputString.trim();
        if (this.gameState.characterName === "SHAVS") {
            this.gameStateMachine.stateMode = 10;
        } else {
            this.gameStateMachine.stateMode = 4;
        }
    }

    rollNew = () => {
        for (let M = 1; M <= 7; M++) {
            for (let N = 1; N <= 3; N++) {
                let R = int(rnd(6) + 1);
                this.gameState.attributes[M] = this.gameState.attributes[M] + R;
            }
            if (M === 7) {
                this.gameState.attributes[M] = this.gameState.attributes[M] * 15;
            }
            this.terminal.println(attributeNames[M] + "=" + this.gameState.attributes[M]);
        }
        this.gameStateMachine.stateMode = 10.5;
    }

    pickClass = () => {
        this.terminal.println("");
        this.terminal.println("CLASSIFICATION");
        this.terminal.println("WHICH DO YOU WANT TO BE");
        this.terminal.print("FIGHTER, CLERIC, OR WIZARD ");
        this.gameStateMachine.stateMode = 11;
        this.inputStr();
    }

    gotClassInput = () => {
        this.gameState.attributeNames[this.constants.playerHp] = this.inputString.trim();
        if (this.gameState.attributeNames[0] === "NONE") {
            for (let M = 0; M <= 7; M++) {
                this.gameState.attributes[M] = 0;
            }
            this.gameStateMachine.stateMode = 10;
        } else {
            switch (this.gameState.attributeNames[this.constants.playerClass]) {
                case "FIGHTER":
                    this.gameStateMachine.stateMode = 12;
                    break;
                case "CLERIC":
                    this.gameStateMachine.stateMode = 13;
                    break;
                case "WIZARD":
                    this.gameStateMachine.stateMode = 14;
                    break;
                default:
                    this.gameStateMachine.stateMode = 10.5;
            }
        }
    }

    gotFighter = () => {
        this.gameState.attributes[this.constants.playerHp] = int(rnd(8) + 1);
        this.gameStateMachine.stateMode = 15;
    }

    gotCleric = () => {
        this.gameState.attributes[this.constants.playerHp] = int(rnd(6) + 1);
        this.gameStateMachine.stateMode = 15;
    }

    gotWizard = () => {
        this.gameState.attributes[this.constants.playerHp] = int(rnd(4) + 1);
        this.gameStateMachine.stateMode = 15;
    }

    shopTop = () => {
        this.terminal.println("BUYING WEAPONS");
        this.terminal.println("FAST OR NORM ");
        this.gameStateMachine.stateMode = 16;
        this.inputStr();
    }

    gotShopFastNorm = () => {
        this.strQ = inputString.trim();
        if (this.strQ === "FAST") {
            this.gameStateMachine.stateMode = 18;
        } else {
            this.gameStateMachine.stateMode = 17;
        }
        this.terminal.println("NUMBER" + this.vbTab + "ITEM" + this.vbTab + "PRICE");
        this.terminal.println("-1-STOP");
    }

    shopList = () => { //17
        for (let M = 1; M <= 15; M++) {
            this.terminal.println(
                M + this.vbTab +
                this.gameState.equipmentNames[M] + this.vbTab +
                this.equipmentPrice[M]
            );
        }
        this.gameStateMachine.stateMode = 18;
    }

    shopping = () => { //18
        this.gameStateMachine.stateMode = 19;
        this.input();
    }

    buyItem = (item) => {
        this.gameState.inventoryCounter++;
        this.gameState.attributes[this.constants.playerGold] -= this.equipmentPrice[item];
        this.terminal.println("GP= " + this.gameState.attributes[this.constants.playerGold]);
        this.gameState.inventory[this.gameState.inventoryCounter] = item;
    }

    gotShoppingInput = () => {
        let inputInt = Math.floor(this.inputString);
        if (inputInt < 0 || inputInt > 15) {
            this.gameStateMachine.stateMode = 20; //stop shopping
        } else {
            if (this.gameState.attributes[this.constants.playerGold] <
                this.equipmentPrice[inputInt]) {
                this.terminal.println("COSTS TOO MUCH");
                this.terminal.println("TRY AGAIN ");
            } else {
                if (this.gameState.attributeNames[this.constants.playerClass] === "CLERIC") {
                    if (inputInt === 4 || inputInt === 8 || inputInt === 9 ||
                        inputInt > 10) {
                        this.buyItem(inputInt);
                    } else {
                        this.terminal.println("YOUR A CLERIC YOU CANT USE THAT ");
                    }
                } else if (this.gameState.attributeNames[this.constants.playerClass] === "WIZARD") {
                    if (inputInt === 3 || inputInt === 8 || inputInt > 10) {
                        this.buyItem(inputInt);
                    } else {
                        this.terminal.println("YOUR A WIZARD YOU CANT USE THAT ");
                    }
                } else {
                    this.buyItem(inputInt);
                }
            }
            this.gameStateMachine.stateMode = 18;
        }
    }

    showInvQuestion = () => {
        this.terminal.print("EQ LIST ");
        this.gameStateMachine.stateMode = 20.5;
        this.inputStr();
    }

    gotInvQuestion = () => {
        this.strQ = this.inputString.trim();
        if (this.strQ === "NO") {
            this.gameStateMachine.stateMode = 22;
        } else {
            this.gameStateMachine.stateMode = 21;
        }
    }

    showInventory = () => {
        for (let m = 1; m <= this.gameState.inventoryCounter; m++) {
            if (this.gameState.inventory[m] !== 0) {
                this.terminal.println(
                    this.gameState.inventory[m] + this.vbTab +
                    this.gameState.equipmentNames[this.gameState.inventory[m]]
                );
            }
        }
        this.gameStateMachine.stateMode = 22;
    }

    showStats = () => {
        this.terminal.println("YOUR CHARACTERISTICS ARE:");
        this.terminal.println(
            this.gameState.attributeNames[this.constants.playerClass]
        );
        if (this.gameState.attributes[this.constants.playerHp] === 1) {
            this.gameState.attributes[this.constants.playerHp] = 2;
        }
        this.terminal.println(
            "HIT POINTS" + this.vbTab +
            this.gameState.attributes[this.constants.playerHp]
        );
        this.terminal.println("");
        this.terminal.println("");
        this.gameStateMachine.stateMode = 23;
    }

    welcome() {
        this.loadDungeon(this.gameState.Dn);
        this.terminal.println("");
        this.terminal.println("");
        this.terminal.println("");
        this.terminal.println("WELCOME TO DUNGEON #" + this.gameState.Dn);
        this.terminal.println("YOU ARE AT (" + mapY + "," + mapX + ")");
        this.terminal.println("");
        this.terminal.print("COMMANDS LIST" + this.vbTab);
        this.gameStateMachine.stateMode = 23.5;
        this.inputStr();
    }

    gotCommandsQuestion = () => {
        this.strQ = this.inputString.trim();
        if (this.strQ === "YES") {
            this.gameStateMachine.stateMode = 24;
        } else {
            this.gameStateMachine.stateMode = 25;
        }
    }

    showCommands = () => {
        this.terminal.println("");
        this.terminal.println(
            "1=MOVE  2=OPEN DOOR  3=SEARCH FOR TRAPS AND SECRET DOORS");
        this.terminal.println("4=SWITCH WEAPON HN HAND  5=FIGHT");
        this.terminal.println(
            "6=LOOK AROUND  7=SAVE GAME  8=USER MAGIC  9=BUY MAGIC");
        this.terminal.println("0=PASS  11=BUY H.P.");
        this.gameStateMachine.stateMode = 25;
    }

    getCommand = () => { //25
        this.terminal.print("COMMAND=");
        this.gameStateMachine.stateMode = 26;
        this.input();
    }

    gotCommand = () => {
        switch (parseInt(this.inputString.trim())) {
            case 1: // move
                this.gameStateMachine.stateMode = 45;
                break;
            case 2: // open door
                this.gameStateMachine.stateMode = 55;
                break;
            case 3: // search
                this.gameStateMachine.stateMode = 57;
                break;
            case 4: // change weapon
                this.gameStateMachine.stateMode = 58;
                break;
            case 5: // fight
                this.gameStateMachine.stateMode = 60;
                break;
            case 6: // look around
                this.gameStateMachine.stateMode = 75;
                break;
            case 7: // save game
                this.gameStateMachine.stateMode = 76;
                break;
            case 8: // use magic
                this.gameStateMachine.stateMode = 77;
                break;
            case 9: // buy magic
                this.gameStateMachine.stateMode = 92;
                break;
            case 10: // cheat show map
                this.gameStateMachine.stateMode = 99;
                break;
            case 11: // buy hp
                this.gameStateMachine.stateMode = 100;
                break;
            case 12: // cheat modify map
                this.gameStateMachine.stateMode = 102;
                break;
            case 0: //pass
                this.gameStateMachine.stateMode = 200;
                break;
            default:
                this.terminal.println("COME ON ");
                this.gameStateMachine.stateMode = 25;
                break;
        }
    }

    getBASIC = () => { //30
        this.terminal.print(">");
        this.inputStr();
        this.gameStateMachine.stateMode = 31;
    }

    gotBASIC = () => { //31
        this.strQ = this.inputString.trim();
        if (this.strQ === "RUN") {
            this.gameStateMachine.stateMode = 1;
        } else if (this.strQ === "CLS") {
            this.terminal.cls();
            this.gameStateMachine.stateMode = 30;
        } else {
            this.terminal.println("SYNTAX ERROR");
            this.gameStateMachine.stateMode = 30;
        }
    }

    startMove = () => { //45
        this.terminal.println("YOU ARE AT " + mapY + " , " + mapX);
        this.terminal.println("  DOWN  RIGHT  LEFT  OR  UP");
        this.inputStr();
        this.gameStateMachine.stateMode = 46;
    }

    gotMove = () => {
        this.strQ = this.inputString.trim();
        this.S = 0;
        this.T = 0;
        if (this.strQ === "RIGHT" || this.strQ === "R") {
            this.T = 1;
        }
        if (this.strQ === "LEFT" || this.strQ === "L") {
            this.T = -1;
        }
        if (this.strQ === "UP" || this.strQ === "U") {
            this.S = -1;
        }
        if (this.strQ === "DOWN" || this.strQ === "n") {
            this.S = 1;
        }
        if (this.S === 0 && this.T === 0) {
            this.gameStateMachine.stateMode = 45;
        } else {
            let look = this.gameState.dungeonMap[this.mapY + this.S][this.mapX + this.T];
            switch (look) {
                case 0:
                    this.gameStateMachine.stateMode = 47; // space
                    break;
                case 2:
                    this.gameStateMachine.stateMode = 49; // trap
                    break;
                case 3:
                    this.gameStateMachine.stateMode = 50; // secret door
                    break;
                case 7:
                    this.gameStateMachine.stateMode = 51; // inc str
                    break;
                case 8:
                    this.gameStateMachine.stateMode = 52; // inc con
                    break;
                case 5:
                    this.gameStateMachine.stateMode = 53; // monster
                    break;
                case 6:
                    this.gameStateMachine.stateMode = 54; // gold
                    break;
                default:
                    this.gameStateMachine.stateMode = 48; // wall
                    break;
            }
        }
    }

    completeMove = () => {
        this.mapY += this.S;
        this.mapX += this.T;
        this.terminal.println("DONE");
        this.gameStateMachine.stateMode = 200;
    }

    thud = () => {
        this.terminal.println("YOU RAN INTO A WALL");
        if ((rnd(12) + 1) > 9) {
            this.terminal.println("AND LOOSE 1 HIT POINT");
            this.gameState.attributes[this.constants.playerHp] -= 1;
        } else {
            this.terminal.println("BUT NO DAMAGE WAS INFLICTED");
        }
        this.gameStateMachine.stateMode = 200;
    }

    itsATrap = () => {
        let m;
        this.terminal.println("OOPS A TRAP AND YOU FELL IN");
        if ((rnd(2)) < 2) {
            this.terminal.println("AND HIT POINTS LOOSE 1");
            this.gameState.attributes[this.constants.playerHp] -= 1;
        }
        this.terminal.println("I HOPE YOU HAVE SOME SPIKES AND PREFERABLY ROPE");
        this.terminal.println("LET ME SEE");
        let found1 = false;
        let found2 = false;
        for (m = 1; m <= this.gameState.inventoryCounter; m++) {
            if (this.gameState.inventory[m] === 12) {
                this.gameState.inventory[m] = 0;
                m = this.gameState.inventoryCounter + 1;
                found1 = true;
            }
        }
        if (found1) {
            for (m = 1; m <= this.gameState.inventoryCounter; m++) {
                if (this.gameState.inventory[m] === 11) {
                    this.gameState.inventory[m] = 0;
                    m = this.gameState.inventoryCounter + 1;
                    found2 = true;
                }
            }
            if (found2) {
                this.terminal.println("GOOD BOTH");
                this.terminal.println("YOU MANAGE TO GET OUT EASY");
                this.terminal.println(
                    "YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
                this.gameStateMachine.stateMode = 45;
            } else {
                this.terminal.println("NO ROPE BUT AT LEAST SPIKES");
                let loop = true;
                while (loop) {
                    if (int(rnd(3)) + 1 !== 2) {
                        this.terminal.println("YOU MANAGE TO GET OUT EASY");
                        this.terminal.println(
                            "YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
                        this.gameStateMachine.stateMode = 45;
                        loop = false;
                    } else {
                        this.terminal.println("YOU FALL HALFWAY UP");
                        if (int(rnd(6)) > this.gameState.attributes[this.constants.playerStr] / 3) {
                            this.terminal.println(
                                "OOPS mapX.equipmentPrice. LOOSE 1");
                            this.gameState.attributes[0] -= 1;
                        }
                        this.terminal.println("TRY AGAIN ");
                    }
                }
            }
        } else {
            this.terminal.println("NO SPIKES AH THAT'S TOO BAD 'CAUSE YOU'RE DEAD");
            this.terminal.println("[STOP]");
            this.gameStateMachine.stateMode = 30;
        }
    }

    hush = () => {
        if (int(rnd(6)) < 1) { //check original code - only partial logic present
            this.terminal.println("YOU JUST RAN INTO A SECRET DOOR");
            this.terminal.println("AND OPENED IT");
            this.mapY += this.S;
            this.mapX += this.T;
            this.gameStateMachine.stateMode = 200;
        } else {
            this.gameStateMachine.stateMode = 48;
        }
    }

    boost1 = () => {
        this.gameState.attributes[this.constants.playerStr] += 1;
        this.gameState.dungeonMap[this.mapY + this.S][this.mapX + this.T] = 0;
        if (rnd(0) <= 0.2) {
            this.terminal.println("       POISON      ");
            this.gameState.attributes[this.constants.playerHp] -= int(rnd(4) + 1);
            this.terminal.println("HP= " + this.gameState.attributes[this.constants.playerHp]);
        }
        this.gameStateMachine.stateMode = 47;
    }

    boost2 = () => {
        this.gameState.attributes[this.constants.playerCon] += 1;
        this.gameState.dungeonMap[this.mapY + this.S][this.mapX + this.T] = 0;
        if (rnd(0) <= 0.2) {
            this.terminal.println("       POISON      ");
            this.gameState.attributes[0] -= int(rnd(0) * 4 + 1);
            this.terminal.println("HP= " + this.gameState.attributes[this.constants.playerHp]);
        }
        gameStateMachine.stateMode = 47;
    }

    surprise = () => {
        this.terminal.println("YOU RAN INTO THE MONSTER");
        this.terminal.println("HE SHOVES YOU BACK");
        this.terminal.println("");
        if (int(rnd(2)) + 1 !== 2) {
            this.terminal.println("YOU LOOSE 6 HIT POINT ");
            this.gameState.attributes[this.constants.playerHp] -= 6
        }
        this.gameStateMachine.stateMode = 200;
    }

    gold = () => {
        this.terminal.println("AH......GOLD......");
        let goldFind = int(rnd(500) + 10);
        this.terminal.println(goldFind + "PIECES");
        this.gameState.attributes[this.constants.playerGold] += goldFind;
        this.terminal.println("GP= " + this.gameState.attributes[this.constants.playerGold]);
        this.gameState.dungeonMap[this.mapY + this.S][this.mapX + this.T] = 0;
        if (rnd(0) <= 0.2) {
            this.terminal.printc("POISON");
            this.gameState.attributes[this.constants.playerHp] -= int(rnd(4) + 1);
            this.terminal.println("HP= " + this.gameState.attributes[this.constants.playerHp]);
        }
        this.gameStateMachine.stateMode = 47;
    }

    openDoor = () => {
        this.terminal.println("DOOR LEFT RIGHT UP OR DOWN");
        this.gameStateMachine.stateMode = 56;
        this.inputStr();
    }

    gotDoorMove = () => {
        this.strQ = this.inputString.trim();
        this.S = 0;
        this.T = 0;
        if (this.strQ === "RIGHT" || this.strQ === "R") {
            this.T = 1;
        }
        if (this.strQ === "LEFT" || this.strQ === "L") {
            this.T = -1;
        }
        if (this.strQ === "UP" || this.strQ === "U") {
            this.S = -1;
        }
        if (this.strQ === "DOWN" || this.strQ === "D") {
            this.S = 1;
        }
        if (this.S === 0 && this.T === 0) {
            this.gameStateMachine.stateMode = 55;
        } else {
            let look = this.gameState.dungeonMap[this.mapY + this.S][this.mapX + this.T];
            if (look === 3 || look === 4) {
                this.terminal.println("PUSH");
                if (int(rnd(20)) + 1 >=
                    this.gameState.attributes[this.constants.playerStr]) {
                    this.terminal.println("DIDNT BUDGE");
                    this.gameStateMachine.stateMode = 200;
                } else {
                    terminal.println("ITS OPEN");
                    this.mapY += this.S;
                    this.mapX += this.T;
                    this.gameStateMachine.stateMode = 47;
                }
            } else {
                this.terminal.println("THERE IS NOT A DOOR THERE");
                this.gameStateMachine.stateMode = 25;
            }
        }
    }

    searching = () => {
        this.terminal.println("SEARCH.........SEARCH...........SEARCH...........");
        this.Z = 0;
        if (int(rnd(40)) < this.gameState.attributes[this.constants.playerWis] +
            this.gameState.attributes[this.constants.playerInt]) {
            for (let M = -1; M <= 1; M++) {
                for (let N = -1; N <= 1; N++) {
                    if (this.gameState.dungeonMap[this.mapY + M][this.mapX + N] === 2) {
                        this.terminal.println("YES THERE IS A TRAP");
                        this.terminal.println("IT IS " + M + "VERTICALLY  " + N +
                            "HORIZONTALLY FROM YOU");
                        this.Z = 1;
                    }
                    if (this.gameState.dungeonMap[this.mapY + M][this.mapX + N] === 3) {
                        this.terminal.println("YES ITS A DOOR");
                        this.terminal.println(
                            "IT IS " + M + "VERTICALLY  " + N + "HORIZONTALLY");
                        this.Z = 1;
                    }
                }
            }
        }
        if (this.Z === 0) this.terminal.println("NO NOT THAT YOU CAN TELL");
        this.gameStateMachine.stateMode = 200;
    }

    swapWeapon = () => { //58
        this.terminal.println("WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON ");
        this.gameStateMachine.stateMode = 59;
        this.input();
    }

    gotSwap = () => { //59
        this.inputInt = parseInt(inputString.trim());
        if (this.inputInt !== 0) {
            let originalChoice = this.gameState.currentWeaponIndex;
            let found = this.setCurrentWeapon(this.inputInt);
            if (found) {
                this.terminal.println("O.K. YOU ARE NOW HOLDING A " +
                    this.gameState.equipmentNames[this.inputInt]);
                this.gameStateMachine.stateMode = 200;
            } else {
                this.gameState.currentWeaponIndex = originalChoice;
                this.terminal.println("SORRY YOU DONT HAVE THAT ONE");
                this.gameStateMachine.stateMode = 58;
            }
        } else {
            this.gameStateMachine.stateMode = 200;
        }
    }

    resolveFight = () => { //60
        this.terminal.println(
            "YOUR WEAPON IS " + this.gameState.equipmentNames[this.getCurrentWeapon()]);
        if (this.gameState.currentMonster === 0) {
            this.gameStateMachine.stateMode = 25;
        } else {
            this.terminal.println(this.gameState.monsterNames[this.gameState.currentMonster]);
            this.terminal.println(
                "HP=" + this.gameState.monsterStats[this.gameState.currentMonster][3]);
            if (this.getCurrentWeapon() === 0) {
                this.gameStateMachine.stateMode = 61;
            }
            if (this.getCurrentWeapon() === 1) {
                this.gameStateMachine.stateMode = 62;
            }
            if (this.getCurrentWeapon() === 2) {
                this.gameStateMachine.stateMode = 63;
            }
            if (this.getCurrentWeapon() === 3) {
                this.gameStateMachine.stateMode = 64;
            }
            if (this.getCurrentWeapon() === 4) {
                this.gameStateMachine.stateMode = 65;
            }
            if (this.getCurrentWeapon() > 4 && this.getCurrentWeapon() < 15) { //no weapon
                this.gameStateMachine.stateMode = 66;
            }
            if (this.getCurrentWeapon() === 15) {
                this.terminal.println("FOOD ???.... WELL O.K.");
                this.terminal.print("IS IT TO HIT OR DISTRACT");
                this.gameStateMachine.stateMode = 67;
                this.inputStr();
            }
        }
    }

    knuckles = () => { //61
        this.terminal.println("DO YOU REALIZE YOU ARE BARE HANDED");
        this.terminal.print("DO YOU WANT TO MAKE ANOTHER CHOICE");
        this.gameStateMachine.stateMode = 68;
        this.inputStr();
    }

    swingASword = () => { //62
        this.terminal.println("SWING");
        this.findRange();
        if (this.range >= 2) {
            this.terminal.println("HE IS OUT OF RANGE");
            this.gameStateMachine.stateMode = 200;
        } else {
            switch (this.toHitRoll) {
                case 0:
                    this.terminal.println("MISSED TOTALLY");
                    this.gameStateMachine.stateMode = 200;
                    break;
                case 1:
                    this.terminal.println("NOT GOOD ENOUGH");
                    this.gameStateMachine.stateMode = 25;
                    break;
                case 2:
                    this.terminal.println("GOOD HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * 4 / 5);
                    this.gameStateMachine.stateMode = 25;
                    break;
                default:
                    this.terminal.println("CRITICAL HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] / 2);
                    this.gameStateMachine.stateMode = 25;
                    break;
            }
        }
    }

    swingABigSword() { //63
        this.terminal.println("SWING");
        this.findRange();
        if (range > 2) {
            this.terminal.println("HE IS OUT OF RANGE");
            this.gameStateMachine.stateMode = 200;
        } else {
            switch (this.toHitRoll) {
                case 0:
                    this.terminal.println("MISSED TOTALLY");
                    this.gameStateMachine.stateMode = 200;
                    break;
                case 1:
                    this.terminal.println("HIT BUT NOT WELL ENOUGH");
                    this.gameStateMachine.stateMode = 25;
                    break;
                case 2:
                    this.terminal.println("HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * 5 / 7);
                    this.gameStateMachine.stateMode = 25;
                    break;
                default:
                    this.terminal.println("CRITICAL HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= this.gameState.attributes[this.constants.playerStr];
                    this.gameStateMachine.stateMode = 25;
                    break;
            }
        }
    }

    pokeADagger = () => { //64
        if (this.getCurrentWeapon() !== 3) {
            this.terminal.println("YOU DONT HAVE A DAGGER");
        } else {
            this.findRange();
            if (this.range > 5) { //Then Goto 04710 'OUT OF RANGE
                this.terminal.println("HE IS OUT OF RANGE");
            } else {
                switch (this.toHitRoll) {
                    case 0:
                        this.terminal.println("MISSED TOTALLY");
                        break;
                    case 1:
                        this.terminal.println("HIT BUT NO DAMAGE");
                        break;
                    case 2:
                        this.terminal.println("HIT");
                        this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                            this.gameState.attributes[this.constants.playerStr] / 4);
                        break;
                    default:
                        this.terminal.println("CRITICAL HIT");
                        this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                            this.gameState.attributes[this.constants.playerStr] * 3 / 10);
                        break;
                }
                if (this.range >= 2) {
                    this.gameState.inventory[this.gameState.currentWeaponIndex] = 0;
                    this.gameState.currentWeaponIndex = -1;
                    for (let M = 1; M <= this.gameState.inventoryCounter; M++)
                        if (this.gameState.inventory[M] === 3)
                            this.gameState.currentWeaponIndex = M;
                }
            }
        }
        this.gameStateMachine.stateMode = 200;
    }

    swingAMace = () => { //65
        this.terminal.println("SWING");
        this.findRange();
        if (this.range >= 2) {
            this.terminal.println("HE IS OUT OF RANGE");
            this.gameStateMachine.stateMode = 200;
        } else {
            switch (this.toHitRoll) {
                case 0:
                    this.terminal.println("MISS");
                    this.gameStateMachine.stateMode = 200;
                    break;
                case 1:
                    this.terminal.println("HIT BUT NO DAMAGE");
                    this.gameStateMachine.stateMode = 25;
                    break;
                case 2:
                    this.terminal.println("HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * 5 / 11);
                    this.gameStateMachine.stateMode = 25;
                    break;
                default:
                    this.terminal.println("CRITICAL HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * 4 / 9);
                    this.gameStateMachine.stateMode = 25;
                    break;
            }
        }
    }

    improvise = () => { //66
        let found = (this.getCurrentWeapon() > 0);
        if (!found) {
            this.terminal.println("NO WEAPON FOUND");
            this.gameStateMachine.stateMode = 25;
        } else {
            this.findRange();
            switch (this.getCurrentWeapon()) {
                case 5:
                    this.R3 = 10;
                    this.R4 = 3 / 7;
                    this.R5 = 5 / 11;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 6:
                    this.R3 = 15;
                    this.R4 = 3 / 7;
                    this.R5 = 5 / 11;
                    found = false;
                    let arrowIndex = -1;
                    for (let i = 0; (i <= this.gameState.inventoryCounter &&
                        !found); i++)
                        if (this.gameState.inventory[i] === 7) {
                            arrowIndex = i;
                            found = true;
                        }
                    if (!found) {
                        this.terminal.println("MISS");
                        this.gameStateMachine.stateMode = 71;
                    } else {
                        this.gameState.inventory[arrowIndex] = 0;
                        this.gameStateMachine.stateMode = 69;
                    }
                    break;
                case 7:
                    this.R3 = 1.5;
                    this.R4 = 1 / 7;
                    this.R5 = 1 / 5;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 8:
                    this.R3 = 4;
                    this.R4 = 1 / 10;
                    this.R5 = 1 / 8;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 9:
                    this.R3 = 4;
                    this.R4 = 1 / 7;
                    this.R5 = 1 / 6;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 10:
                    this.R3 = 3;
                    this.R4 = 1 / 8;
                    this.R5 = 1 / 5;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 11:
                    this.R3 = 5;
                    this.R4 = 1 / 9;
                    this.R5 = 1 / 6;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 12:
                    this.R3 = 8;
                    this.R4 = 1 / 9;
                    this.R5 = 1 / 4;
                    this.gameStateMachine.stateMode = 69;
                    break;
                case 13:
                    this.R3 = 6;
                    this.R4 = 1 / 3;
                    this.R5 = 2 / 3;
                    this.gameStateMachine.stateMode = 69;
                    break;
                default: //14
                    this.terminal.print("AS A CLUB OR SIGHT");
                    this.gameStateMachine.stateMode = 70;
                    this.inputStr();
                    break;
            }
        }
    }

    throwFood = () => { //67
        this.strQ = this.inputString.trim();
        if (this.strQ === "HIT") {
            this.gameStateMachine.stateMode = 72;
        } else {
            this.terminal.print(
                "THROW A-ABOVE,B-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER");
            this.Z5 = 0;
            this.gameStateMachine.stateMode = 73;
            this.inputStr();
        }
    }

    knucklehead = () => { //68
        this.strQ = this.inputString.trim();
        if (this.strQ !== "NO") {
            this.gameStateMachine.stateMode = 25;
        } else {
            this.terminal.println("O.K. PUNCH BITE SCRATCH HIT ........");
            let m = 0;
            let n = 0;
            for (let M = -1; M <= 1; M++) {
                for (let N = -1; N <= 1; N++) {
                    if (this.gameState.dungeonMap[this.mapY + M][this.mapX + N] === 5) {
                        m = M;
                        M = 2;
                        n = N;
                        N = 2;
                    }
                }
            }
            if (m === 0 && n === 0) {
                this.terminal.println("NO GOOD ONE");
                this.gameStateMachine.stateMode = 25;
            } else {
                if (int(rnd(0) * 20) + 1 >
                    this.gameState.monsterStats[this.gameState.currentMonster][2]) {
                    this.terminal.println("GOOD A HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] / 6);
                    this.gameStateMachine.stateMode = 25;
                } else {
                    this.terminal.println("TERRIBLE NO GOOD");
                    this.gameStateMachine.stateMode = 200;
                }
            }
        }
    }

    resolveImprov = () => { //69
        if (this.range > this.R3) {
            this.terminal.println("HE IS OUT OF RANGE");
            this.gameStateMachine.stateMode = 200;
        } else {
            switch (this.toHitRoll) {
                case 0:
                    this.terminal.println("MISS");
                    break;
                case 1:
                    this.terminal.println("HIT BUT NO DAMAGE");
                    break;
                case 2:
                    this.terminal.println("HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * R4);
                    break;
                default:
                    this.terminal.println("CRITICAL HIT");
                    this.gameState.monsterStats[this.gameState.currentMonster][3] -= int(
                        this.gameState.attributes[this.constants.playerStr] * R5);
                    break;
            }
            this.gameStateMachine.stateMode = 71;
        }
    }

    gotSilverCross = () => { //70
        this.strQ = this.inputString.trim();
        if (this.strQ === "SIGHT") {
            if (this.range < 10) {
                this.terminal.println("THE MONSTER IS HURT");
                this.R5 = 1 / 6;
                if (this.gameState.currentMonster === 2 ||
                    this.gameState.currentMonster === 10 ||
                    this.gameState.currentMonster === 4) {
                    this.toHitRoll = 3;
                } else {
                    this.toHitRoll = 1;
                }
                this.range = R3 - 1;
                this.gameStateMachine.stateMode = 69;
            } else {
                this.terminal.println("FAILED");
                this.gameStateMachine.stateMode = 200;
            }
        } else {
            if (this.getCurrentWeapon() === 14) {
                this.R3 = 1.5;
                this.R4 = 1 / 3;
                this.R5 = 1 / 2;
                this.gameStateMachine.stateMode = 69;
            } else {
                this.terminal.println("NO WEAPON FOUND");
                this.gameStateMachine.stateMode = 25;
            }
        }
    }

    /***
     * Uses up the player's weapon when used at range
     */
    consumeWpn = () => { //71 //line 6300
        if (this.getCurrentWeapon() === 14) { //silver cross as sight
            this.gameStateMachine.stateMode = 200;
        } else {
            let weapon = this.getCurrentWeapon();
            this.gameState.inventory[this.gameState.currentWeaponIndex] = 0;
            if (weapon !== 7) { //not arrows
                this.setCurrentWeapon(0);
            } else {
                this.setCurrentWeapon(7);
            }
            if (this.toHitRoll > 0) {
                this.gameStateMachine.stateMode = 25;
            } else {
                this.gameStateMachine.stateMode = 200;
            }
        }
    }

    /***
     * Pelt the monster with food to damage it
     */
    peltMonster = () => { //72
        if (int(rnd(20)) + 1 === 20) {
            this.terminal.println("DIRECT HIT");
            this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] -= int(
                this.gameState.attributes[this.constants.playerStr] / 6);
        } else if (int(rnd(20)) + 1 >
            this.gameState.monsterStats[this.gameState.currentMonster][2] -
            this.gameState.attributes[this.constants.playerDex] / 3) {
            this.terminal.println("HIT");
            this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] -= int(
                this.gameState.attributes[this.constants.playerStr] / 8);
        } else if (int(rnd(20)) + 1 > 10 -
            this.gameState.attributes[this.constants.playerDex] / 3) {
            this.terminal.println("YOU HIT HIM BUT NOT GOOD ENOUGH");
        } else {
            this.terminal.println("TOTAL MISS");
        }
        this.gameStateMachine.stateMode = 74;
    }

    /***
     * Bait the monster with food to steer it
     */
    kiteMonster = () => { //73
        this.strQ = this.inputString.trim();
        if (this.strQ === "B") {
            this.S = -1;
            this.T = 0;
        } else if (this.strQ === "A") {
            this.S = 1;
            this.T = 0;
        } else if (this.strQ === "L") {
            this.S = 0;
            this.T = -1;
        } else if (this.strQ === "R") {
            this.S = 0;
            this.T = 1;
        }
        let look = this.gameState.dungeonMap[this.gameState.F1 + this.S][this.gameState.F2 + this.T];
        if (look === 0) {
            this.terminal.println("MONSTER MOVED BACK");
            this.gameState.dungeonMap[this.gameState.F1][this.gameState.F2] = 0;
            this.gameState.F1 += this.S;
            this.gameState.F2 += this.T;
            this.gameState.dungeonMap[this.gameState.F1][this.gameState.F2] = 5;
        } else if (look === 2) { //Then Goto 04280
            this.terminal.println(
                "GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD");
            this.K1 = -1;
            this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] = 0;
            this.gameState.dungeonMap[this.gameState.F1][this.gameState.F2] = 0; //bug - monster stayed on map
            //stateMode = 200; //bug - kept the food
        } else {
            this.terminal.println("DIDN'T WORK");
        }
        this.gameStateMachine.stateMode = 74;
    }

    /***
     * Use up the food being equipped after baiting a monster
     */
    consumeFood = () => { //74
        if (Z5 === 0) {
            for (let M = 1; M <= this.gameState.inventoryCounter; M++) {
                let weapon = this.getCurrentWeapon();
                this.gameState.inventory[this.gameState.currentWeaponIndex] = 0;
                this.setCurrentWeapon(weapon);
            }
        }
        this.gameStateMachine.stateMode = 200;
    }

    /***
     * Display the surroundings of the player
     * Obscure secret details
     */
    looking = () => { //75
        let line, m, n;
        for (let M = -5; M < 6; M++) {
            line = "";
            for (let N = -5; N < 6; N++) {
                m = M + this.mapY;
                n = N + this.mapX;
                if (this.inBounds(m, n)) {
                    if ((M === 0) && (N === 0)) {
                        line += "9";
                    } else {
                        switch (this.gameState.dungeonMap[m][n]) {
                            case 3:
                                line += "1";
                                break;
                            case 2:
                            case 7:
                            case 8:
                                line += "0";
                                break;
                            default:
                                line += this.gameState.dungeonMap[m][n];
                        }
                    }
                }
            }
            if (line !== "") this.terminal.println(line);
        }
        this.gameStateMachine.stateMode = 200;
    }

    saveGame = () => { //76
        this.gameState.serialiseToCookie(Document, 'dnd1file7', this.cookieLifespan);
        this.gameStateMachine.stateMode = 25;
    }

    casting = () => { //77
        this.terminal.println("MAGIC");
        if (this.getCurrentWeapon() !== 0) { //Then Goto 08740
            this.terminal.println("YOU CAN'T USE MAGIC WITH WEAPON IN HAND");
            this.gameStateMachine.stateMode = 200;
        } else if (this.attributeNames[this.constants.playerClass] === "CLERIC") {
            this.terminal.print("CLERICAL SPELL #");
            this.gameStateMachine.stateMode = 78;
            this.input();
        } else if (this.attributeNames[this.constants.playerClass] === "WIZARD") {
            this.terminal.print("SPELL #");
            this.gameStateMachine.stateMode = 87;
            this.input();
        } else {
            this.terminal.println("YOU CANT USE MAGIC YOU'RE NOT A M.U.");
            this.gameStateMachine.stateMode = 200;
        }
    }

    gotClericSpell = () => { //78
        this.Q = parseInt(this.inputString.trim());
        let found = false;
        let spellChoice;
        for (let m = 1; m <= this.gameState.clericSpellCounter; m++) {
            if (this.Q === this.gameState.clericSpellbook[m]) {
                this.M = m;
                found = true;
                m = this.gameState.clericSpellCounter + 1;
            }
        }
        if (!found) {
            this.terminal.println("YOU DONT HAVE THAT SPELL");
            this.gameStateMachine.stateMode = 200;
        } else {
            spellChoice = this.gameState.clericSpellbook[this.M];
            this.gameState.clericSpellbook[this.M] = 0;
            //route clerical spell choice
            if (spellChoice > 3) {
                this.Q = 2;
            } //bug fix - find all spell uses Q to match floor tile types, not Q2 or Q3
            if (spellChoice > 4) {
                this.Q = 3;
            }
            switch (spellChoice) {
                case 1:
                    this.gameStateMachine.stateMode = 79;
                    break;
                case 2:
                    this.gameStateMachine.stateMode = 80;
                    break;
                case 3:
                    this.gameStateMachine.stateMode = 81;
                    break;
                case 4:
                    this.gameStateMachine.stateMode = 82;
                    break;
                case 5:
                    this.gameStateMachine.stateMode = 83;
                    break;
                case 6:
                    this.gameStateMachine.stateMode = 84;
                    break;
                case 7:
                    this.gameStateMachine.stateMode = 85;
                    break;
                case 8:
                    this.gameStateMachine.stateMode = 82;
                    break;
                case 9: //cheat - there is no spell #9 for clerics, this is the push spell
                    this.gameStateMachine.stateMode = 86;
                    break;
                default:
                    this.terminal.println("YOU DONT HAVE THAT SPELL");
                    this.gameStateMachine.stateMode = 200;
                    break;
            }
        }
    }

    clericSpellKill = () => { //79
        if (rnd(3) > 1) {
            this.terminal.println("FAILED");
        } else {
            this.terminal.println("DONE");
            this.K1 = -1;
        }
        this.gameState.clericSpellbook[this.M] = 0;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellMagicMissileAdvanced = () => { //80
        this.terminal.println("DONE");
        this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] -= 4;
        this.gameState.clericSpellbook[this.M] = 0;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellCureLight = () => { //81
        this.gameState.attributes[this.constants.playerCon] += 3;
        this.gameState.clericSpellbook[this.M] = 0;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellFindTraps = () => { //82
        this.gameState.clericSpellbook[this.M] = 0;
        for (let M = -3; M < 4; M++) {
            for (let N = -3; N < 4; N++) {
                if (!((this.mapY + M < 0) || (this.mapY + M > 25) || (this.mapX + N < 0) ||
                    (this.mapX + N > 25))) {
                    if (this.gameState.dungeonMap[this.mapY + M][this.mapX + N] === this.Q)
                        this.terminal.println(
                            "THERE IS ONE AT " + (this.mapY + M) + "LAT." +
                            (this.mapX + N) + "LONG.");
                }
            }
        }
        this.terminal.println("NO MORE");
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellMagicMissile = () => { //83
        this.terminal.println("DONE");
        this.gameState.clericSpellbook[this.M] = 0;
        this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] -= 2;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellMagicMissileUltimate = () => { //84
        this.terminal.println("DONE");
        this.gameState.clericSpellbook[this.M] = 0;
        this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] -= 6;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpellCureLightAdvanced = () => { //85
        this.terminal.println("DONE");
        this.gameState.attributes[this.constants.playerCon] += 3;
        this.gameStateMachine.stateMode = 200;
    }

    clericSpell9 = () => { //86
        if (this.gameState.currentMonster === 4 || this.gameState.currentMonster === 10) {
            this.terminal.println("DONE");
            this.terminal.println("YOU DONT HAVE THAT ONE");
            this.gameStateMachine.stateMode = 25;
        } else {
            this.terminal.println("FAILED");
            this.gameStateMachine.stateMode = 200;
        }
    }

    gotWizardSpell = () => { //87  //09320
        this.Q = parseInt(this.inputString.trim());
        let found = false;
        for (let m = 1; m <= this.gameState.wizardSpellCounter; m++) {
            if (this.Q === this.gameState.wizardSpellbook[m]) {
                found = true;
                this.M = m;
                m = this.gameState.wizardSpellCounter + 1;
            }
        }
        if (found) {  //09380
            if (this.gameState.wizardSpellbook[this.M] === 1) { // push
                // var F2 = 0;
                if ((this.gameState.F1 - this.mapY === 0) &&
                    (this.gameState.F2 - this.mapX === 0)) {
                    this.S = 0;
                    this.T = 0;
                    this.Z5 = 1; // stop food being used at end of bait action
                    this.inputString = "";
                } else {
                    this.terminal.println(
                        "ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
                    this.inputStr();
                }
                this.gameStateMachine.stateMode = 73;
            } else {
                this.R = 5;
                switch (this.gameState.wizardSpellbook[this.M]) {
                    case 2:
                        this.gameStateMachine.stateMode = 88;
                        break;
                    case 3:
                        this.Q = 2;
                        this.gameStateMachine.stateMode = 89;
                        break;
                    case 4:
                        this.Q = 2;
                        this.gameStateMachine.stateMode = 90;
                        break;
                    case 5:
                        this.Q = 0;
                        this.gameStateMachine.stateMode = 91.5;
                        break;
                    case 6:
                        this.Q = 3;
                        gameStateMachine.stateMode = 83; // shared with cleric
                        break;
                    case 7:
                        this.Q = 6;
                        this.gameStateMachine.stateMode = 80; // shared with cleric
                        break;
                    case 8:
                        this.Q = 9;
                        this.gameStateMachine.stateMode = 84; // shared with cleric
                        break;
                    case 9:
                        this.Q = 3;
                        this.gameStateMachine.stateMode = 89;
                        break;
                    case 10:
                        this.Q = 1;
                        this.gameStateMachine.stateMode = 91.5;
                        break;
                    default:
                        this.terminal.println("YOU DONT HAVE THAT ONE");
                        this.gameStateMachine.stateMode = 25;
                        break;
                }
            }
        } else {
            this.terminal.println("YOU DONT HAVE THAT ONE");
            this.gameStateMachine.stateMode = 25;
        }
    }

    wizardSpellKill = () => { //88 KILL
        if (rnd(3) > 1) {
            this.terminal.println("DONE");
            this.K1 = -1;
        } else {
            this.terminal.println("FAILED");
        }
        this.gameStateMachine.stateMode = 200;
    }

    wizardSpellFindTrap = () => { //89 find traps
        this.gameState.wizardSpellbook[this.M] = 0; //?
        for (let M = -3; M < 4; M++) {
            for (let N = -3; N < 4; N++) {
                if (this.inBounds(this.mapY + M, this.mapX + N))
                    if (this.gameState.dungeonMap[this.mapY + M][this.mapX + N] ===
                        this.Q) {
                        this.terminal.println(
                            "THERE IS ONE AT " + (this.mapY + M) + "LAT." +
                            (mapX + N) +
                            "LONG."
                        );
                    }
            }
        }
        this.terminal.println("NO MORE");
        this.gameStateMachine.stateMode = 200;
    }

    wizardSpellTeleport = () => { //90 teleport
        this.gameStateMachine.stateMode = 91;
        this.getSpellCoordinates();
    }

    gotTeleportCoordinates = () => { //91 teleport
        this.M = parseInt(inputStrings[1]);
        this.N = parseInt(inputStrings[0]);
        if (this.inBounds(this.M, this.N)) {
            this.terminal.println("DONE");
            this.mapY = this.M;
            this.mapX = this.N;
        } else {
            this.terminal.println("FAILED");
        }
        this.gameStateMachine.stateMode = 200;
    }

    getSpellCoordinates = () => {
        this.terminal.print("INPUT CO-ORDINATES");
        this.inputX(2);
    }

    gotSpellChange = () => { //91.5
        this.terminal.print("INPUT CO-ORDINATES");
        this.gameStateMachine.stateMode = 91.6;
        this.getSpellCoordinates();
    }

    gotChangeCoordinates = () => { //91.6
        let toCell;
        let fromCell;
        if (this.Q === 1) {
            fromCell = 0;
            toCell = 1;
        } else {
            fromCell = 1;
            toCell = 0;
        }
        this.M = parseInt(this.inputStrings[1]);
        this.N = parseInt(this.inputStrings[0]);
        if (this.inBounds(this.M, this.N)) {
            if (this.gameState.dungeonMap[this.M][this.N] === fromCell) {
                this.gameState.dungeonMap[this.M][this.N] = toCell;
                this.terminal.println("DONE");
            } else {
                this.terminal.println("FAILED");
            }
        } else {
            this.terminal.println("FAILED");
        }
        this.gameStateMachine.stateMode = 200;
    }

    buyMagic = () => { //92
        if (this.gameState.attributeNames[this.constants.playerClass] === "CLERIC") {
            this.gameStateMachine.stateMode = 93;
        } else if (this.gameState.attributeNames[this.constants.playerClass] === "WIZARD") {
            this.gameStateMachine.stateMode = 94;
        } else {
            this.terminal.println("YOU CAN'T BUY ANY");
            this.gameStateMachine.stateMode = 25;
        }
    }

    askACleric = () => { //93
        this.terminal.println("DO YOU KNOW THE CHOICES");
        this.inputStr();
        this.gameStateMachine.stateMode = 95;
    }

    askAWizard = () => { //94
        this.terminal.println("DO YOU KNOW THE SPELLS");
        this.inputStr();
        this.gameStateMachine.stateMode = 96;
    }

    clericSpellChoices = () => { //95
        this.strQ = this.inputString.trim();
        if (this.strQ === "NO") {
            this.terminal.println("1-KILL-500  5-MAG. MISS. #1-100");
            this.terminal.println("2-MAG. MISS. #2-200  6-MAG.MISS. #3-300");
            this.terminal.println("3-CURE LIGHT #1-200  7-CURE LIGHT #2-1000");
            this.terminal.println("4-FIND ALL TRAPS-200  8-FIND ALL S.DOORS-200");
            this.terminal.print("INPUT # WANTED   NEG.NUM.TO STOP");
        }
        this.input();
        this.gameStateMachine.stateMode = 97;
    }

    wizardSpellChoices = () => { //96
        this.strQ = this.inputString.trim();
        if (this.strQ === "NO") {
            this.terminal.println("1-PUSH-75   6-MAG. MISS. #1-100");
            this.terminal.println("2-KIHL-500  7-MAG. MISS. #2-200");
            this.terminal.println("3-FIND TRAPS-200  8-MAG. MISS. #3-300");
            this.terminal.println("4-TELEPORT-750  9-FIND S.DOORS-200");
            this.terminal.println("5-CHANGE 1+0-600  10-CHANGE 0+1-600");
            this.terminal.print("#OF ONE YOU WANT  NEG.NUM.TO STOP");
        }
        this.input();
        this.gameStateMachine.stateMode = 98;
    }

    clericSpellPurchase = () => { //97
        if (this.Q > 0) { //Then Goto 10290
            if (this.Q <= 8) { //Then Goto 10100
                if (this.gameState.attributes[this.constants.playerGold] -
                    this.clericSpellPrices[int(this.Q)] < 0) {// Then Goto 10270
                    this.terminal.println("COSTS TOO MUCH");
                } else {
                    this.gameState.attributes[this.constants.playerGold] -= this.clericSpellPrices[int(
                        this.Q)];
                    this.terminal.println("IT IS YOURS");
                    this.gameState.addClericSpell(int(this.Q));
                }
            }
            this.input();
            this.gameStateMachine.stateMode = 97;
        } else {
            this.terminal.println("YOUR SPELLS ARE");
            for (this.M = 1; this.M <= this.gameState.clericSpellCounter; this.M++) {
                if (this.gameState.clericSpellbook[this.M] !== 0) {
                    this.terminal.println("#" + this.gameState.clericSpellbook[this.M]);
                }
            }
            this.terminal.println("DONE");
            this.gameStateMachine.stateMode = 25;
        }
    }

    wizardSpellPurchase = () => { //98
        if (this.Q > 0) {
            if (this.Q <= 10) {
                if (this.gameState.attributes[this.constants.playerGold] -
                    this.wizardSpellPrices[int(this.Q)] < 0) {
                    this.terminal.println("COSTS TOO MUCH");
                } else {
                    this.gameState.attributes[this.constants.playerGold] -= this.wizardSpellPrices[int(
                        this.Q)];
                    this.terminal.println("IT IS YOURS");
                    this.gameState.addWizardSpell(int(this.Q));
                }
            }
            this.input();
            this.gameStateMachine.stateMode = 98;
        } else {
            this.terminal.println("YOU NOW HAVE");
            for (this.M = 1; this.M <= this.gameState.wizardSpellCounter; this.M++) {
                if (this.gameState.wizardSpellbook[this.M] !== 0) {
                    this.terminal.println("#" + this.gameState.wizardSpellbook[this.M]);
                }
            }
            this.gameStateMachine.stateMode = 25;
        }
    }

    showCheatMap = () => { //99 - cheating
        let line;
        for (let M = 0; M <= 25; M++) {
            line = "";
            for (let N = 0; N <= 25; N++)
                line += this.gameState.dungeonMap[M][N];
            this.terminal.println(line);
        }
        this.gameStateMachine.stateMode = 25;
    }

    buyHP = () => { //100
        this.terminal.print("HOW MANY 200 GP. EACH ");
        this.input();
        this.gameStateMachine.stateMode = 101;
    }

    addHP = () => { //101
        this.Q = parseInt(this.inputString.trim());
        if (this.gameState.attributes[7] - 200 * this.Q < 0) {
            this.terminal.println("NO");
            this.gameStateMachine.stateMode = 100;
        } else {
            this.gameState.attributes[this.constants.playerHp] += int(this.Q);
            this.gameState.attributes[this.constants.playerGold] -= int(this.Q) * 200;
            this.terminal.println("OK DONE");
            this.terminal.println("HP= " + this.gameState.attributes[0]);
            for (let M = 1; M <= 7; M++) {
                this.terminal.println(
                    this.attributeNames[M] + "= " +
                    this.gameState.attributes[M]);
            }
            this.gameStateMachine.stateMode = 200;
        }
    }

    modifyMap = () => { //102
        this.terminal.print("DNG");
        this.input();
        this.gameStateMachine.stateMode = 102.5;
    }

    modifyGotMap = () => { //102.5
        this.gameState.Dn = parseInt(this.inputString.trim());
        this.gameStateMachine.stateMode = 103;
    }

    modifyMapPos = () => { //103
        this.terminal.print("X,Y,C");
        this.inputX(3);
        this.gameStateMachine.stateMode = 104;
    }

    modifyMapDone = () => { //104
        let targetX = parseInt(this.inputStrings[2]);
        let targetY = parseInt(this.inputStrings[1]);
        let content = parseInt(this.inputStrings[0]);
        if (content < 0) {
            this.terminal.println("SAVE");
            this.input();
            this.gameStateMachine.stateMode = 105;
        } else {
            this.gameState.dungeonMap[targetY][targetX] = content;
            this.gameStateMachine.stateMode = 103;
        }
    }

    modifyMapSave = () => {
        let stream;
        this.Q = parseInt(this.inputString.trim());
        if (this.Q === 1) {
            let DName = "dnd1file" + this.gameState.Dn + ".dungeonMap.";
            for (let M = 0; M <= 25; M++) {
                stream = "";
                for (let N = 0; N <= 25; N++) {
                    if (this.gameState.dungeonMap[M][N] !== 7 &&
                        this.gameState.dungeonMap[M][N] !== 8) {
                        stream += this.gameState.dungeonMap[M][N] + "|";
                    } else {
                        stream += "0|";
                    }
                }
                setCookie(Document, DName + M, stream, this.cookieLifespan);
            }
        }
        this.gameStateMachine.stateMode = 200;
    }

    checkPlayerHealth = () => {
        if (this.gameState.attributes[this.constants.playerHp] < 2) { // low on health
            if (this.gameState.attributes[this.constants.playerHp] < 1) { // bleeding out
                while (this.gameState.attributes[this.constants.playerHp] < 0) {
                    if (this.gameState.attributes[this.constants.playerCon] < 9) {
                        this.gameState.attributes[this.constants.playerHp] = 0;
                        this.gameState.attributes[this.constants.playerCon] = 0; //exit loop, force dead
                    } else {
                        this.gameState.attributes[this.constants.playerCon] -= 2;
                        this.gameState.attributes[this.constants.playerHp] += 1;
                    }
                }
                if (this.gameState.attributes[this.constants.playerHp] === 0) {
                    if (this.gameState.attributes[this.constants.playerCon] < 9) {
                        this.terminal.println("SORRY YOU'RE DEAD");
                        this.gameStateMachine.stateMode = 30;
                    } else {
                        this.terminal.println("H.P.=0 BUT CONST. HOLDS");
                    }
                }
            } else {
                this.terminal.println("WATCH IT H.P.=" +
                    this.gameState.attributes[this.constants.playerHp]);
            }
        }
    }

    testForCloneMove = () => { // 50% change to start a clone move
        if (rnd(20) > 10) {
            this.gameStateMachine.stateMode = 202;
        } else {
            this.gameStateMachine.stateMode = 25;
        }
    }

    /***
     * Route game move
     * One of the trickier pieces of code to decipher
     *
     */
    routeGameMove = () => { //200
        this.gameStateMachine.stateMode = 0;
        if (this.K1 === -1) { // if target is dead credit the kill
            this.gameStateMachine.stateMode = 203;
        } else { //check player health and report
            this.checkPlayerHealth();
        }
        if (this.gameStateMachine.stateMode === 0) {
            if (this.gameState.currentMonster > 0) { // 07160
                this.gameStateMachine.stateMode = 206;    //monster action (actual move)
            } else if (!(this.mapY === 1 && this.mapX === 12)) {
                this.testForCloneMove();
            } else {
                this.terminal.println("SO YOU HAVE RETURNED");
                if (this.gameState.attributes[this.constants.playerGold] < 100) {
                    this.testForCloneMove();
                } else {
                    this.gameState.attributes[this.constants.playerGold] -= 100;
                    this.terminal.println("WANT TO BUY MORE EQUIPMENT");
                    this.inputStr();
                    this.gameStateMachine.stateMode = 201;
                }
            }
        }
    }

    /***
     * Response to user input to buy more equipment
     */
    gotMoreEquipment = () => { //201
        this.strQ = this.inputString.trim();
        if (this.strQ === "YES") {
            this.terminal.println("YOUR H.P. ARE RESTORED 2 POINTS");
            this.gameState.attributes[this.constants.playerHp] += 2;
            this.gameStateMachine.stateMode = 18;
        } else {
            this.testForCloneMove();
        }
    }

    /***
     * Moves one monster - not so much a move as a clone as it
     * potentially leaves a "5" on the map elsewhere.
     * Scan all living monsters and give each one a 7.5% change to "move"
     * Make 50 attempts and stop after the first successful move
     */
    monsterMove = () => { //202
        let moved = false;
        let alive = false;
        let Z7 = 1;
        while (!moved && Z7 <= 50) {
            this.M = 1;
            while (!moved && this.M <= 10) {
                if (this.gameState.monsterStats[this.M][this.constants.monsterHp] > 0) {
                    alive = true;
                    if (rnd(0) > 0.925) {
                        moved = true;
                        this.gameStateMachine.stateMode = 204;
                        this.M--; // retard M for a moment to give the right result at the end of the routine
                    }
                }
                this.M++;
            }
            Z7++;
        }
        if (!moved) {
            if (!alive) {
                this.terminal.println("ALL MONSTERS DEAD");
                this.terminal.print("RESET?");
                this.inputStr();
                this.gameStateMachine.stateMode = 205;
            } else {
                this.gameStateMachine.stateMode = 200;
            }
        }
    }

    confirmedKill = () => { //203
        this.K1 = 0;
        const current = this.gameState.currentMonster;
        this.gameState.attributes[this.constants.playerGold] += this.gameState.monsterStats[current][this.constants.monsterStartHp];
        this.gameState.F1 = 0;
        this.gameState.F2 = 0;
        this.terminal.println(
            "GOOD WORK YOU JUST KILLED A " + this.gameState.monsterNames[current]);
        this.terminal.println("AND GET " +
            this.gameState.monsterStats[current][this.constants.monsterStartHp] +
            "GOLD PIECES");
        if (this.J6 !== 1)
            this.gameState.monsterStats[current][this.constants.monsterStartHp] = 0;
        this.terminal.println(
            "YOU HAVE" + this.gameState.attributes[this.constants.playerGold] + " GOLD ");
        this.gameState.monsterStats[current][this.constants.monsterHp] = 0;
        if (this.J6 === 1) {
            this.gameState.monsterStats[current][3] = this.gameState.monsterStats[this.gameState.currentMonster][4]
                * this.gameState.monsterStats[this.gameState.currentMonster][1];
            this.gameState.monsterStats[current][this.constants.monsterHp] = this.gameState.monsterStats[current][this.constants.monsterStartHp]
                * this.gameState.monsterStats[current][1];
        }
        this.gameState.currentMonster = 0;
        this.gameStateMachine.stateMode = 25;
    }

    /***
     * scans map around player and creates current monster at a random location
     * Sets up F1 and F2 after spawn prior to action check
     */
    makeAMonster = () => { //204 line 8000
        let loopCounter = 0;
        this.gameState.currentMonster = this.M; // value carried from move a monster (202)
        let moved = false;
        while (!moved) { //dangerous - but statistically should never lock unless it is a very poor map
            loopCounter++; //stop it locking permanently
            let M1 = int(rnd(5) + 3); //select a random range 3-7
            this.M = M1 * -1; // vertical from negative range to positive range
            while (!moved && this.M <= M1) {
                this.N = M1 * -1; // horizontal from negative range to positive range
                while (!moved && this.N <= M1) {
                    if (Math.abs(this.M) > 2 || Math.abs(this.N) > 2) { // if outside attack range
                        if (this.inBounds(this.mapY + this.M, this.mapX + this.N)) {
                            if (rnd(0) <= 0.7) { // 70% chance
                                if (this.gameState.dungeonMap[this.mapY + this.M][this.mapX + this.N] ===
                                    0) { //if cell is empty
                                    moved = true;
                                    this.spawnMonsterAt(this.mapY + this.M, this.mapX + this.N);
                                }
                            }
                        }
                    }
                    this.N++;
                }
                this.M++;
            }
            if (loopCounter > 10) {
                moved = true;
            } //break out of loop
        }
        this.gameStateMachine.stateMode = 200;
        return loopCounter;
    }

    /***
     * Sets a map cell to 5 (monster)
     * @param Y
     * @param X
     */
    spawnMonsterAt = (Y, X) => {
        this.gameState.dungeonMap[Y][X] = 5;
        this.gameState.F1 = Y;
        this.gameState.F2 = X;
    }

    /***
     * on "yes":
     * resets monsters, increases difficulty level
     * else quit
     */
    resetAfterClear = () => { //205
        this.strQ = this.inputString.trim();
        if (this.strQ === "YES") {
            // reset
            this.difficultyFactor += 1; //up difficultly level
            for (let m = 1; m <= this.maxMonsterIndex; m++) {
                this.gameState.monsterStats[m][3] = this.gameState.monsterStats[m][4] *
                    this.difficultyFactor;
                this.gameState.monsterStats[m][this.constants.monsterHp] = this.gameState.monsterStats[m][this.constants.monsterStartHp] *
                    this.difficultyFactor;
            }
            this.gameState.attributes[this.constants.playerHp] += 5;
            this.gameStateMachine.stateMode = 25;
        } else {
            this.gameStateMachine.stateMode = 30;
            this.terminal.println("[STOP]");
        }
    }

    /***
     * refactored from state 206 (monsterAction)
     * if in range - attack
     * else move closer
     */
    monsterMovement = () => {
        this.findRange();
        if (this.range < 2.0) { //Then Goto 07600
            //it attacks
            this.gameStateMachine.stateMode = 207;
        } else if (this.P0 > 10) { //Then Goto 01590 //note P0 is NEVER modified from 0 suspect typo in original printout
            this.gameStateMachine.stateMode = 25;
        } else {
            this.resolveMonsterMove();
        }
    }

    /***
     * determine direction of movement and if the move can be made complete it
     */
    resolveMonsterMove = () => {
        let mapRowDelta = 0, mapColumnDelta = 0;
        // direction of movement
        if (Math.abs(this.rangeRowOffset) > Math.abs(this.rangeColumnOffset)) { //Then Goto 07260
            mapRowDelta = -(this.rangeRowOffset / Math.abs(this.rangeRowOffset));
        } else {
            if (this.M !== 1) { // Then Goto 07270 - obscure logic
                mapColumnDelta = -(this.rangeColumnOffset /
                    Math.abs(this.rangeColumnOffset))
            }
        }
        // check movement is possible and resolve
        this.gameStateMachine.stateMode = 25;
        if (this.inBounds(this.gameState.F1 + mapRowDelta,
            this.gameState.F2 + mapColumnDelta)) {
            switch (this.gameState.dungeonMap[this.gameState.F1 +
            mapRowDelta][this.gameState.F2 + mapColumnDelta]) {
                case 0:
                case 6:
                case 7:
                case 8:
                    this.translateMonsterPosition(mapRowDelta, mapColumnDelta);
                    break;
                case 2:
                    this.terminal.println("GOOD WORK  YOU LED HIM INTO A TRAP");
                    this.K1 = -1;
                    this.gameState.monsterStats[this.gameState.currentMonster][this.constants.monsterHp] = 0;
                    this.gameStateMachine.stateMode = 200; //auto kill
                    break;
                case 3:
                case 4:
                    //through a door
                    if (this.gameState.dungeonMap[this.gameState.F1 + 2 *
                    mapRowDelta][this.gameState.F2 + 2 * mapColumnDelta] === 0) { // Then Goto 07510
                        mapRowDelta = mapRowDelta * 2;
                        mapColumnDelta = mapColumnDelta * 2;
                        this.translateMonsterPosition(mapRowDelta, mapColumnDelta);
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
    translateMonsterPosition = (rowDelta, columnDelta) => {
        this.gameState.dungeonMap[this.gameState.F1][this.gameState.F2] = 0;
        this.gameState.F1 += rowDelta;
        this.gameState.F2 += columnDelta;
        this.gameState.dungeonMap[this.gameState.F1][this.gameState.F2] = 5;
        this.findRange();
    }

    /***
     * dead or alive?
     */
    monsterAction = () => { //206
        if (this.gameState.monsterStats[this.gameState.currentMonster][3] < 1) { //Then Goto 08290
            this.gameStateMachine.stateMode = 203; //it's a kill
        } else {
            this.monsterMovement();
        }
    }

    /***
     * Calculate protection value based on stat and equipment
     * note: current method is very stupid
     * @returns {int} protection value
     */
    calculatePlayerProtection = () => {
        let result = 6 + this.gameState.attributes[this.constants.playerDex];
        let i = 1, found = false;
        while (i <= this.gameState.inventoryCounter && !found) {
            switch (this.gameState.inventory[i]) {
                case 10:
                    found = true;
                    result = 20 + this.gameState.attributes[this.constants.playerDex];
                    break;
                case 9:
                    found = true;
                    result = 16 + this.gameState.attributes[this.constants.playerDex];
                    break;
                case 8:
                    found = true;
                    result = 8 + this.gameState.attributes[this.constants.playerDex];
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
    monsterSwings = () => { //207
        this.terminal.println(
            this.gameState.monsterNames[this.gameState.currentMonster] + " WATCH IT");
        if (rnd(40) > this.calculatePlayerProtection()) {
            this.terminal.println("MONSTER SCORES A HIT");
            this.gameState.attributes[this.constants.playerHp] -= int(
                rnd(this.gameState.monsterStats[this.gameState.currentMonster][2]) + 1);
            this.terminal.println(
                "H.P.=" + this.gameState.attributes[this.constants.playerHp]);
            this.gameStateMachine.stateMode = 200;
        } else {
            if (rnd(2) > 1) {
                this.terminal.println("HE HIT BUT NOT GOOD ENOUGH");
                this.gameStateMachine.stateMode = 200;
            } else {
                this.terminal.println("HE MISSED");
                this.gameStateMachine.stateMode = 25;
            }
        }
    }
}

//global routines
function initialiseGame() {
    const game = new dnd1();
    game.main(new Console('mainConsole', 30, 40));
    $(document).on("endInput", function(event) {
        if (game.debug) console.log(event);
        game.gotInput();
    });
    $(document).on("partialInput", function(event) {
        if (game.debug) console.log(event);
        game.partial();
    });
    $(document).keypress(function(event) {
        console.info(game.reading, event.which);
        const charCode = event.which;
        if (game.reading && charCode === 13) {
            event.preventDefault();
            game.reading = false;
            $(document).trigger("endInput", [
                {
                    type: "endInput",
                    message: "EOL",
                    time: new Date(),
                    inner: event
                }]);
        } else if (game.reading) {
            if (
                isNumber(game.inputString + String.fromCharCode(charCode))
                || (String.fromCharCode(charCode) === "-"
                    && (game.inputString.length === 0))
            ) {
                game.inputString += String.fromCharCode(charCode);
            } else {
                game.inputString += String.fromCharCode(charCode);
            }
            $(document).trigger("partialInput", [
                {
                    type: "partialInput",
                    message: "DELTA",
                    time: new Date(),
                    inner: event
                }]);
        }
    });
    $(document).keydown(function(event) {
        if (game.reading) {
            if (event.keyCode === 8) {
                event.preventDefault();
                if (game.inputString.length > 0) {
                    game.inputString = game.inputString.substring(0,
                        game.inputString.length);
                    $(document).trigger("partialInput", [
                        {
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
