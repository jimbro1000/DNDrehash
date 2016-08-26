/*
 Port of Richard Garriott's DND #1
 © 1977-2014 Richard Garriott
 Ported by Julian Brown
 all rights to this port remain property of Richard Garriott
 Modified 30 Apr 2014
 */

/*
 ToDo:
 Create maps
 Test Case Scripts
*/
var debug = false; //global debug flag to enable logging
var difficultyFactor = 0;
var J6; //only used once - investigate
var inventoryCounter = 0;
var currentWeapon = 0;
var currentMonster = 0;
var K1 = 0;
var clericSpellCounter = 0;
var wizardSpellCounter = 0;
// var J9 = 0; //random seed
var attributes = [];
var attributeNames = [];
var inventory = [];
var dungeonMap = [];
var Dn = 1;
var D2 = 1; // target map for modification actions, currently redundant
var equipmentPrice = [];
var equipmentNames;
var monsterStats = []; // (100,6)
var monsterNames = []; // (100)
var maxMonsterIndex = 0;
// var E = []; // (100)
// var F = []; // (100)
var F1 = 0;
var F2 = 0;
var clericSpellPrices = []; //(100) cleric spell prices
var wizardSpellPrices = []; // (100) wizard spell prices
var clericSpellbook = []; // (100) cleric spellbook
var wizardSpellbook = []; // (100) As wizard spellbook
var mapY; // map y
var mapX; // map x
var R; // only appears to be used once - investigate
var S; // move delta
var T; // turn input / move delta
var M;
var N;
var P0;
var Y;
var Z;
var Z5; //only used once - investigate
var range, R2, R8, R9; //range and hit calcs
var R3, R4, R5; //combat calcs
var terminal; // display terminal
var Q; // numeric input
var strQ; //string input
var strN; // player name
var vbTab; // tab character

var reading; // block keypress event when true
var inputString;
var inputStrings = [];
var inputsCount;
var inputFilter;

var gameStateMachine;

var inputRow;
var inputColumn;

var CL;

function buildStateModel() {
    gameStateMachine = new StateMachine();
    gameStateMachine.addState(new StateModel(1, "loading", loadScreen));
    gameStateMachine.addState(new StateModel(2, "accept instructions input", gotInstructionInput));
    gameStateMachine.addState(new StateModel(3, "old or new game", gotLoadInput));
    gameStateMachine.addState(new StateModel(4, "cheeky instructions", showInstructions));
    gameStateMachine.addState(new StateModel(5, "accept oldnew input", gotLoadInput));
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
    gameStateMachine.addState(new StateModel(49, "into a trap", itsatrap));
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
    gameStateMachine.addState(new StateModel(60, "start player fight", fight1));
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
    gameStateMachine.addState(new StateModel(79, "cast cleric spell 1 (kill)", clericSpell1));
    gameStateMachine.addState(new StateModel(80, "cast cleric spell 2 (magic missile #2)", clericSpell2));
    gameStateMachine.addState(new StateModel(81, "cast cleric spell 3 (cure light wounds #1)", clericSpell3));
    gameStateMachine.addState(new StateModel(82, "cast cleric spell 4/8 (find all traps/s.doors)", clericSpell4));
    gameStateMachine.addState(new StateModel(83, "cast cleric spell 5 (magic missile #1)", clericSpell5));
    gameStateMachine.addState(new StateModel(84, "cast cleric spell 6 (magic missile #3)", clericSpell6));
    gameStateMachine.addState(new StateModel(85, "cast cleric spell 7 (cure light wounds #2)", clericSpell7));
    gameStateMachine.addState(new StateModel(86, "cast cleric spell 9 (cheat - push)", clericSpell9));
    gameStateMachine.addState(new StateModel(87, "cast a wizard spell", gotWizardSpell));
    gameStateMachine.addState(new StateModel(88, "cast wizard spell 2", wizardSpell2));
    gameStateMachine.addState(new StateModel(89, "cast wizard spell 3", wizardSpell3));
    gameStateMachine.addState(new StateModel(90, "cast wizard spell 4", wizardSpell4));
    gameStateMachine.addState(new StateModel(91, "accept wizard spell 4", gotWizardSpell4));
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
    gameStateMachine.addState(new StateModel(204, "make a monster move big step", makeAMonsterMove));
    gameStateMachine.addState(new StateModel(205, "got reset answer", resetAfterClear));
    gameStateMachine.addState(new StateModel(206, "make a monster move small step", monsterAction));
    gameStateMachine.addState(new StateModel(207, "monster attacks player", monsterSwings));
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i].trim();
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

function findRange() {
    //range and hit check
    var m, n;
    var tempY, tempX;
    range = 1000;
    tempY = 26;
    tempX = 26;
    for (m = -25; m <= 25; m++) {
        for (n = -25; n <= 25; n++) {
            if ((mapY + m <= 25) && (mapY + m >= 0) && (mapX + n <= 25) && (mapX + n >= 0)) {
                if (dungeonMap[mapY + m][mapX + n] == 5) {
                    tempY = m;
                    tempX = n;
                    range = Math.sqrt(tempY * tempY + tempX * tempX);
                    m = 26;
                    n = 26;
                }
            }
        }
    }
    R8 = tempY;
    R9 = tempX;
    if (int(rnd(0) * 20 + 1) > 18) {
        R2 = 3;
    } else {
        if (rnd(0) * 20 > monsterStats[currentMonster][2] == attributes[2] / 3) {
            R2 = 2;
        } else {
            if (rnd(0) * 2 > 1.7) {
                R2 = 1;
            } else {
                R2 = 0;
            }
        }
    }
}

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * generate a random number (mimic old basic function)
 * if x is 0 the result is in the range 0..1
 * otherwise the result is in the range 0..x
 * @return {number}
 */
function rnd(x) {
    if (x == 0) {
        return Math.random();
    } else {
        return x * Math.random();
    }
}

/**
 * gracefull round float to int (mimic old basic function)
 * @return {number}
 */
function int(x) {
    if (x < 0) {
        return Math.ceil(x);
    } else {
        return Math.floor(x);
    }
}

function initialiseGlobals(gameConsole) {
    CL = 365; //cookie lifespan
    mapY = int(rnd(24) + 2);
    mapX = int(rnd(24) + 2);
    terminal = gameConsole;
    reading = false;
    inputString = "";
    vbTab = String.fromCharCode(9);
    inventoryCounter = 0;
    Dn = 0;
    currentWeapon = 0;
    currentMonster = 0;
    P0 = 0;

    for (var m = 0; m < 50; m++) {
        dungeonMap[m] = [];
        for (var n = 0; n < 50; n++) {
            dungeonMap[m][n] = 0;
        }
    }
    for (m = 0; m < 100; m++) {
        monsterStats[m] = [];
        for (n = 0; n < 6; n++) {
            monsterStats[m][n] = 0;
        }
    }
    equipmentNames = ["", "SWORD", "2-mapX-SWORD", "DAGGER", "MACE", "SPEAR", "BOW", "ARROWS", "LEATHER MAIL", "CHAIN MAIL", "PLATE MAIL", "ROPE", "SPIKES", "FLASK OF OIL", "SILVER CROSS", "SPARE FOOD"];
    equipmentPrice = [0, 10, 15, 3, 5, 2, 25, 2, 15, 30, 50, 1, 1, 2, 25, 5];
    attributeNames = ["", "STR", "DEX", "CON", "CHAR", "WIS", "INT", "GOLD"];
    clericSpellPrices = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
    wizardSpellPrices = [0, 75, 500, 200, 750, 600, 100, 200, 300, 200, 600];

    for (m = 0; m <= 7; m++) {
        attributes[m] = 0;
    }

    buildStateModel();
}

function loadMonster(index, name, stats) {
    monsterNames[index] = name;
    monsterStats[index] = stats;
    monsterStats[index][4] = monsterStats[index][3];
    monsterStats[index][5] = monsterStats[index][6];
    monsterStats[index][1] = 1;
}

function loadMonsters() {
    var index = 0;
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
    inputFilter = 1;
    inputString = "";
    inputsCount = 0;
    reading = true;
    // wait for enter to be pressed (reading is cleared)
    // use gotInput to capture event
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined")) {
        terminal.printAt(inputRow, inputColumn, "_");
    }
    console.info("waiting for input");
}

function inputStr() {
    inputFilter = 0;
    inputString = "";
    inputsCount = 0;
    reading = true;
    // wait for enter to be pressed (reading is cleared)
    // use gotInput to capture event
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined")) {
        terminal.printAt(inputRow, inputColumn, "_");
    }
    console.info("waiting for input");
}

function inputX(items) {
    inputsCount = items;
    inputFilter = 1;
    inputString = "";
    reading = true;
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined")) {
        terminal.printAt(inputRow, inputColumn, "_");
    }
    console.info("waiting for input");
}

function gotInput() {
    reading = false;
    var value = inputString.toUpperCase();
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
    terminal.println("        DUNGEONS AND DRAGONS #1");
    terminal.println("     (attributes) 1977-2014 RICHARD GARRIOTT");
    terminal.println("        PORTED BY JULIAN BROWN");
    terminal.println("ALL RIGHTS TO THIS PORT REMAIN PROPERTY");
    terminal.println("          OF RICHARD GARRIOTT");
    terminal.println("    ******UPDATED 5 MAY 2014******");
    terminal.println("");
    terminal.println("    WARNING! THIS SITE USES COOKIES");
    terminal.println("   IF YOU DON'T WANT TO STORE COOKIES");
    terminal.println("           PLEASE STOP NOW");
    terminal.println("");
    terminal.print("DO YOU NEED INSTRUCTIONS ");
    gameStateMachine.stateMode = 2;
    gameStateMachine.waitTransition = true;
    inputStr();
}

function gotInstructionInput() { //2
    var strQ = inputString.trim();
    if (strQ == "YES" || strQ == "Y") {
        gameStateMachine.stateMode = 4;
    }
    else {
        terminal.print("OLD OR NEW GAME");
        gameStateMachine.stateMode = 3;
        gameStateMachine.waitTransition = true;
        inputStr();
    }
}

function gotLoadInput() { //3
    var strQ = inputString.trim();
    if (strQ == "OLD") {
        gameStateMachine.stateMode = 7;
    } else {
        terminal.print("DUNGEON #");
        gameStateMachine.stateMode = 6;
        gameStateMachine.waitTransition = true;
        input();
    }
}

function showInstructions() { //4
    terminal.println("WHO SAID YOU COULD PLAY");
    terminal.println("[STOP]");
    gameStateMachine.stateMode = 30;
}

function gotDungeonInput() { //6
    var Q = parseInt(inputString.trim());
    Dn = Math.floor(Q);
    terminal.print("CONTINUES RESET 1=YES,2=NO ");
    gameStateMachine.stateMode = 8;
    gameStateMachine.waitTransition = true;
    input();
}

function fetchDungeonSave() { //7
    var stream;
    var elements;
    var m, n;
    console.info("loading saved dungeon");
    //use cookies
    Dn = getCookie("dnd1file7.dungeonMap");
    if (Dn != "") {
        Dn = parseInt(Dn);
        stream = getCookie("dnd1file7.inventoryCounter");
        elements = stream.split("|");
        inventoryCounter = parseInt(elements[0]);
        currentWeapon = parseInt(elements[1]);
        mapY = parseInt(elements[2]);
        mapX = parseInt(elements[3]);
        currentMonster = parseInt(elements[4]);
        for (m = 0; m <= 25; m++) {
            stream = getCookie("dnd1file7.dungeonMap." + m);
            elements = stream.split("|");
            for (n = 0; n <= 25; n++) {
                dungeonMap[m][n] = parseInt(elements[n]);
            }
        }
        stream = getCookie("dnd1file7.inventory");
        elements = stream.split("|");
        for (m = 0; m <= inventoryCounter; m++) {
            inventory[m] = parseInt(elements[m]);
        }
        stream = getCookie("dnd1file7.monsterStats$");
        elements = stream.split("|");
        for (m = 1; m <= 10; m++) {
            monsterNames[m] = elements[m - 1]
        }
        for (m = 1; m <= 10; m++) {
            stream = getCookie("dnd1file7.monsterStats." + m);
            elements = stream.split("|");
            for (n = 1; n <= 6; n++) {
                monsterStats[m][n] = parseInt(elements[n - 1]);
            }
        }
        stream = getCookie("dnd1file7.attributes");
        elements = stream.split("|");
        for (m = 0; m <= 7; m++) {
            attributeNames[m] = elements[m * 2];
            attributes[m] = parseInt(elements[m * 2 + 1]);
        }
        strN = getCookie("dnd1file7.N$");
        F1 = parseInt(getCookie("dnd1file7.F1"));
        stream = getCookie("dnd1file7.I$");
        elements = stream.split("|");
        for (m = 1; m <= 15; m++) {
            equipmentNames[m] = elements[m - 1];
        }
        wizardSpellCounter = parseInt(getCookie("dnd1file7.wizardSpellCounter"));
        stream = getCookie("dnd1file7.wizardSpellbook");
        elements = stream.split("|");
        for (m = 1; m <= wizardSpellCounter; m++) {
            wizardSpellbook[m] = parseInt(elements[m - 1]);
        }
        clericSpellCounter = parseInt(getCookie("dnd1file7.clericSpellCounter"));
        stream = getCookie("dnd1file7.clericSpellbook");
        elements = stream.split("|");
        for (m = 1; m <= clericSpellCounter; m++) {
            clericSpellbook[m] = parseInt(elements[m - 1]);
        }
        F2 = parseInt(getCookie("dnd1file7.F2"));
        gameStateMachine.stateMode = 23;
    } else {
        terminal.println("ERROR FILE #7 DOES NOT EXIST");
        terminal.println("[STOP]");
        gameStateMachine.stateMode = 30;
    }
}

//load default dungeon where not locally saved
function loadDungeon(d) {
    var m, n;
    terminal.println("READING DUNGEON NUM. " + d);
    dungeonMap[0][0] = getCookie("dnd1file" + d + ".dungeonMap.0");
    if (dungeonMap[0][0] === "") {
        dungeonMap[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        dungeonMap[1] = [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 3, 0, 1, 6, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        dungeonMap[2] = [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1, 0, 1, 1, 0, 1];
        dungeonMap[3] = [1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0, 1, 0, 0, 1, 0, 1];
        dungeonMap[4] = [1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 4, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1];
        dungeonMap[5] = [1, 0, 0, 6, 1, 0, 0, 6, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 6, 1, 0, 0, 1, 0, 1];
        dungeonMap[6] = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1];
        dungeonMap[7] = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 6, 0, 1, 1, 1, 0, 1];
        dungeonMap[8] = [1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1];
        dungeonMap[9] = [1, 0, 6, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1];
        dungeonMap[10] = [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 1, 0, 1];
        dungeonMap[11] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1];
        dungeonMap[12] = [1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 6, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1];
        dungeonMap[13] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1];
        dungeonMap[14] = [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1];
        dungeonMap[15] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
        dungeonMap[16] = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1];
        dungeonMap[17] = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1];
        dungeonMap[18] = [1, 0, 1, 0, 0, 0, 1, 0, 1, 3, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1];
        dungeonMap[19] = [1, 0, 1, 0, 1, 1, 1, 0, 3, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1];
        dungeonMap[20] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1];
        dungeonMap[21] = [1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1];
        dungeonMap[22] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 4, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1];
        dungeonMap[23] = [1, 1, 1, 0, 0, 0, 2, 4, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1];
        dungeonMap[24] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1];
        dungeonMap[25] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    } else {
        var stream, elements;
        for (m = 0; m <= 25; m++) {
            stream = getCookie("dnd1file" + d + ".dungeonMap." + m);
            elements = stream.split("|");
            for (n = 0; n <= 25; n++) dungeonMap[m][n] = parseInt(elements[n]);
        }
    }
    for (m = 0; m <= 25; m++) {
        for (n = 0; n <= 25; n++) {
            if (d != 0) {
                console.info("M=" + m + " N=" + n);
                if (dungeonMap[m][n] === 0) {
                    if (rnd(0) >= 0.97) {
                        dungeonMap[m][n] = 7;
                    } else if (rnd(0) >= 0.97) {
                        dungeonMap[m][n] = 8;
                    }
                }
            }
        }
    }
    loadMonsters();
}

function gotResetInput() { //8
    J6 = Math.floor(inputString);
    terminal.print("PLATERS NME ");
    gameStateMachine.stateMode = 9;
    gameStateMachine.waitTransition = true;
    inputStr();
}

function gotNameInput() {
    strN = inputString.trim();
    if (strN == "SHAVS") {
        gameStateMachine.stateMode = 10;
    } else {
        gameStateMachine.stateMode = 4;
    }
}

function rollNew() {
    for (var M = 1; M <= 7; M++) {
        for (var N = 1; N <= 3; N++) {
            var R = int(rnd(0) * 6 + 1);
            attributes[M] = attributes[M] + R;
        }
        if (M == 7) {
            attributes[M] = attributes[M] * 15;
        }
        terminal.println(attributeNames[M] + "=" + attributes[M]);
    }
    gameStateMachine.stateMode = 10.5;
}

function pickClass() {
    terminal.println("");
    terminal.println("CLASSIFICATION");
    terminal.println("WHICH DO YOU WANT TO BE");
    terminal.print("FIGHTER ,CLERIC ,OR WIZARD");
    gameStateMachine.stateMode = 11;
    gameStateMachine.waitTransition = true;
    inputStr();
}

function gotClassInput() {
    attributeNames[0] = inputString.trim();
    if (attributeNames[0] == "NONE") {
        for (var M = 0; M <= 7; M++) {
            attributes[M] = 0;
        }
        gameStateMachine.stateMode = 10;
    } else {
        switch (attributeNames[0]) {
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
    attributes[0] = int(rnd(0) * 8 + 1);
    gameStateMachine.stateMode = 15;
}

function gotCleric() {
    attributes[0] = int(rnd(0) * 6 + 1);
    gameStateMachine.stateMode = 15;
}

function gotWizard() {
    attributes[0] = int(rnd(0) * 4 + 1);
    gameStateMachine.stateMode = 15;
}

function shopTop() {
    terminal.println("BUYING WEAPONS");
    terminal.println("FAST OR NORM");
    gameStateMachine.waitTransition = true;
    inputStr();
    gameStateMachine.stateMode = 16;
}

function gotShopFastNorm() {
    strQ = inputString.trim();
    if (strQ == "FAST") {
        gameStateMachine.stateMode = 18;
    } else {
        gameStateMachine.stateMode = 17;
    }
    terminal.println("NUMBER" + vbTab + "ITEM" + vbTab + "PRICE");
    terminal.println("-1-STOP");
}

function shopList() { //17
    for (var M = 1; M <= 15; M++) {
        terminal.println(M + vbTab + equipmentNames[M] + vbTab + equipmentPrice[M]);
    }
    gameStateMachine.stateMode = 18;
}

function shopping() { //18
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 19;
    input();
}

function buyItem(Y) {
    inventoryCounter++;
    attributes[7] = attributes[7] - equipmentPrice[Y];
    terminal.println("GP= " + attributes[7]);
    inventory[inventoryCounter] = Y;
}

function gotShoppingInput() {
    Y = Math.floor(inputString);
    if (Y < 0 || Y > 15) {
        gameStateMachine.stateMode = 20; //stop shopping
    } else {
        if (attributes[7] < equipmentPrice[Y]) {
            terminal.println("COSTS TOO MUCH");
            terminal.println("TRY AGAINN ");
        } else {
            if (attributeNames[0] == "CLERIC") {
                if (Y == 4 || Y == 8 || Y == 9 || Y > 10) {
                    buyItem(Y);
                }
                else {
                    terminal.println("YOUR A CLERIC YOU CANT USE THAT ");
                }
            } else if (attributeNames[0] == "WIZARD") {
                if (Y == 3 || Y == 8 || Y > 10) {
                    buyItem(Y);
                }
                else {
                    terminal.println("YOUR A WIZARD YOU CANT USE THAT ");
                }
            } else {
                buyItem(Y);
            }
        }
        gameStateMachine.stateMode = 18;
    }
}

function showInvQuestion() {
    terminal.print("EQ LIST ");
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 20.5;
    inputStr();
}

function gotInvQuestion() {
    strQ = inputString.trim();
    if (strQ == "NO") {
        gameStateMachine.stateMode = 22;
    } else {
        gameStateMachine.stateMode = 21;
    }
}

function showInventory() {
    for (var M = 1; M <= inventoryCounter; M++) {
        if (inventory[M] != 0) {
            terminal.println(inventory[M] + vbTab + equipmentNames[inventory[M]]);
        }
    }
    gameStateMachine.stateMode = 22;
}

function showStats() {
    terminal.println("YOUR CHARACTERISTICS ARE:");
    terminal.println(attributeNames[0]);
    if (attributes[0] == 1) {
        attributes[0] = 2;
    }
    terminal.println("HIT POINTS" + vbTab + attributes[0]);
    terminal.println("");
    terminal.println("");
    gameStateMachine.stateMode = 23;
}

function welcome() {
    loadDungeon(Dn);
    terminal.println("");
    terminal.println("");
    terminal.println("");
    terminal.println("WELCOME TO DUNGEON #" + Dn);
    terminal.println("YOU ARE AT (" + mapY + "," + mapX + ")");
    terminal.println("");
    terminal.print("COMANDS LIST" + vbTab);
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 23.5;
    inputStr();
}

function gotCommandsQuestion() {
    strQ = inputString.trim();
    if (strQ == "YES") {
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
    terminal.println("0=PASS  11=BUY mapX.equipmentPrice.");
    gameStateMachine.stateMode = 25;
}

function getCommand() { //25
    terminal.print("COMMAND=");
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 26;
    input();
}

function gotCommand() {
    T = parseInt(inputString.trim());
    switch (T) {
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
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 31;
}

function gotBASIC() { //31
    strQ = inputString.trim();
    if (strQ == "RUN") {
        gameStateMachine.stateMode = 1;
    } else if (strQ == "CLS") {
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
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 46;
}

function gotMove() {
    strQ = inputString.trim();
    S = 0;
    T = 0;
    if (strQ == "RIGHT" || strQ == "R") {
        T = 1;
    }
    if (strQ == "LEFT" || strQ == "L") {
        T = -1;
    }
    if (strQ == "UP" || strQ == "U") {
        S = -1;
    }
    if (strQ == "DOWN" || strQ == "dungeonMap") {
        S = 1;
    }
    if (S == 0 && T == 0) {
        gameStateMachine.stateMode = 45;
    } else {
        var look = dungeonMap[mapY + S][mapX + T];
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
    if ((rnd(0) * 12 + 1) > 9) {
        terminal.println("AND LOOSE 1 HIT POINT");
        attributes[0] -= 1;
    } else {
        terminal.println("BUT NO DAMAGE WAS INFLICTED");
    }
    gameStateMachine.stateMode = 200;
}

function itsatrap() {
    var m;
    terminal.println("OOOOPS A TRAP AND YOU FELL IN");
    if ((rnd(0) * 2) < 2) {
        terminal.println("AND HIT POINTS LOOSE 1");
        attributes[0] -= 1;
    }
    terminal.println("I HOPE YOU HAVE SOME SPIKES AND PREFERABLY ROPE");
    terminal.println("LET ME SEE");
    var found1 = false;
    var found2 = false;
    for (m = 1; m <= inventoryCounter; m++) {
        if (inventory[m] == 12) {
            inventory[m] = 0;
            m = inventoryCounter + 1;
            found1 = true;
        }
    }
    if (found1) {
        for (m = 1; m <= inventoryCounter; m++) {
            if (inventory[m] == 11) {
                inventory[m] = 0;
                m = inventoryCounter + 1;
                found2 = true;
            }
        }
        if (found2) {
            terminal.println("GOOD BOTH");
            terminal.println("YOU MANAGE TO GET OUT EASY");
            terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'dungeonMap MOVE");
            gameStateMachine.stateMode = 45;
        } else {
            terminal.println("NO ROPE BUT AT LEAST SPIKES");
            var loop = true;
            while (loop) {
                if (int(rnd(0) * 3) + 1 != 2) {
                    terminal.println("YOU MANAGE TO GET OUT EASY");
                    terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'dungeonMap MOVE");
                    gameStateMachine.stateMode = 45;
                    loop = false;
                } else {
                    terminal.println("YOU FALL HALFWAY UP");
                    if (int(rnd(0) * 6) > attributes[1] / 3) {
                        terminal.println("OOPS mapX.equipmentPrice. LOOSE 1");
                        attributes[0] -= 1;
                    }
                    terminal.println("TRY AGAIN ");
                }
            }
        }
    } else {
        terminal.println("NO SPIKES AH THATS TOO BAD CAUSE YOUR DEAD");
        terminal.println("[STOP]");
        gameStateMachine.stateMode = 30;
    }
}

function hush() {
    if (int(rnd(0) * 6) < 1) { //check original code - only partial logic present
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
    attributes[1] += 1;
    dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        attributes[0] -= int(rnd(0) * 4 + 1);
        terminal.println("HP= " + attributes[0]);
    }
    gameStateMachine.stateMode = 47;
}

function boost2() {
    attributes[3] += 1;
    dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        attributes[0] -= int(rnd(0) * 4 + 1);
        terminal.println("HP= " + attributes[0]);
    }
    gameStateMachine.stateMode = 47;
}

function surprise() {
    terminal.println("YOU RAN INTO THE MONSTER");
    terminal.println("HE SHOVES YOU BACK");
    terminal.println("");
    if (int(rnd(0) * 2) + 1 != 2) {
        terminal.println("YOU LOOSE 6 HIT POINT ");
        attributes[0] -= 6
    }
    gameStateMachine.stateMode = 200;
}

function gold() {
    terminal.println("AH......GOLD......");
    var G9 = int(rnd(0) * 500 + 10);
    terminal.println(G9 + "PIECES");
    attributes[7] = attributes[7] + G9;
    terminal.println("GP= " + attributes[7]);
    dungeonMap[mapY + S][mapX + T] = 0;
    if (rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        attributes[0] -= int(rnd(0) * 4 + 1);
        terminal.println("HP= " + attributes[0]);
    }
    gameStateMachine.stateMode = 47;
}

function openDoor() {
    terminal.println("DOOR LEFT RIGHT UP OR DOWN");
    gameStateMachine.waitTransition = true;
    inputStr();
    gameStateMachine.stateMode = 56;
}

function gotDoorMove() {
    strQ = inputString.trim();
    S = 0;
    T = 0;
    if (strQ == "RIGHT" || strQ == "R") {
        T = 1;
    }
    if (strQ == "LEFT" || strQ == "L") {
        T = -1;
    }
    if (strQ == "UP" || strQ == "U") {
        S = -1;
    }
    if (strQ == "DOWN" || strQ == "dungeonMap") {
        S = 1;
    }
    if (S == 0 && T == 0) {
        gameStateMachine.stateMode = 55;
    } else {
        var look = dungeonMap[mapY + S][mapX + T];
        if (look == 3 || look == 4) {
            terminal.println("PUSH");
            if (int(rnd(0) * 20) + 1 >= attributes[1]) {
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
    if (int(rnd(0) * 40) < attributes[5] + attributes[6]) {
        for (M = -1; M <= 1; M++) {
            for (N = -1; N <= 1; N++) {
                if (dungeonMap[mapY + M][mapX + N] == 2) {
                    terminal.println("YES THERE IS A TRAP");
                    terminal.println("IT IS " + M + "VERTICALY  " + N + "HORAZONTALY FROM YOU");
                    Z = 1;
                }
                if (dungeonMap[mapY + M][mapX + N] == 3) {
                    terminal.println("YES ITS A DOOR");
                    terminal.println("IT IS " + M + "VERTICALLY  " + N + "HORAZONTALY");
                    Z = 1;
                }
            }
        }
    }
    terminal.println("NO NOT THAT YOU CAN TELL");
    gameStateMachine.stateMode = 200;
}

function swapWeapon() { //58
    terminal.println("WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON ");
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 59;
    input();
}

function gotSwap() { //59
    Y = parseInt(inputString.trim());
    if (Y != 0) {
        var found = false;
        for (M = 1; M <= inventoryCounter; M++) {
            if (inventory[M] == Y) {
                found = true;
                M = inventoryCounter + 1;
            }
        }
        if (found) {
            terminal.println("O.currentMonster. YOU ARE NOW HOLDING A " + equipmentNames[Y]);
            currentWeapon = Y;
            gameStateMachine.stateMode = 200;
        } else {
            terminal.println("SORRY YOU DONT HAVE THAT ONE");
            gameStateMachine.stateMode = 58;
        }
    } else {
        gameStateMachine.stateMode = 200;
    }
}

function fight1() { //60
    terminal.println("YOUR WEAPON IS " + equipmentNames[currentWeapon]);
    if (currentMonster = 0) {
        gameStateMachine.stateMode = 25;
    } else {
        terminal.println(monsterNames[currentMonster]);
        terminal.println("HP=" + monsterStats[currentMonster][3]);
        if (currentWeapon == 0) {
            gameStateMachine.stateMode = 61;
        }
        if (currentWeapon == 1) {
            gameStateMachine.stateMode = 62;
        }
        if (currentWeapon == 2) {
            gameStateMachine.stateMode = 63;
        }
        if (currentWeapon == 3) {
            gameStateMachine.stateMode = 64;
        }
        if (currentWeapon == 4) {
            gameStateMachine.stateMode = 65;
        }
        if (currentWeapon > 4 && currentWeapon < 15) { //no weapon
            gameStateMachine.stateMode = 66;
        }
        if (currentWeapon == 15) {
            terminal.println("FOOD ???.... WELL O.currentMonster.");
            terminal.print("IS IT TO HIT OR DISTRACT");
            gameStateMachine.waitTransition = true;
            gameStateMachine.stateMode = 67;
            inputStr();
        }
    }
}

function knuckles() { //61
    terminal.println("DO YOU REALIZE YOU ARE BARE HANDED");
    terminal.print("DO YOU WANT TO MAKE ANOTHER CHOICE");
    gameStateMachine.waitTransition = true;
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
        switch (R2) {
            case 0:
                terminal.println("MISSED TOTALY");
                gameStateMachine.stateMode = 200;
                break;
            case 1:
                terminal.println("NOT GOOD ENOUGH");
                gameStateMachine.stateMode = 25;
                break;
            case 2:
                terminal.println("GOOD HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] * 4 / 5);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] / 2);
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function swingABigSword() { //63
    terminal.println("SWHNG");
    findRange();
    if (range > 2) {
        terminal.println("HE IS OUT OF RANGE");
        gameStateMachine.stateMode = 200;
    } else {
        switch (R2) {
            case 0:
                terminal.println("MISSED TOTALY");
                gameStateMachine.stateMode = 200;
                break;
            case 1:
                terminal.println("HIT BUT ' WELL ENOUGH");
                gameStateMachine.stateMode = 25;
                break;
            case 2:
                terminal.println("HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] * 5 / 7);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                monsterStats[currentMonster][3] -= attributes[1];
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function pokeADagger() { //64
    var found = false;
    for (M = 1; M <= inventoryCounter; M++) {
        if (inventory[M] === 3) {
            found = true;
            M = inventoryCounter + 1;
        }
    }
    if (!found) {
        terminal.println("YOU DONT HAVE A DAGGER");
    } else {
        findRange();
        if (range > 5) { //Then Goto 04710 'OUT OF RANGE
            terminal.println("HE IS OUT OF RANGE");
        } else {
            switch (R2) {
                case 0:
                    terminal.println("MISSED TOTALLY");
                    break;
                case 1:
                    terminal.println("HIT BUT NO DAMAGE");
                    break;
                case 2:
                    terminal.println("HIT");
                    monsterStats[currentMonster][3] -= int(attributes[1] / 4);
                    break;
                default:
                    terminal.println("CRITICAL HIT");
                    monsterStats[currentMonster][3] -= int(attributes[1] * 3 / 10);
                    break;
            }
            if (range >= 2) {
                inventory[currentWeapon] = 0;
                currentWeapon = 0;
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
        switch (R2) {
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
                monsterStats[currentMonster][3] -= int(attributes[1] * 5 / 11);
                gameStateMachine.stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] * 4 / 9);
                gameStateMachine.stateMode = 25;
                break;
        }
    }
}

function improvise() { //66
    var found = false;
    for (M = 1; M <= inventoryCounter; M++) {
        if (inventory[M] == currentWeapon) {
            found = true;
            M = inventoryCounter + 1;
        }
    }
    if (!found) {
        terminal.println("NO WEAPON FOUND");
        gameStateMachine.stateMode = 25;
    } else {
        findRange();
        switch (currentWeapon) {
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
                var z = 0;
                for (Z = 1; Z <= 100; Z++) {
                    if (inventory[Z] == 7) {
                        found = true;
                        z = Z;
                        Z = 101;
                    }
                }
                if (!found) {
                    terminal.println("MISS");
                    gameStateMachine.stateMode = 71;
                } else {
                    currentWeapon = 7; //Arrow
                    inventory[Z] = 0;
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
                gameStateMachine.waitTransition = true;
                gameStateMachine.stateMode = 70;
                inputStr();
                break;
        }
    }
}

function throwFood() { //67
    strQ = inputString.trim();
    if (strQ == "HIT") {
        gameStateMachine.stateMode = 72;
    } else {
        terminal.print("THROW A-A=VE,monsterStats-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER");
        Z5 = 0;
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 73;
        inputStr();
    }
}

function knucklehead() { //68
    strQ = inputString.trim();
    if (strQ != "NO") {
        gameStateMachine.stateMode = 25;
    } else {
        terminal.println("O.currentMonster. PUNCH BITE SCRATCH HIT ........");
        var m = 0;
        var n = 0;
        for (M = -1; M < 1; M++) {
            for (N = -1; N < 1; N++) {
                if (dungeonMap[mapY + M][mapX + N] === 5) {
                    m = M;
                    M = 2;
                    n = N;
                    N = 2;
                }
            }
        }
        if (m == 0 && n == 0) {
            terminal.println("NO GOOD ONE");
            gameStateMachine.stateMode = 25;
        } else {
            if (int(rnd(0) * 20) + 1 > monsterStats[currentMonster][2]) {
                terminal.println("GOOD A HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] / 6);
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
        switch (R2) {
            case 0:
                terminal.println("MISS");
                gameStateMachine.stateMode = 71;
                break;
            case 1:
                terminal.println("HIT BUT NO DAMAGE");
                gameStateMachine.stateMode = 71;
                break;
            case 2:
                terminal.println("HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] * R4);
                gameStateMachine.stateMode = 71;
                break;
            default:
                terminal.println("CRITICAL HIT");
                monsterStats[currentMonster][3] -= int(attributes[1] * R5);
                break;
        }
    }
}

function gotSilverCross() { //70
    strQ = inputString.trim();
    if (strQ === "SIGHT") {
        if (range < 10) {
            terminal.println("THE MONSTER IS HURT");
            R5 = 1 / 6;
            if (currentMonster == 2 || currentMonster == 10 || currentMonster == 4) {
                R2 = 3;
            } else {
                R2 = 1;
            }
            range = R3 - 1;
            gameStateMachine.stateMode = 69;
        } else {
            terminal.println("FAILED");
            gameStateMachine.stateMode = 200;
        }
    } else {
        if (currentWeapon === 14) {
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

function consumeWpn() { //71
    if (inventory[currentWeapon] == 14) {
        gameStateMachine.stateMode = 200;
    } else {
        for (M = 1; M <= inventoryCounter; M++) {
            if (inventory[M] == currentWeapon) {
                inventory[M] = 0;
                M = 101;
            }
        }
        if (currentWeapon != 7) {
            currentWeapon = 0;
        }
        if (R2 > 0) {
            gameStateMachine.stateMode = 25;
        } else {
            gameStateMachine.stateMode = 200;
        }
    }
}

function peltMonster() { //72
    if (int(rnd(0) * 20) + 1 == 20) {
        terminal.println("DIRECT HIT");
        monsterStats[currentMonster][3] -= int(attributes[1] / 6);
    } else if (int(rnd(0) * 20) + 1 > monsterStats[currentMonster][2] - attributes[2] / 3) {
        terminal.println("HIT");
        monsterStats[currentMonster][3] -= int(attributes[1] / 8);
    } else if (int(rnd(0) * 20) + 1 > 10 - attributes[2] / 3) {
        terminal.println("YOU HIT HIM BUT NOT GOOD ENOUGH");
    } else {
        terminal.println("TOTAL MISS");
    }
    gameStateMachine.stateMode = 74;
}

function kiteMonster() { //73
    strQ = inputString.trim();
    if (strQ == "monsterStats") {
        S = -1;
        T = 0;
    } else if (strQ == "A") {
        S = 1;
        T = 0;
    } else if (strQ == "L") {
        S = 0;
        T = -1;
    } else if (strQ == "R") {
        S = 0;
        T = 1;
    }
    var look = dungeonMap[F1 + S][F2 + T];
    if (look === 0) {
        terminal.println("MONSTER MOVED BACK");
        dungeonMap[F1][F2] = 0;
        F1 += S;
        F2 += T;
        dungeonMap[F1][F2] = 5;
    } else if (look == 2) { //Then Goto 04280
        terminal.println("GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD");
        K1 = -1;
        monsterStats[currentMonster][6] = 0;
        dungeonMap[F1][F2] = 0; //bug - monster stayed on map
        //stateMode = 200; //bug - kept the food
    } else {
        terminal.println("DIDN'T WORK");
    }
    gameStateMachine.stateMode = 74;
}

function consumeFood() { //74
    for (M = 1; M <= inventoryCounter; M++) {
        if (Z5 > 0) { //Then Goto 07000 // was Z5 = Q to handle pass through from spells
            gameStateMachine.stateMode = 200;
        } else if (inventory[M] == 15) {
            inventory[M] = 0; //lose the food
            currentWeapon = 0;
            M = inventoryCounter + 1;
        }
    }
    gameStateMachine.stateMode = 200;
}

function looking() { //75
    var line;
    for (M = -5; M < 6; M++) {
        line = "";
        for (N = -5; N < 6; N++) {
            if (!((M + mapY > 25) || (M + mapY < 0) || (mapX + N > 25) || (mapX + N < 0))) {
                if ((M == 0) && (N == 0)) {
                    line += "9";
                } else {
                    if (dungeonMap[M + mapY][N + mapX] == 3) {
                        line += "1";
                    } else if (dungeonMap[M + mapY][N + mapX] == 2 || dungeonMap[M + mapY][N + mapX] == 7 || dungeonMap[M + mapY][N + mapX] == 8) {
                        line += "0";
                    } else {
                        line += dungeonMap[M + mapY][N + mapX];
                    }
                }
            }
        }
        terminal.println(line);
    }
    gameStateMachine.stateMode = 200;
}

function saveGame() { //76
    var stream;
    var m, n;
    //use cookies and save for a year
    setCookie("dnd1file7.dungeonMap", Dn, CL);
    stream = inventoryCounter + "|" + currentWeapon + "|" + mapY + "|" + mapX + "|" + currentMonster;
    setCookie("dnd1file7.inventoryCounter", stream, CL);
    for (m = 0; m <= 25; m++) {
        stream = "";
        for (n = 0; n <= 25; n++) {
            stream += dungeonMap[m][n] + "|";
        }
        setCookie("dnd1file7.dungeonMap." + m, stream, CL);
    }
    stream = "";
    for (m = 1; m <= inventoryCounter; m++) {
        stream += inventory[m] + "|";
    }
    setCookie("dnd1file7.inventory", stream, CL);
    stream = "";
    for (m = 1; m <= 10; m++) {
        stream += monsterNames[m] + "|";
    }
    setCookie("dnd1file7.monsterStats$", stream, CL);
    for (m = 1; m <= 10; m++) {
        stream = "";
        for (n = 1; n <= 6; n++) {
            stream += monsterStats[m][n] + "|";
        }
        setCookie("dnd1file7.monsterStats." + m, stream, CL);
    }
    stream = "";
    for (m = 0; m <= 7; m++) {
        stream += attributeNames[m] + "|" + attributes[m] + "|";
    }
    setCookie("dnd1file7.attributes", stream, CL);
    setCookie("dnd1file7.N$", strN, CL);
    setCookie("dnd1file7.F1", F1, CL);
    stream = "";
    for (m = 1; m <= 15; m++) {
        stream += equipmentNames[m] + "|";
    }
    setCookie("dnd1file7.I$", stream, CL);
    setCookie("dnd1file7.wizardSpellCounter", wizardSpellCounter, CL);
    stream = "";
    for (m = 1; m <= wizardSpellCounter; m++) {
        stream += wizardSpellbook[m] + "|";
    }
    setCookie("dnd1file7.wizardSpellbook", stream, CL);
    setCookie("dnd1file7.clericSpellCounter", clericSpellCounter, CL);
    stream = "";
    for (m = 1; m <= clericSpellCounter; m++) {
        stream += clericSpellbook[m] + "|";
    }
    setCookie("dnd1file7.clericSpellbook", stream, CL);
    setCookie("dnd1file7.F2", F2, CL);
    gameStateMachine.stateMode = 25;
}

function casting() { //77
    terminal.println("MAGIC");
    if (currentWeapon != 0) { //Then Goto 08740
        terminal.println("YOU CANT USE MAGIC WITH WEAPON IN HAND");
        gameStateMachine.stateMode = 200;
    } else if (attributeNames[0] == "CLERIC") {
        terminal.print("CLERICAL SPELL #");
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 78;
        input();
    } else if (attributeNames[0] == "WIZARD") {
        terminal.print("SPELL #");
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 87;
        input();
    } else {
        terminal.println("YOU CANT TSE MAGIC YOUR NOT A M.U.");
        gameStateMachine.stateMode = 200;
    }
}

function gotClericSpell() { //78
    Q = parseInt(inputString.trim());
    var found = false;
    for (var m = 1; m <= clericSpellCounter; m++) {
        if (Q == clericSpellbook[m]) {
            M = m;
            found = true;
            m = clericSpellCounter + 1;
        }
    }
    if (!found) {
        terminal.println("YOU DONT HAVE THAT SPELL");
        gameStateMachine.stateMode = 200;
    } else {
        wizardSpellCounter = clericSpellbook[M];
        clericSpellbook[M] = 0;
        //route clerical spell choice
        if (wizardSpellCounter > 3) {
            Q = 2;
        } //bug fix - find all spell uses Q to match floor tile types, not Q2 or Q3
        if (wizardSpellCounter > 4) {
            Q = 3;
        }
        switch (wizardSpellCounter) {
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

function clericSpell1() { //79
    if (rnd(0) * 3 > 1) {
        terminal.println("FAILED");
    } else {
        terminal.println("DONE");
        K1 = -1;
    }
    clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpell2() { //80
    terminal.println("DONE");
    monsterStats[currentMonster][3] -= 4;
    clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpell3() { //81
    attributes[3] += 3;
    clericSpellbook[M] = 0;
    gameStateMachine.stateMode = 200;
}

function clericSpell4() { //82
    clericSpellbook[M] = 0;
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (!((mapY + M < 0) || (mapY + M > 25) || (mapX + N < 0) || (mapX + N > 25))) {
                if (dungeonMap[mapY + M][mapX + N] == Q) {
                    terminal.println("THERE IS ONE AT " + M + "LAT." + N + "LONG.");
                }
            }
        }
    }
    terminal.println("NO MORE");
    gameStateMachine.stateMode = 200;
}

function clericSpell5() { //83
    terminal.println("DONE");
    clericSpellbook[M] = 0;
    monsterStats[currentMonster][3] -= 2;
    gameStateMachine.stateMode = 200;
}

function clericSpell6() { //84
    terminal.println("DONE");
    clericSpellbook[M] = 0;
    monsterStats[currentMonster][3] -= 6;
    gameStateMachine.stateMode = 200;
}

function clericSpell7() { //85
    terminal.println("DONE");
    attributes[3] += 3;
    gameStateMachine.stateMode = 200;
}

function clericSpell9() { //86
    if (currentMonster == 4 || currentMonster == 10) {
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
    var found = false;
    for (var m = 1; m <= wizardSpellCounter; m++) {
        if (Q == wizardSpellbook[m]) {
            found = true;
            M = m;
            m = wizardSpellCounter + 1;
        }
    }
    if (found) {  //09380
        if (wizardSpellbook[M] == 1) {
            if ((F1 - mapY == 0) && (F2 - mapX == 0)) {
                S = 0;
                T = 0;
                Z5 = 1;
                inputString = "";
            } else {
                terminal.println("ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
                gameStateMachine.waitTransition = true;
                inputStr();
            }
            gameStateMachine.stateMode = 73;
        } else {
            R = 5;
            switch (wizardSpellbook[M]) {
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
                    gameStateMachine.stateMode = 92;
                    break;
                case 6:
                    Q = 3;
                    gameStateMachine.stateMode = 93;
                    break;
                case 7:
                    Q = 6;
                    gameStateMachine.stateMode = 93;
                    break;
                case 8:
                    Q = 9;
                    gameStateMachine.stateMode = 93;
                    break;
                case 9:
                    Q = 3;
                    gameStateMachine.stateMode = 89;
                    break;
                case 10:
                    Q = 1;
                    gameStateMachine.stateMode = 94;
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

function wizardSpell2() { //88
    if (rnd(0) * 3 > 1) {
        terminal.println("DONE");
        K1 = -1;
    } else {
        terminal.println("FAILED");
    }
    gameStateMachine.stateMode = 200;
}

function wizardSpell3() { //89
    wizardSpellbook[M] = 0;
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (!((mapY + M < 0) || (mapY + M > 25) || (mapX + N < 0) || (mapX + N > 25))) {
                if (dungeonMap[mapY + M][mapX + N] == Q) {
                    terminal.println("THERE IS ONE AT " + M + "LAT." + N + "LONG.");
                }
            }
        }
    }
    terminal.println("NO MORE");
    gameStateMachine.stateMode = 200;
}

function wizardSpell4() { //90
    terminal.print("INPUT CO-ORDINATES");
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 91;
    inputX(2);
}

function gotWizardSpell4() { //91
    M = inputStrings[0];
    N = inputStrings[1];
    terminal.println("DONE");
    mapY = M;
    mapX = N;
    gameStateMachine.stateMode = 200;
}

function buyMagic() { //92
    if (attributeNames[0] == "CLERIC") {
        gameStateMachine.stateMode = 93;
    } else if (attributeNames[0] == "WIZARD") {
        gameStateMachine.stateMode = 94;
    } else {
        terminal.println("YOU CANT BUY ANY");
        gameStateMachine.stateMode = 25;
    }
}

function askACleric() { //93
    terminal.println("DO YOU KNOW THE CHOICES");
    inputStr();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 95;
}

function askAWizard() { //94
    terminal.println("DO YOU KNOW THE SPELLS");
    inputStr();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 96;
}

function clericSpellChoices() { //95
    strQ = inputString.trim();
    if (strQ == "NO") {
        terminal.println("1-KILL-500  5-MAG. MISS. #1-100");
        terminal.println("2-MAG. MISS. #2-200  6-MAG.MISS. #3-300");
        terminal.println("3-CURE LHGHT #1-200  7-CURE LIGHT #2-1000");
        terminal.println("4-FIND ALL TRAPS-200  8-FIND ALL S.DOORS-200");
        terminal.print("INPUT # WANTED   NEG.NUM.TO STOP");
    }
    input();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 97;
}

function wizardSpellChoices() { //96
    strQ = inputString.trim();
    if (strQ == "NO") {
        terminal.println("1-PUSH-75   6-M. M. #1-100");
        terminal.println("2-KIHL-500  7-M. M. #2-200");
        terminal.println("3-FIND TRAPS-200  8-M. M. #3-300");
        terminal.println("4-TELEPORT-750  9-FIND S.DOORS-200");
        terminal.println("5-CHANGE 1+0-600  10-CHANGE 0+1-600");
        terminal.print("#OF ONE OU WANT  NEG.NUM.TO STOP");
    }
    input();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 98;
}

function clericSpellPurchase() { //97
    if (Q > 0) { //Then Goto 10290
        if (Q <= 8) { //Then Goto 10100
            if (attributes[7] - clericSpellPrices[int(Q)] < 0) {// Then Goto 10270
                terminal.println("COSTS TOO MUCH");
            } else {
                attributes[7] -= clericSpellPrices[int(Q)];
                terminal.println("IT IS YOURS");
                clericSpellCounter += 1;
                clericSpellbook[clericSpellCounter] = int(Q);
            }
        }
        input();
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 97;
    } else {
        terminal.println("YOUR SPELLS ARE");
        for (M = 1; M <= clericSpellCounter; M++) {
            if (clericSpellbook[M] != 0) {
                terminal.println("#" + clericSpellbook[M]);
            }
        }
        terminal.println("DONE");
        gameStateMachine.stateMode = 25;
    }
}

function wizardSpellPurchase() { //98
    if (Q > 0) {
        if (Q <= 10) {
            if (attributes[7] - wizardSpellPrices[int(Q)] < 0) {
                terminal.println("COSTS TOO MUCH");
            } else {
                attributes[7] -= wizardSpellPrices[int(Q)];
                terminal.println("IT IS YOURS");
                wizardSpellCounter += 1;
                wizardSpellbook[wizardSpellCounter] = int(Q);
            }
        }
        input();
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 98;
    } else {
        terminal.println("YOU NOW HAVE");
        for (M = 1; M <= wizardSpellCounter; M++) {
            if (wizardSpellbook[M] != 0) {
                terminal.println("#" + wizardSpellbook[M]);
            }
        }
        gameStateMachine.stateMode = 25;
    }
}

function showCheatMap() { //99
    // CHEATING
    var line;
    for (M = 0; M <= 25; M++) {
        line = "";
        for (N = 0; N <= 25; N++) {
            line += dungeonMap[M][N];
        }
        terminal.println(line);
    }
    gameStateMachine.stateMode = 25;
}

function buyHP() { //100
    terminal.print("HOW MANY 200 GP. EACH ");
    input();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 101;
}

function addHP() { //101
    Q = parseInt(inputString.trim());
    if (attributes[7] - 200 * Q < 0) {
        terminal.println("NO");
        gameStateMachine.stateMode = 100;
    } else {
        attributes[0] += int(Q);
        attributes[7] -= int(Q) * 200;
        terminal.println("OK DONE");
        terminal.println("HP= " + attributes[0]);
        for (M = 1; M <= 7; M++) {
            terminal.println(attributeNames[M] + "= " + attributes[M]);
        }
        gameStateMachine.stateMode = 200;
    }
}

function modifyMap() { //102
    terminal.print("DNG");
    input();
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 102.5;
}

function modifyGotMap() { //102.5
    D2 = parseInt(inputString.trim());
    gameStateMachine.stateMode = 103;
}

function modifyMapPos() { //103
    terminal.print("inventoryCounter,Y,attributes");
    inputX(3);
    gameStateMachine.waitTransition = true;
    gameStateMachine.stateMode = 104;
}

function modifyMapDone() { //104
    var targetX, targetY, content;
    targetX = parseInt(inputStrings[2]);
    targetY = parseInt(inputStrings[1]);
    content = parseInt(inputStrings[0]);
    if (content < 0) {
        terminal.println("SAVE");
        input();
        gameStateMachine.waitTransition = true;
        gameStateMachine.stateMode = 105;
    } else {
        dungeonMap[targetY][targetX] = content;
        gameStateMachine.stateMode = 103;
    }
}

function modifyMapSave() {
    var stream;
    Q = parseInt(inputString.trim());
    if (Q == 1) {
        var DName = "dnd1file" + Dn + ".dungeonMap.";
        for (M = 0; M <= 25; M++) {
            stream = "";
            for (N = 0; N <= 25; N++) {
                if (dungeonMap[M][N] != 7 && dungeonMap[M][N] != 8) {
                    stream += dungeonMap[M][N] + "|";
                } else {
                    stream += "0|";
                }
            }
            setCookie(DName + M, stream, CL);
        }
    }
    gameStateMachine.stateMode = 200;
}

function routeGameMove() { //200
    gameStateMachine.stateMode = 0;
    if (K1 == -1) {
        gameStateMachine.stateMode = 203;
    } else {
        if (attributes[0] < 2) { // low on health
            if (attributes[0] < 1) { // bleeding out
                while (attributes[0] < 0) {
                    if (attributes[3] < 9) {
                        attributes[0] = 0;
                        attributes[3] = 0; //exit loop, force dead
                    } else {
                        attributes[3] -= 2;
                        attributes[0] += 1;
                    }
                }
                if (attributes[0] == 0) {
                    if (attributes[3] < 9) {
                        terminal.println("SORRY YOUR DEAD");
                        gameStateMachine.stateMode = 30;
                    } else {
                        terminal.println("mapX.equipmentPrice.=0 BUT CONST. HOLDS");
                    }
                }
            } else {
                terminal.println("WATCH IT mapX.equipmentPrice.=" + attributes[0]);
            }
        }
    }
    if (gameStateMachine.stateMode == 0) {
        if (currentMonster > 0) { // 07160
            //monster action
            gameStateMachine.stateMode = 206;
        } else if (mapY != 1) {
            if (rnd(0) * 20 > 10) {
                // move monsters
                gameStateMachine.stateMode = 202;
            } else {
                gameStateMachine.stateMode = 25;
            }
        } else if (mapX != 12) {
            if (rnd(0) * 20 > 10) {
                // move monsters
                gameStateMachine.stateMode = 202;
            } else {
                gameStateMachine.stateMode = 25;
            }
        } else {
            terminal.println("SO YOU HAVE RETURNED");
            if (attributes[7] < 100) {
                if (rnd(0) * 20 > 10) {
                    // move monsters
                    gameStateMachine.stateMode = 202;
                } else {
                    gameStateMachine.stateMode = 25;
                }
            } else {
                attributes[7] -= 100;
                terminal.println("WANT TO BUY MORE EQUIPMENT");
                gameStateMachine.waitTransition = true;
                inputStr();
                gameStateMachine.stateMode = 201;
            }
        }
    }
}

function gotMoreEquipment() { //201
    strQ = inputString.trim();
    if (strQ == "YES") {
        terminal.println("YOUR mapX.equipmentPrice. ARE RESTORED 2 POINTS");
        attributes[0] += 2;
        gameStateMachine.stateMode = 18;
    } else {
        if (rnd(0) * 20 > 10) {
            gameStateMachine.stateMode = 202;
        } else {
            gameStateMachine.stateMode = 25;
        }
    }
}

function monsterMove() { //202
    var moved = false;
    var Z7 = 1;
    while (!moved && Z7 <= 50) {
        M = 1;
        while (!moved && M <= 10) {
            if (monsterStats[M][5] >= 1 && rnd(0) > 0.925) {
                moved = true;
                gameStateMachine.stateMode = 204;
            }
            M++;
        }
        Z7++;
    }
    if (!moved) {
        terminal.println("ALL MONSTERS DEAD");
        terminal.print("RESET");
        inputStr();
        gameStateMachine.stateMode = 205;
    }
}

function confirmedKill() { //203
    K1 = 0;
    attributes[7] += monsterStats[currentMonster][6];
    F1 = 0;
    F2 = 0;
    terminal.println("GOOD WORK YOU JUST KILLED A " + monsterNames[currentMonster]);
    terminal.println("AND GET " + monsterStats[currentMonster][6] + "GOLD PIECES");
    if (J6 != 1) {
        monsterStats[currentMonster][5] = 0;
    }
    terminal.println("YOU HAVE" + attributes[7] + " GOLD ");
    monsterStats[currentMonster][6] = 0;
    if (J6 === 1) {
        monsterStats[currentMonster][3] = monsterStats[currentMonster][4] * monsterStats[currentMonster][1];
        monsterStats[currentMonster][6] = monsterStats[currentMonster][5] * monsterStats[currentMonster][1];
    }
    currentMonster = 0;
    gameStateMachine.stateMode = 25;
}

function makeAMonsterMove() { //204
    var loopCounter = 0;
    currentMonster = M;
    var moved = false;
    while (!moved) { //dangerous - but statistically should never lock unless it is a very poor map
        loopCounter++; //stop it locking permanently
        var M1 = int(rnd(0) * 7 + 1);
        M = M1 * -1;
        while (!moved && M <= M1) {
            N = M1 * -1;
            while (!moved && N <= M1) {
                if (!(Math.abs(M) > 2 || Math.abs(N) > 2)) {
                    if (!(mapY + M < 1 || mapX + N < 1 || mapY + M > 25 || mapX + N > 25)) {
                        if (rnd(0) <= 0.7) {
                            if (dungeonMap[mapY + M][mapX + N] == 0) {
                                moved = true;
                                dungeonMap[mapY + M][mapX + N] = 5;
                                F1 = mapY + M;
                                F2 = mapX + N;
                            }
                        }
                    }
                }
                N++;
            }
            M++;
        }
        if (loopCounter > 1000) {
            moved = true;
        } //break out of loop
    }
    gameStateMachine.stateMode = 200;
}

function resetAfterClear() { //205
    strQ = inputString.trim();
    if (strQ == "YES") {
        // reset
        difficultyFactor += 1; //up difficultly level
        for (M = 1; M <= 10; M++) {
            monsterStats[M][3] = monsterStats[M][4] * difficultyFactor;
            monsterStats[M][6] = monsterStats[M][5] * difficultyFactor;
        }
        attributes[0] += 5;
        gameStateMachine.stateMode = 25;
    } else {
        gameStateMachine.stateMode = 30;
        terminal.println("[STOP]");
    }
}

function monsterAction() { //206
    var F5, F6;
    findRange();
    if (monsterStats[currentMonster][3] < 1) { //Then Goto 08290
        //its a kill
        gameStateMachine.stateMode = 203;
    } else {
        if (range < 2.0) { //Then Goto 07600
            //it attacks
            gameStateMachine.stateMode = 207;
        } else if (P0 > 10) { //Then Goto 01590
            gameStateMachine.stateMode = 25;
        } else {
            //he is coming
            if (Math.abs(R8) > Math.abs(R9)) { //Then Goto 07260
                F5 = -(R8 / Math.abs(R8));
                F6 = 0;
            } else {
                F5 = 0;
                if (M == 1) { // Then Goto 07270
                    F6 = 0;
                } else {
                    F6 = -(R9 / Math.abs(R9))
                }
            }
            Q = -1;
            for (var q = 0; q <= 8; q++) {
                if (q != 1 && q != 5) {
                    if (!(F1 + F5 < 0 || F1 + F5 > 25 || F2 + F6 < 0 || F2 + F6 > 25)) {
                        if (dungeonMap[F1 + F5][F2 + F6] == q) {
                            Q = q;
                            q = 9;
                        }
                    }
                }
            }
            if (Q != -1) {
                switch (Q) {
                    case 0:
                    case 6:
                    case 7:
                    case 8:
                        //closer
                        dungeonMap[F1][F2] = 0;
                        F1 += F5;
                        F2 += F6;
                        dungeonMap[F1][F2] = 5;
                        findRange();
                        gameStateMachine.stateMode = 25;
                        break;
                    case 2:
                        terminal.println("GOOD WORK  YOU LED HIM INTO A TRAP");
                        K1 = -1;
                        monsterStats[currentMonster][6] = 0;
                        gameStateMachine.stateMode = 200;
                        break;
                    case 3:
                    case 4:
                        //through the door
                        if (dungeonMap[F1 + 2 * F5][F2 + 2 * F6] == 0) { // Then Goto 07510
                            F5 = F5 * 2;
                            F6 = F6 * 2;
                            //closer
                            dungeonMap[F1][F2] = 0;
                            F1 += F5;
                            F2 += F6;
                            dungeonMap[F1][F2] = 5;
                            findRange();
                        }
                        gameStateMachine.stateMode = 25;
                        break;
                }
            } else {
                gameStateMachine.stateMode = 25;
            }
        }
    }
}

function monsterSwings() { //207
    terminal.println(monsterNames[currentMonster] + "WATCH IT");
    var A1, found = false;
    M = 1;
    A1 = 6 + attributes[2];
    while (M <= inventoryCounter && !found) {
        switch (inventory[M]) {
            case 10:
                found = true;
                A1 = 20 + attributes[2];
                break;
            case 9:
                found = true;
                A1 = 16 + attributes[2];
                break;
            case 8:
                found = true;
                A1 = 8 + attributes[2];
                break;
        }
        M++;
    }
    if (rnd(0) * 40 > A1) {
        terminal.println("MONSTER SCORES A HIT");
        attributes[0] -= int(rnd(0) * monsterStats[currentMonster][2] + 1);
        terminal.println("mapX.equipmentPrice.=" + attributes[0]);
        gameStateMachine.stateMode = 200;
    } else if (rnd(0) * 2 > 1) {
        terminal.println("HE HIT BUT NOT GOOD ENOUGH");
        gameStateMachine.stateMode = 200;
    } else {
        terminal.println("HE MISSED");
        gameStateMachine.stateMode = 25;
    }
}

//global routines

$(document).ready(function () {
    main(new Console('mainConsole', 30, 40));
    $(document).on("endInput", function(event) {
        if (debug) console.log(event);
        gotInput();
    });
    $(document).on("partialInput", function(event) {
        if (debug) console.log(event);
        partial();
    });
    $(document).keypress(function (event) {
        console.info(reading, event.which);
        var charCode = parseInt(event.which);
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
            if (event.keyCode == 8) {
                event.preventDefault();
                if (inputString.length > 0) {
                    inputString = inputString.substr(0, inputString.length - 1);
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
});