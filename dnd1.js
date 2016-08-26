/*
 Port of Richard Garriott's DND #1
 © 1977-2014 Richard Garriott
 Ported by Julian Brown
 all rights to this port remain property of Richard Garriott
 Modified 30 Apr 2014
 */

/*
 ToDo:
 1. Write Load/Save routine (cookies?) - DONE
 2. Create maps
 3. Test Case Scripts
 */

var J4 = 0; //difficulty
var X = 0; //inv counter
var J = 0; //current weapon
var K = 0; //current monster
var K1 = 0;
var X1 = 0; //cleric spell counter
var X3 = 0; //wizard spell counter
// var J9 = 0; //random seed
var C = []; // attributes
var strC = []; // attribute names
var W = []; // inventory
var D = []; // map (25,25)
var Dn = 1;
var P; // price of equipment
var strI; // equipment
var B = []; // (100,6) monster stats
var strB = []; // (100) monster names
// var E = []; // (100)
// var F = []; // (100)
var F1 = 0;
var F2 = 0;
var X5 = []; //(100) cleric spell prices
var X6 = []; // (100) wizard spell prices
var X2 = []; // (100) cleric spellbook
var X4 = []; // (100) As wizard spellbook
var G; // map y
var H; // map x
var R; // only appears to be used once - investigate
var S; // move delta
var T; // turn input / move delta
var M;
var N;
var P0;
var Y;
var Z;
var R1, R2, R8, R9; //range calcs
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

var xModel = [];
var stateMode = 0;
var waitTransition;
var maxState;

var inputRow;
var inputColumn;

var CL;

function StateModel(id, name, process) {
    this.id = id;
    this.name = name;
    this.process = process;
}

function buildStateModel() {
    var modeCount = 1;
    xModel[modeCount++] = new StateModel(1, "loading", loadScreen);
    xModel[modeCount++] = new StateModel(2, "accept instructions input", gotInstructionInput);
    xModel[modeCount++] = new StateModel(3, "old or new game", gotLoadInput);
    xModel[modeCount++] = new StateModel(4, "cheeky instructions", showInstructions);
    xModel[modeCount++] = new StateModel(5, "accept oldnew input", gotLoadInput);
    xModel[modeCount++] = new StateModel(6, "accept dungeon # input", gotDungeonInput);
    xModel[modeCount++] = new StateModel(7, "load old dungeon", fetchDungeonSave);
    xModel[modeCount++] = new StateModel(8, "continues reset", gotResetInput);
    xModel[modeCount++] = new StateModel(9, "accept player name", gotNameInput);
    xModel[modeCount++] = new StateModel(10, "roll", rollNew);
    xModel[modeCount++] = new StateModel(10.5, "pick class", pickClass);
    xModel[modeCount++] = new StateModel(11, "accept class input", gotClassInput);
    xModel[modeCount++] = new StateModel(12, "picked fighter", gotFighter);
    xModel[modeCount++] = new StateModel(13, "picked cleric", gotCleric);
    xModel[modeCount++] = new StateModel(14, "picked wizard", gotWizard);
    xModel[modeCount++] = new StateModel(15, "go shopping", shopTop);
    xModel[modeCount++] = new StateModel(16, "accept fast-norm shop", gotShopFastNorm);
    xModel[modeCount++] = new StateModel(17, "shopping list", shopList);
    xModel[modeCount++] = new StateModel(18, "buy goods", shopping);
    xModel[modeCount++] = new StateModel(19, "buying goods", gotShoppingInput);
    xModel[modeCount++] = new StateModel(20, "finished buying", showInvQuestion);
    xModel[modeCount++] = new StateModel(20.5, "accept show inv", gotInvQuestion);
    xModel[modeCount++] = new StateModel(21, "show inv", showInventory);
    xModel[modeCount++] = new StateModel(22, "show stats", showStats);
    xModel[modeCount++] = new StateModel(23, "main game", welcome);
    xModel[modeCount++] = new StateModel(23.5, "accept show commands", gotCommandsQuestion);
    xModel[modeCount++] = new StateModel(24, "show commands", showCommands);
    xModel[modeCount++] = new StateModel(25, "get command", getCommand);
    xModel[modeCount++] = new StateModel(26, "route command", gotCommand);
    xModel[modeCount++] = new StateModel(30, "get pretend basic interpreter input", getBASIC);
    xModel[modeCount++] = new StateModel(31, "got pretend basic interpreter input", gotBASIC);
    xModel[modeCount++] = new StateModel(45, "make a move", startMove);
    xModel[modeCount++] = new StateModel(46, "accept a move", gotMove);
    xModel[modeCount++] = new StateModel(47, "finish move", completeMove);
    xModel[modeCount++] = new StateModel(48, "into a wall", thud);
    xModel[modeCount++] = new StateModel(49, "into a trap", itsatrap);
    xModel[modeCount++] = new StateModel(50, "secret door", hush);
    xModel[modeCount++] = new StateModel(51, "boost str", boost1);
    xModel[modeCount++] = new StateModel(52, "boost con", boost2);
    xModel[modeCount++] = new StateModel(53, "into a bod", surprise);
    xModel[modeCount++] = new StateModel(54, "gold", gold);
    xModel[modeCount++] = new StateModel(55, "open door", openDoor);
    xModel[modeCount++] = new StateModel(56, "accept door move", gotDoorMove);
    xModel[modeCount++] = new StateModel(57, "search", searching);
    xModel[modeCount++] = new StateModel(58, "change weapon", swapWeapon);
    xModel[modeCount++] = new StateModel(59, "accept change weapon", gotSwap);
    xModel[modeCount++] = new StateModel(60, "start player fight", fight1);
    xModel[modeCount++] = new StateModel(61, "punch", knuckles);
    xModel[modeCount++] = new StateModel(62, "attack with a sword", swingASword);
    xModel[modeCount++] = new StateModel(63, "attack with a 2h-sword", swingABigSword);
    xModel[modeCount++] = new StateModel(64, "attack with a dagger", pokeADagger);
    xModel[modeCount++] = new StateModel(65, "attack with a mace", swingAMace);
    xModel[modeCount++] = new StateModel(66, "attack with something", improvise);
    xModel[modeCount++] = new StateModel(67, "throw food", throwFood);
    xModel[modeCount++] = new StateModel(68, "really punch", knucklehead);
    xModel[modeCount++] = new StateModel(69, "resolve improvised attack", resolveImprov);
    xModel[modeCount++] = new StateModel(70, "accept club-sight", gotSilverCross);
    xModel[modeCount++] = new StateModel(71, "remove used weapon or ammo", consumeWpn);
    xModel[modeCount++] = new StateModel(72, "hit monster with food", peltMonster);
    xModel[modeCount++] = new StateModel(73, "distract monster with food", kiteMonster);
    xModel[modeCount++] = new StateModel(74, "loose thrown food", consumeFood);
    xModel[modeCount++] = new StateModel(75, "look command", looking);
    xModel[modeCount++] = new StateModel(76, "save", saveGame);
    xModel[modeCount++] = new StateModel(77, "cast a spell", casting);
    xModel[modeCount++] = new StateModel(78, "cast a cleric spell", gotClericSpell);
    xModel[modeCount++] = new StateModel(79, "cast cleric spell 1 (kill)", clericSpell1);
    xModel[modeCount++] = new StateModel(80, "cast cleric spell 2 (magic missile #2)", clericSpell2);
    xModel[modeCount++] = new StateModel(81, "cast cleric spell 3 (cure light wounds #1)", clericSpell3);
    xModel[modeCount++] = new StateModel(82, "cast cleric spell 4/8 (find all traps/s.doors)", clericSpell4);
    xModel[modeCount++] = new StateModel(83, "cast cleric spell 5 (magic missile #1)", clericSpell5);
    xModel[modeCount++] = new StateModel(84, "cast cleric spell 6 (magic missile #3)", clericSpell6);
    xModel[modeCount++] = new StateModel(85, "cast cleric spell 7 (cure light wounds #2)", clericSpell7);
    xModel[modeCount++] = new StateModel(86, "cast cleric spell 9 (cheat - push)", clericSpell9);
    xModel[modeCount++] = new StateModel(87, "cast a wizard spell", gotWizardSpell);
    xModel[modeCount++] = new StateModel(88, "cast wizard spell 2", wizardSpell2);
    xModel[modeCount++] = new StateModel(89, "cast wizard spell 3", wizardSpell3);
    xModel[modeCount++] = new StateModel(90, "cast wizard spell 4", wizardSpell4);
    xModel[modeCount++] = new StateModel(91, "accept wizard spell 4", gotWizardSpell4);
    xModel[modeCount++] = new StateModel(92, "buy spells", buyMagic);
    xModel[modeCount++] = new StateModel(93, "cleric spell choice question", askACleric);
    xModel[modeCount++] = new StateModel(94, "wizard spell choice question", askAWizard);
    xModel[modeCount++] = new StateModel(95, "cleric spell list", clericSpellChoices);
    xModel[modeCount++] = new StateModel(96, "wizard spell list", wizardSpellChoices);
    xModel[modeCount++] = new StateModel(97, "cleric spell transaction", clericSpellPurchase);
    xModel[modeCount++] = new StateModel(98, "wizard spell transaction", wizardSpellPurchase);
    xModel[modeCount++] = new StateModel(99, "cheat: show map", showCheatMap);
    xModel[modeCount++] = new StateModel(100, "gold into sauce", buyHP);
    xModel[modeCount++] = new StateModel(101, "got gold get sauce", addHP);
    xModel[modeCount++] = new StateModel(102, "start edit map", modifyMap);
    xModel[modeCount++] = new StateModel(102.5, "got map number", modifyGotMap);
    xModel[modeCount++] = new StateModel(103, "get map pos", modifyMapPos);
    xModel[modeCount++] = new StateModel(104, "update map pos", modifyMapDone);
    xModel[modeCount++] = new StateModel(105, "save map changes", modifyMapSave);
    xModel[modeCount++] = new StateModel(200, "route post-player actions", routeGameMove);
    xModel[modeCount++] = new StateModel(201, "got answer to more equipment", gotMoreEquipment);
    xModel[modeCount++] = new StateModel(202, "check if map is cleared", monsterMove);
    xModel[modeCount++] = new StateModel(203, "report kill", confirmedKill);
    xModel[modeCount++] = new StateModel(204, "make a monster move big step", makeAMonsterMove);
    xModel[modeCount++] = new StateModel(205, "got reset answer", resetAfterClear);
    xModel[modeCount++] = new StateModel(206, "make a monster move small step", monsterAction);
    xModel[modeCount++] = new StateModel(207, "monster attacks player", monsterSwings);

    stateMode = 1;
    maxState = modeCount - 1;
    waitTransition = false;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toGMTString();
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
    R1 = 1000;
    M = 26;
    N = 26;
    for (m = -25; m <= 25; m++) {
        for (n = -25; n <= 25; n++) {
            if ((G + m <= 25) && (G + m >= 0) && (H + n <= 25) && (H + n >= 0)) {
                if (D[G + m][H + n] == 5) {
                    M = m;
                    N = n;
                    R1 = Math.sqrt(M * M + N * N);
                    m = 26;
                    n = 26;
                }
            }
        }
    }
    R8 = M;
    R9 = N;
    if (Int(Rnd(0) * 20 + 1) > 18) {
        R2 = 3;
    } else {
        if (Rnd(0) * 20 > B[K][2] == C[2] / 3) {
            R2 = 2;
        } else {
            if (Rnd(0) * 2 > 1.7) {
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

function modelEngine() {
    // find mode in xModel
    waitTransition = false;
    while (!waitTransition) {
        var check = true;
        var modeError = false;
        var index = 1;
        var actMode;
        while (check) {
            if (xModel[index].id == stateMode) {
                actMode = xModel[index];
                check = false;
            } else {
                index++;
                check = (index <= maxState);
                if (!check) {
                    console.info("failed to find mode " + stateMode);
                    modeError = true;
                    waitTransition = true;
                }
            }
        }
        if (!modeError) {
            console.info("processing " + actMode.name);
            actMode.process();
        }
    }
}

/**
 * @return {number}
 */
function Rnd(x) {
    if (x == 0) {
        return Math.random();
    } else {
        return x * Math.random();
    }
}

/**
 * @return {number}
 */
function Int(x) {
    if (x < 0) {
        return Math.ceil(x);
    } else {
        return Math.floor(x);
    }
}

function initialiseGlobals(gameConsole) {
    CL = 365; //cookie lifespan
    G = Int(Rnd(24) + 2);
    H = Int(Rnd(24) + 2);
    terminal = gameConsole;
    reading = false;
    inputString = "";
    vbTab = String.fromCharCode(9);
    X = 0;
    Dn = 0;
    J = 0;
    K = 0;
    P0 = 0;

    for (var m = 0; m < 50; m++) {
        D[m] = [];
        for (var n = 0; n < 50; n++) {
            D[m][n] = 0;
        }
    }
    for (m = 0; m < 100; m++) {
        B[m] = [];
        for (n = 0; n < 6; n++) {
            B[m][n] = 0;
        }
    }
    strI = ["", "SWORD", "2-H-SWORD", "DAGGER", "MACE", "SPEAR", "BOW", "ARROWS", "LEATHER MAIL", "CHAIN MAIL", "TLTE MAIL", "ROPE", "SPIKES", "FLASK OF OIL", "SILVER CROSS", "SPARE FOOD"];
    P = [0, 10, 15, 3, 5, 2, 25, 2, 15, 30, 50, 1, 1, 2, 25, 5];
    strC = ["", "STR", "DEX", "CON", "CHAR", "WIS", "INT", "GOLD"];
    X5 = [0, 500, 200, 200, 200, 100, 300, 1000, 200];
    X6 = [0, 75, 500, 200, 750, 600, 100, 200, 300, 200, 600];

    for (m = 0; m <= 7; m++) {
        C[m] = 0;
    }

    buildStateModel();
    $(document).on("endInput", gotInput);
    $(document).on("partialInput", partial);
}

function loadMonsters() {
    strB = ["", "MAN", "GOBLIN", "TROLL", "SKELETON", "BALROG", "OCHRE JELLY", "GREY OOZE", "GNOME", "KOBOLD", "MUMMY"];
    B[1] = [0, 1, 13, 26, 1, 1, 500];
    B[2] = [0, 2, 13, 24, 1, 1, 600];
    B[3] = [0, 3, 15, 35, 1, 1, 1000];
    B[4] = [0, 4, 22, 12, 1, 1, 50];
    B[5] = [0, 5, 18, 110, 1, 1, 5000];
    B[6] = [0, 6, 11, 20, 1, 1, 0];
    B[7] = [0, 7, 11, 13, 1, 1, 0];
    B[8] = [0, 8, 13, 30, 1, 1, 100];
    B[9] = [0, 9, 15, 16, 1, 1, 500];
    B[10] = [0, 10, 16, 30, 1, 1, 100];
    for (M = 1; M <= 10; M++) {
        B[M][4] = B[M][3];
        B[M][5] = B[M][6];
        B[M][1] = 1;
    }
}

function partial() {
    terminal.printAt(inputRow, inputColumn, inputString.toUpperCase() + "_ ");
}

function Input() {
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
    terminal.info("waiting for input");
}

function InputStr() {
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
    terminal.info("waiting for input");
}

function InputX(items) {
    inputsCount = items;
    inputFilter = 1;
    inputString = "";
    reading = true;
    inputRow = terminal.cursorPosition.row;
    inputColumn = terminal.cursorPosition.column;
    if ((typeof(terminal) != "undefined") && (typeof(inputRow) != "undefined")) {
        terminal.printAt(inputRow, inputColumn, "_");
    }
    terminal.info("waiting for input");
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
            terminal.info("waiting for input");
        } else {
            terminal.println("");
            modelEngine();
        }
    } else {
        terminal.println("");
        modelEngine();
    }
}

function Main(terminal) {
    //main loop
    initialiseGlobals(terminal);
    modelEngine();
}

/* main game code starts here - each function (unless stated otherwise) represents a game state */

function loadScreen() { //1
    terminal.println("        DUNGEONS AND DRAGONS #1");
    terminal.println("     (C) 1977-2014 Richard Garriott");
    terminal.println("        Ported by Julian Brown");
    terminal.println("all rights to this port remain property");
    terminal.println("          of Richard Garriott");
    terminal.println("    ******UPDATED 5 May 2014******");
    terminal.println("");
    terminal.println("   warning, this site uses cookies, if you");
    terminal.println(" don't want to store cookies please stop now");
    terminal.println("");
    terminal.print("DO YOU NEED INSTRUCTIONS ");
    stateMode = 2;
    waitTransition = true;
    InputStr();
}

function gotInstructionInput() { //2
    var strQ = inputString.trim();
    if (strQ == "YES" || strQ == "Y") {
        stateMode = 4;
    }
    else {
        terminal.print("OLD OR NEW GAME");
        stateMode = 3;
        waitTransition = true;
        InputStr();
    }
}

function gotLoadInput() { //3
    var strQ = inputString.trim();
    if (strQ == "OLD") {
        stateMode = 7;
    } else {
        terminal.print("DUNGEON #");
        stateMode = 6;
        waitTransition = true;
        Input();
    }
}

function showInstructions() { //4
    terminal.println("WHO SAID YOU COULD PLAY");
    terminal.println("[STOP]");
    stateMode = 30;
}

function gotDungeonInput() { //6
    var Q = parseInt(inputString.trim());
    Dn = Math.floor(Q);
    terminal.print("CONTINUES RESET 1=YES,2=NO ");
    stateMode = 8;
    waitTransition = true;
    Input();
}

function fetchDungeonSave() { //7
    var stream;
    var elements;
    var m, n;
    terminal.info("loading saved dungeon");
    //use cookies
    Dn = getCookie("dnd1file7.D");
    if (Dn != "") {
        Dn = parseInt(Dn);
        stream = getCookie("dnd1file7.X");
        elements = stream.split("|");
        X = parseInt(elements[0]);
        J = parseInt(elements[1]);
        G = parseInt(elements[2]);
        H = parseInt(elements[3]);
        K = parseInt(elements[4]);
        for (m = 0; m <= 25; m++) {
            stream = getCookie("dnd1file7.D." + m);
            elements = stream.split("|");
            for (n = 0; n <= 25; n++) {
                D[m][n] = parseInt(elements[n]);
            }
        }
        stream = getCookie("dnd1file7.W");
        elements = stream.split("|");
        for (m = 0; m <= X; m++) {
            W[m] = parseInt(elements[m]);
        }
        stream = getCookie("dnd1file7.B$");
        elements = stream.split("|");
        for (m = 1; m <= 10; m++) {
            strB[m] = elements[m - 1]
        }
        for (m = 1; m <= 10; m++) {
            stream = getCookie("dnd1file7.B." + m);
            elements = stream.split("|");
            for (n = 1; n <= 6; n++) {
                B[m][n] = parseInt(elements[n - 1]);
            }
        }
        stream = getCookie("dnd1file7.C");
        elements = stream.split("|");
        for (m = 0; m <= 7; m++) {
            strC[m] = elements[m * 2];
            C[m] = parseInt(elements[m * 2 + 1]);
        }
        strN = getCookie("dnd1file7.N$");
        F1 = parseInt(getCookie("dnd1file7.F1"));
        stream = getCookie("dnd1file7.I$");
        elements = stream.split("|");
        for (m = 1; m <= 15; m++) {
            strI[m] = elements[m - 1];
        }
        X3 = parseInt(getCookie("dnd1file7.X3"));
        stream = getCookie("dnd1file7.X4");
        elements = stream.split("|");
        for (m = 1; m <= X3; m++) {
            X4[m] = parseInt(elements[m - 1]);
        }
        X1 = parseInt(getCookie("dnd1file7.X1"));
        stream = getCookie("dnd1file7.X2");
        elements = stream.split("|");
        for (m = 1; m <= X1; m++) {
            X2[m] = parseInt(elements[m - 1]);
        }
        F2 = parseInt(getCookie("dnd1file7.F2"));
        stateMode = 23;
    } else {
        terminal.println("ERROR FILE #7 DOES NOT EXIST");
        terminal.println("[STOP]");
        stateMode = 30;
    }
}

//load default dungeon where not locally saved
function loadDungeon(d) {
    var m, n;
    terminal.println("READING DUNGEON NUM. " + d);
    D[0][0] = getCookie("dnd1file" + d + ".D.0");
    if (D[0][0] === "") {
        D[0] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        D[1] = [1, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 3, 0, 1, 6, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        D[2] = [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 2, 1, 0, 1, 0, 1, 1, 0, 1];
        D[3] = [1, 0, 0, 0, 1, 0, 2, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 3, 0, 1, 0, 0, 1, 0, 1];
        D[4] = [1, 1, 1, 3, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 4, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1];
        D[5] = [1, 0, 0, 6, 1, 0, 0, 6, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 6, 1, 0, 0, 1, 0, 1];
        D[6] = [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1];
        D[7] = [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 6, 0, 1, 1, 1, 0, 1];
        D[8] = [1, 1, 1, 1, 3, 1, 1, 1, 1, 0, 0, 0, 1, 4, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1];
        D[9] = [1, 0, 6, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1];
        D[10] = [1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 3, 0, 1, 0, 1, 0, 1];
        D[11] = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1];
        D[12] = [1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 6, 0, 0, 0, 4, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1];
        D[13] = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1];
        D[14] = [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1];
        D[15] = [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1];
        D[16] = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1];
        D[17] = [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1];
        D[18] = [1, 0, 1, 0, 0, 0, 1, 0, 1, 3, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1];
        D[19] = [1, 0, 1, 0, 1, 1, 1, 0, 3, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1];
        D[20] = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1];
        D[21] = [1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1];
        D[22] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 4, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1];
        D[23] = [1, 1, 1, 0, 0, 0, 2, 4, 0, 1, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 1];
        D[24] = [1, 6, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1];
        D[25] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    } else {
        var stream, elements;
        for (m = 0; m <= 25; m++) {
            stream = getCookie("dnd1file" + d + ".D." + m);
            elements = stream.split("|");
            for (n = 0; n <= 25; n++) D[m][n] = parseInt(elements[n]);
        }
    }
    for (m = 0; m <= 25; m++) {
        for (n = 0; n <= 25; n++) {
            if (d != 0) {
                terminal.info("M=" + m + " N=" + n);
                if (D[m][n] === 0) {
                    if (Rnd(0) >= 0.97) {
                        D[m][n] = 7;
                    } else if (Rnd(0) >= 0.97) {
                        D[m][n] = 8;
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
    stateMode = 9;
    waitTransition = true;
    InputStr();
}

function gotNameInput() {
    strN = inputString.trim();
    if (strN == "SHAVS") {
        stateMode = 10;
    } else {
        stateMode = 4;
    }
}

function rollNew() {
    for (var M = 1; M <= 7; M++) {
        for (var N = 1; N <= 3; N++) {
            var R = Int(Rnd(0) * 6 + 1);
            C[M] = C[M] + R;
        }
        if (M == 7) {
            C[M] = C[M] * 15;
        }
        terminal.println(strC[M] + "=" + C[M]);
    }
    stateMode = 10.5;
}

function pickClass() {
    terminal.println("");
    terminal.println("CLASSIFICATION");
    terminal.println("WHICH DO YOU WANT TO BE");
    terminal.print("FIGHTER ,CLERIC ,OR WIZARD");
    stateMode = 11;
    waitTransition = true;
    InputStr();
}

function gotClassInput() {
    strC[0] = inputString.trim();
    if (strC[0] == "NONE") {
        for (var M = 0; M <= 7; M++) {
            C[M] = 0;
        }
        stateMode = 10;
    } else {
        switch (strC[0]) {
            case "FIGHTER":
                stateMode = 12;
                break;
            case "CLERIC":
                stateMode = 13;
                break;
            case "WIZARD":
                stateMode = 14;
                break;
            default:
                stateMode = 10.5;
        }
    }
}

function gotFighter() {
    C[0] = Int(Rnd(0) * 8 + 1);
    stateMode = 15;
}

function gotCleric() {
    C[0] = Int(Rnd(0) * 6 + 1);
    stateMode = 15;
}

function gotWizard() {
    C[0] = Int(Rnd(0) * 4 + 1);
    stateMode = 15;
}

function shopTop() {
    terminal.println("BUYING WEAPONS");
    terminal.println("FAST OR NORM");
    waitTransition = true;
    InputStr();
    stateMode = 16;
}

function gotShopFastNorm() {
    strQ = inputString.trim();
    if (strQ == "FAST") {
        stateMode = 18;
    } else {
        stateMode = 17;
    }
    terminal.println("NUMBER" + vbTab + "ITEM" + vbTab + "PRICE");
    terminal.println("-1-STOP");
}

function shopList() { //17
    for (var M = 1; M <= 15; M++) {
        terminal.println(M + vbTab + strI[M] + vbTab + P[M]);
    }
    stateMode = 18;
}

function shopping() { //18
    waitTransition = true;
    stateMode = 19;
    Input();
}

function buyItem(Y) {
    X++;
    C[7] = C[7] - P[Y];
    terminal.println("GP= " + C[7]);
    W[X] = Y;
}

function gotShoppingInput() {
    Y = Math.floor(inputString);
    if (Y < 0 || Y > 15) {
        stateMode = 20; //stop shopping
    } else {
        if (C[7] < P[Y]) {
            terminal.println("COSTS TOO MUCH");
            terminal.println("TRY AGAINN ");
        } else {
            if (strC[0] == "CLERIC") {
                if (Y == 4 || Y == 8 || Y == 9 || Y > 10) {
                    buyItem(Y);
                }
                else {
                    terminal.println("YOUR A CLERIC YOU CANT USE THAT ");
                }
            } else if (strC[0] == "WIZARD") {
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
        stateMode = 18;
    }
}

function showInvQuestion() {
    terminal.print("EQ LIST ");
    waitTransition = true;
    stateMode = 20.5;
    InputStr();
}

function gotInvQuestion() {
    strQ = inputString.trim();
    if (strQ == "NO") {
        stateMode = 22;
    } else {
        stateMode = 21;
    }
}

function showInventory() {
    for (var M = 1; M <= X; M++) {
        if (W[M] != 0) {
            terminal.println(W[M] + vbTab + strI[W[M]]);
        }
    }
    stateMode = 22;
}

function showStats() {
    terminal.println("YOUR CHARACTERISTICS ARE:");
    terminal.println(strC[0]);
    if (C[0] == 1) {
        C[0] = 2;
    }
    terminal.println("HIT POINTS" + vbTab + C[0]);
    terminal.println("");
    terminal.println("");
    stateMode = 23;
}

function welcome() {
    loadDungeon(Dn);
    terminal.println("");
    terminal.println("");
    terminal.println("");
    terminal.println("WELCOME TO DUNGEON #" + Dn);
    terminal.println("YOU ARE AT (" + G + "," + H + ")");
    terminal.println("");
    terminal.print("COMANDS LIST" + vbTab);
    waitTransition = true;
    stateMode = 23.5;
    InputStr();
}

function gotCommandsQuestion() {
    strQ = inputString.trim();
    if (strQ == "YES") {
        stateMode = 24;
    } else {
        stateMode = 25;
    }
}

function showCommands() {
    terminal.println("");
    terminal.println("1=MOVE  2=OPEN DOOR  3=SEARCH FOR TRAPS AND SECRET DOORS");
    terminal.println("4=SWITCH WEAPON HN HAND  5=FIGHT");
    terminal.println("6=LOOK AROUND  7=SAVE GAME  8=USER MAGIC  9=BUY MAGIC");
    terminal.println("0=PASS  11=BUY H.P.");
    stateMode = 25;
}

function getCommand() { //25
    terminal.print("COMMAND=");
    waitTransition = true;
    stateMode = 26;
    Input();
}

function gotCommand() {
    T = parseInt(inputString.trim());
    switch (T) {
        case 1: // move
            stateMode = 45;
            break;
        case 2: // open door
            stateMode = 55;
            break;
        case 3: // search
            stateMode = 57;
            break;
        case 4: // change weapon
            stateMode = 58;
            break;
        case 5: // fight
            stateMode = 60;
            break;
        case 6: // look around
            stateMode = 75;
            break;
        case 7: // save game
            stateMode = 76;
            break;
        case 8: // use magic
            stateMode = 77;
            break;
        case 9: // buy magic
            stateMode = 92;
            break;
        case 10: // cheat show map
            stateMode = 99;
            break;
        case 11: // buy hp
            stateMode = 100;
            break;
        case 12: // cheat modify map
            stateMode = 102;
            break;
        case 0: //pass
            stateMode = 200;
            break;
        default:
            terminal.println("COME ON ");
            stateMode = 25;
            break;
    }
}

function getBASIC() { //30
    terminal.print(">");
    InputStr();
    waitTransition = true;
    stateMode = 31;
}

function gotBASIC() { //31
    strQ = inputString.trim();
    if (strQ == "RUN") {
        stateMode = 1;
    } else if (strQ == "CLS") {
        terminal.cls();
        stateMode = 30;
    } else {
        terminal.println("SYNTAX ERROR");
        stateMode = 30;
    }
}

function startMove() { //45
    terminal.println("YOU ARE AT " + G + " , " + H);
    terminal.println("  DOWN  RIGHT  LEFT  OR  UP");
    InputStr();
    waitTransition = true;
    stateMode = 46;
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
    if (strQ == "DOWN" || strQ == "D") {
        S = 1;
    }
    if (S == 0 && T == 0) {
        stateMode = 45;
    } else {
        var look = D[G + S][H + T];
        switch (look) {
            case 0:
                stateMode = 47; // space
                break;
            case 2:
                stateMode = 49; // trap
                break;
            case 3:
                stateMode = 50; // secret door
                break;
            case 7:
                stateMode = 51; // inc str
                break;
            case 8:
                stateMode = 52; // inc con
                break;
            case 5:
                stateMode = 53; // monster
                break;
            case 6:
                stateMode = 54; // gold
                break;
            default:
                stateMode = 48; // wall
                break;
        }
    }
}

function completeMove() {
    G += S;
    H += T;
    terminal.println("DONE");
    stateMode = 200;
}

function thud() {
    terminal.println("YOU RAN INTO A WALL");
    if ((Rnd(0) * 12 + 1) > 9) {
        terminal.println("AND LOOSE 1 HIT POINT");
        C[0] -= 1;
    } else {
        terminal.println("BUT NO DAMAGE WAS INFLICTED");
    }
    stateMode = 200;
}

function itsatrap() {
    var m;
    terminal.println("OOOOPS A TRAP AND YOU FELL IN");
    if ((Rnd(0) * 2) < 2) {
        terminal.println("AND HIT POINTS LOOSE 1");
        C[0] -= 1;
    }
    terminal.println("I HOPE YOU HAVE SOME SPIKES AND PREFERABLY ROPE");
    terminal.println("LET ME SEE");
    var found1 = false;
    var found2 = false;
    for (m = 1; m <= X; m++) {
        if (W[m] == 12) {
            W[m] = 0;
            m = X + 1;
            found1 = true;
        }
    }
    if (found1) {
        for (m = 1; m <= X; m++) {
            if (W[m] == 11) {
                W[m] = 0;
                m = X + 1;
                found2 = true;
            }
        }
        if (found2) {
            terminal.println("GOOD BOTH");
            terminal.println("YOU MANAGE TO GET OUT EASY");
            terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
            stateMode = 45;
        } else {
            terminal.println("NO ROPE BUT AT LEAST SPIKES");
            var loop = true;
            while (loop) {
                if (Int(Rnd(0) * 3) + 1 != 2) {
                    terminal.println("YOU MANAGE TO GET OUT EASY");
                    terminal.println("YOUR STANDING NEXT TO THE EDGE THOUGH I'D MOVE");
                    stateMode = 45;
                    loop = false;
                } else {
                    terminal.println("YOU FALL HALFWAY UP");
                    if (Int(Rnd(0) * 6) > C[1] / 3) {
                        terminal.println("OOPS H.P. LOOSE 1");
                        C[0] -= 1;
                    }
                    terminal.println("TRY AGAIN ");
                }
            }
        }
    } else {
        terminal.println("NO SPIKES AH THATS TOO BAD CAUSE YOUR DEAD");
        terminal.println("[STOP]");
        stateMode = 30;
    }
}

function hush() {
    if (Int(Rnd(0) * 6) < 1) { //check original code - only partial logic present
        terminal.println("YOU JUST RAN INTO A SECRET DOOR");
        terminal.println("AND OPENED IT");
        G += S;
        H += T;
        stateMode = 200;
    } else {
        stateMode = 48;
    }
}

function boost1() {
    C[1] += 1;
    D[G + S][H + T] = 0;
    if (Rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        C[0] -= Int(Rnd(0) * 4 + 1);
        terminal.println("HP= " + C[0]);
    }
    stateMode = 47;
}

function boost2() {
    C[3] += 1;
    D[G + S][H + T] = 0;
    if (Rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        C[0] -= Int(Rnd(0) * 4 + 1);
        terminal.println("HP= " + C[0]);
    }
    stateMode = 47;
}

function surprise() {
    terminal.println("YOU RAN INTO THE MONSTER");
    terminal.println("HE SHOVES YOU BACK");
    terminal.println("");
    if (Int(Rnd(0) * 2) + 1 != 2) {
        terminal.println("YOU LOOSE 6 HIT POINT ");
        C[0] -= 6
    }
    stateMode = 200;
}

function gold() {
    terminal.println("AH......GOLD......");
    var G9 = Int(Rnd(0) * 500 + 10);
    terminal.println(G9 + "PIECES");
    C[7] = C[7] + G9;
    terminal.println("GP= " + C[7]);
    D[G + S][H + T] = 0;
    if (Rnd(0) <= 0.2) {
        terminal.println("       POISON      ");
        C[0] -= Int(Rnd(0) * 4 + 1);
        terminal.println("HP= " + C[0]);
    }
    stateMode = 47;
}

function openDoor() {
    terminal.println("DOOR LEFT RIGHT UP OR DOWN");
    waitTransition = true;
    InputStr();
    stateMode = 56;
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
    if (strQ == "DOWN" || strQ == "D") {
        S = 1;
    }
    if (S == 0 && T == 0) {
        stateMode = 55;
    } else {
        var look = D[G + S][H + T];
        if (look == 3 || look == 4) {
            terminal.println("PUSH");
            if (Int(Rnd(0) * 20) + 1 >= C[1]) {
                terminal.println("DIDNT BUDGE");
                stateMode = 200;
            } else {
                terminal.println("ITS OPEN");
                G += S;
                H += T;
                stateMode = 47;
            }
        } else {
            terminal.println("THERE IS NOT A DOOR THERE");
            stateMode = 25;
        }
    }
}

function searching() {
    terminal.println("SEARCH.........SEARCH...........SEARCH...........");
    if (Int(Rnd(0) * 40) < C[5] + C[6]) {
        for (M = -1; M <= 1; M++) {
            for (N = -1; N <= 1; N++) {
                if (D[G + M][H + N] == 2) {
                    terminal.println("YES THERE IS A TRAP");
                    terminal.println("IT IS " + M + "VERTICALY  " + N + "HORAZONTALY FROM YOU");
                    Z = 1;
                }
                if (D[G + M][H + N] == 3) {
                    terminal.println("YES ITS A DOOR");
                    terminal.println("IT IS " + M + "VERTICALLY  " + N + "HORAZONTALY");
                    Z = 1;
                }
            }
        }
    }
    terminal.println("NO NOT THAT YOU CAN TELL");
    stateMode = 200;
}

function swapWeapon() { //58
    terminal.println("WHICH WEAPON WILL YOU HOLD, NUM OF WEAPON ");
    waitTransition = true;
    stateMode = 59;
    Input();
}

function gotSwap() { //59
    Y = parseInt(inputString.trim());
    if (Y != 0) {
        var found = false;
        for (M = 1; M <= X; M++) {
            if (W[M] == Y) {
                found = true;
                M = X + 1;
            }
        }
        if (found) {
            terminal.println("O.K. YOU ARE NOW HOLDING A " + strI[Y]);
            J = Y;
            stateMode = 200;
        } else {
            terminal.println("SORRY YOU DONT HAVE THAT ONE");
            stateMode = 58;
        }
    } else {
        stateMode = 200;
    }
}

function fight1() { //60
    terminal.println("YOUR WEAPON IS " + strI[J]);
    if (K = 0) {
        stateMode = 25;
    } else {
        terminal.println(strB[K]);
        terminal.println("HP=" + B[K][3]);
        if (J == 0) {
            stateMode = 61;
        }
        if (J == 1) {
            stateMode = 62;
        }
        if (J == 2) {
            stateMode = 63;
        }
        if (J == 3) {
            stateMode = 64;
        }
        if (J == 4) {
            stateMode = 65;
        }
        if (J > 4 && J < 15) { //no weapon
            stateMode = 66;
        }
        if (J == 15) {
            terminal.println("FOOD ???.... WELL O.K.");
            terminal.print("IS IT TO HIT OR DISTRACT");
            waitTransition = true;
            stateMode = 67;
            InputStr();
        }
    }
}

function knuckles() { //61
    terminal.println("DO YOU REALIZE YOU ARE BARE HANDED");
    terminal.print("DO YOU WANT TO MAKE ANOTHER CHOICE");
    waitTransition = true;
    stateMode = 68;
    InputStr();
}

function swingASword() { //62
    terminal.println("SWING");
    findRange();
    if (R1 >= 2) {
        terminal.println("HE IS OUT OF RANGE");
        stateMode = 200;
    } else {
        switch (R2) {
            case 0:
                terminal.println("MISSED TOTALY");
                stateMode = 200;
                break;
            case 1:
                terminal.println("NOT GOOD ENOUGH");
                stateMode = 25;
                break;
            case 2:
                terminal.println("GOOD HIT");
                B[K][3] -= Int(C[1] * 4 / 5);
                stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                B[K][3] -= Int(C[1] / 2);
                stateMode = 25;
                break;
        }
    }
}

function swingABigSword() { //63
    terminal.println("SWHNG");
    findRange();
    if (R1 > 2) {
        terminal.println("HE IS OUT OF RANGE");
        stateMode = 200;
    } else {
        switch (R2) {
            case 0:
                terminal.println("MISSED TOTALY");
                stateMode = 200;
                break;
            case 1:
                terminal.println("HIT BUT ' WELL ENOUGH");
                stateMode = 25;
                break;
            case 2:
                terminal.println("HIT");
                B[K][3] -= Int(C[1] * 5 / 7);
                stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                B[K][3] -= C[1];
                stateMode = 25;
                break;
        }
    }
}

function pokeADagger() { //64
    var found = false;
    for (M = 1; M <= X; M++) {
        if (W[M] === 3) {
            found = true;
            M = X + 1;
        }
    }
    if (!found) {
        terminal.println("YOU DONT HAVE A DAGGER");
    } else {
        findRange();
        if (R1 > 5) { //Then Goto 04710 'OUT OF RANGE
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
                    B[K][3] -= Int(C[1] / 4);
                    break;
                default:
                    terminal.println("CRITICAL HIT");
                    B[K][3] -= Int(C[1] * 3 / 10);
                    break;
            }
            if (R1 >= 2) {
                W[J] = 0;
                J = 0;
            }
        }
    }
    stateMode = 200;
}

function swingAMace() { //65
    terminal.println("SWING");
    findRange();
    if (R1 >= 2) {
        terminal.println("HE IS OUT OF RANGE");
        stateMode = 200;
    } else {
        switch (R2) {
            case 0:
                terminal.println("MISS");
                stateMode = 200;
                break;
            case 1:
                terminal.println("HIT BUT NO DAMAGE");
                stateMode = 25;
                break;
            case 2:
                terminal.println("HIT");
                B[K][3] -= Int(C[1] * 5 / 11);
                stateMode = 25;
                break;
            default:
                terminal.println("CRITICAL HIT");
                B[K][3] -= Int(C[1] * 4 / 9);
                stateMode = 25;
                break;
        }
    }
}

function improvise() { //66
    var found = false;
    for (M = 1; M <= X; M++) {
        if (W[M] == J) {
            found = true;
            M = X + 1;
        }
    }
    if (!found) {
        terminal.println("NO WEAPON FOUND");
        stateMode = 25;
    } else {
        findRange();
        switch (J) {
            case 5:
                R3 = 10;
                R4 = 3 / 7;
                R5 = 5 / 11;
                stateMode = 69;
                break;
            case 6:
                R3 = 15;
                R4 = 3 / 7;
                R5 = 5 / 11;
                found = false;
                var z = 0;
                for (Z = 1; Z <= 100; Z++) {
                    if (W[Z] == 7) {
                        found = true;
                        z = Z;
                        Z = 101;
                    }
                }
                if (!found) {
                    terminal.println("MISS");
                    stateMode = 71;
                } else {
                    J = 7; //Arrow
                    W[Z] = 0;
                    stateMode = 69;
                }
                break;
            case 7:
                R3 = 1.5;
                R4 = 1 / 7;
                R5 = 1 / 5;
                stateMode = 69;
                break;
            case 8:
                R3 = 4;
                R4 = 1 / 10;
                R5 = 1 / 8;
                stateMode = 69;
                break;
            case 9:
                R3 = 4;
                R4 = 1 / 7;
                R5 = 1 / 6;
                stateMode = 69;
                break;
            case 10:
                R3 = 3;
                R4 = 1 / 8;
                R5 = 1 / 5;
                stateMode = 69;
                break;
            case 11:
                R3 = 5;
                R4 = 1 / 9;
                R5 = 1 / 6;
                stateMode = 69;
                break;
            case 12:
                R3 = 8;
                R4 = 1 / 9;
                R5 = 1 / 4;
                stateMode = 69;
                break;
            case 13:
                R3 = 6;
                R4 = 1 / 3;
                R5 = 2 / 3;
                stateMode = 69;
                break;
            default: //14
                terminal.print("AS A CLUB OR SIGHT");
                waitTransition = true;
                stateMode = 70;
                InputStr();
                break;
        }
    }
}

function throwFood() { //67
    strQ = inputString.trim();
    if (strQ == "HIT") {
        stateMode = 72;
    } else {
        terminal.print("THROW A-A=VE,B-BELOW,L-LEFT,OR R-RIGHT OF THE MONSTER");
        Z5 = 0;
        waitTransition = true;
        stateMode = 73;
        InputStr();
    }
}

function knucklehead() { //68
    strQ = inputString.trim();
    if (strQ != "NO") {
        stateMode = 25;
    } else {
        terminal.println("O.K. PUNCH BITE SCRATCH HIT ........");
        var m = 0;
        var n = 0;
        for (M = -1; M < 1; M++) {
            for (N = -1; N < 1; N++) {
                if (D[G + M][H + N] === 5) {
                    m = M;
                    M = 2;
                    n = N;
                    N = 2;
                }
            }
        }
        if (m == 0 && n == 0) {
            terminal.println("NO GOOD ONE");
            stateMode = 25;
        } else {
            if (Int(Rnd(0) * 20) + 1 > B[K][2]) {
                terminal.println("GOOD A HIT");
                B[K][3] -= Int(C[1] / 6);
                stateMode = 25;
            } else {
                terminal.println("TERRIBLE NO GOOD");
                stateMode = 200;
            }
        }
    }
}

function resolveImprov() { //69
    if (R1 > R3) {
        terminal.println("HE IS OUT OF RANGE");
        stateMode = 200;
    } else {
        switch (R2) {
            case 0:
                terminal.println("MISS");
                stateMode = 71;
                break;
            case 1:
                terminal.println("HIT BUT NO DAMAGE");
                stateMode = 71;
                break;
            case 2:
                terminal.println("HIT");
                B[K][3] -= Int(C[1] * R4);
                stateMode = 71;
                break;
            default:
                terminal.println("CRITICAL HIT");
                B[K][3] -= Int(C[1] * R5);
                break;
        }
    }
}

function gotSilverCross() { //70
    strQ = inputString.trim();
    if (strQ == "SIGHT") {
        if (R1 < 10) {
            terminal.println("THE MONSTER IS HURT");
            R5 = 1 / 6;
            if (K == 2 || K == 10 || K == 4) {
                R2 = 3;
            } else {
                R2 = 1;
            }
            R1 = R3 - 1;
            stateMode = 69;
        } else {
            terminal.println("FAILED");
            stateMode = 200;
        }
    } else {
        if (J == 14) {
            R3 = 1.5;
            R4 = 1 / 3;
            R5 = 1 / 2;
            stateMode = 69;
        } else {
            terminal.println("NO WEAPON FOUND");
            stateMode = 25;
        }
    }
}

function consumeWpn() { //71
    if (W[J] == 14) {
        stateMode = 200;
    } else {
        for (M = 1; M <= X; M++) {
            if (W[M] == J) {
                W[M] = 0;
                M = 101;
            }
        }
        if (J != 7) {
            J = 0;
        }
        if (R2 > 0) {
            stateMode = 25;
        } else {
            stateMode = 200;
        }
    }
}

function peltMonster() { //72
    if (Int(Rnd(0) * 20) + 1 == 20) {
        terminal.println("DIRECT HIT");
        B[K][3] -= Int(C[1] / 6);
    } else if (Int(Rnd(0) * 20) + 1 > B[K][2] - C[2] / 3) {
        terminal.println("HIT");
        B[K][3] -= Int(C[1] / 8);
    } else if (Int(Rnd(0) * 20) + 1 > 10 - C[2] / 3) {
        terminal.println("YOU HIT HIM BUT NOT GOOD ENOUGH");
    } else {
        terminal.println("TOTAL MISS");
    }
    stateMode = 74;
}

function kiteMonster() { //73
    strQ = inputString.trim();
    if (strQ == "B") {
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
    var look = D[F1 + S][F2 + T];
    if (look === 0) {
        terminal.println("MONSTER MOVED BACK");
        D[F1][F2] = 0;
        F1 += S;
        F2 += T;
        D[F1][F2] = 5;
    } else if (look == 2) { //Then Goto 04280
        terminal.println("GOOD WORK THE MONSTER FELL INTO A TRAP AND IS DEAD");
        K1 = -1;
        B[K][6] = 0;
        D[F1][F2] = 0; //bug - monster stayed on map
        //stateMode = 200; //bug - kept the food
    } else {
        terminal.println("DIDN'T WORK");
    }
    stateMode = 74;
}

function consumeFood() { //74
    for (M = 1; M <= X; M++) {
        if (Z5 > 0) { //Then Goto 07000 // was Z5 = Q to handle pass through from spells
            stateMode = 200;
        } else if (W[M] == 15) {
            W[M] = 0; //lose the food
            J = 0;
            M = X + 1;
        }
    }
    stateMode = 200;
}

function looking() { //75
    var line;
    for (M = -5; M < 6; M++) {
        line = "";
        for (N = -5; N < 6; N++) {
            if (!((M + G > 25) || (M + G < 0) || (H + N > 25) || (H + N < 0))) {
                if ((M == 0) && (N == 0)) {
                    line += "9";
                } else {
                    if (D[M + G][N + H] == 3) {
                        line += "1";
                    } else if (D[M + G][N + H] == 2 || D[M + G][N + H] == 7 || D[M + G][N + H] == 8) {
                        line += "0";
                    } else {
                        line += D[M + G][N + H];
                    }
                }
            }
        }
        terminal.println(line);
    }
    stateMode = 200;
}

function saveGame() { //76
    var stream;
    var m, n;
    //use cookies and save for a year
    setCookie("dnd1file7.D", Dn, CL);
    stream = X + "|" + J + "|" + G + "|" + H + "|" + K;
    setCookie("dnd1file7.X", stream, CL);
    for (m = 0; m <= 25; m++) {
        stream = "";
        for (n = 0; n <= 25; n++) {
            stream += D[m][n] + "|";
        }
        setCookie("dnd1file7.D." + m, stream, CL);
    }
    stream = "";
    for (m = 1; m <= X; m++) {
        stream += W[m] + "|";
    }
    setCookie("dnd1file7.W", stream, CL);
    stream = "";
    for (m = 1; m <= 10; m++) {
        stream += strB[m] + "|";
    }
    setCookie("dnd1file7.B$", stream, CL);
    for (vm = 1; m <= 10; m++) {
        stream = "";
        for (n = 1; n <= 6; n++) {
            stream += B[m][n] + "|";
        }
        setCookie("dnd1file7.B." + m, stream, CL);
    }
    stream = "";
    for (m = 0; m <= 7; m++) {
        stream += strC[m] + "|" + C[m] + "|";
    }
    setCookie("dnd1file7.C", stream, CL);
    setCookie("dnd1file7.N$", strN, CL);
    setCookie("dnd1file7.F1", F1, CL);
    stream = "";
    for (m = 1; m <= 15; m++) {
        stream += strI[m] + "|";
    }
    setCookie("dnd1file7.I$", stream, CL);
    setCookie("dnd1file7.X3", X3, CL);
    stream = "";
    for (m = 1; m <= X3; m++) {
        stream += X4[m] + "|";
    }
    setCookie("dnd1file7.X4", stream, CL);
    setCookie("dnd1file7.X1", X1, CL);
    stream = "";
    for (m = 1; m <= X1; m++) {
        stream += X2[m] + "|";
    }
    setCookie("dnd1file7.X2", stream, CL);
    setCookie("dnd1file7.F2", F2, CL);
    stateMode = 25;
}

function casting() { //77
    terminal.println("MAGIC");
    if (J != 0) { //Then Goto 08740
        terminal.println("YOU CANT USE MAGIC WITH WEAPON IN HAND");
        stateMode = 200;
    } else if (strC[0] == "CLERIC") {
        terminal.print("CLERICAL SPELL #");
        waitTransition = true;
        stateMode = 78;
        Input();
    } else if (strC[0] == "WIZARD") {
        terminal.print("SPELL #");
        waitTransition = true;
        stateMode = 87;
        Input();
    } else {
        terminal.println("YOU CANT TSE MAGIC YOUR NOT A M.U.");
        stateMode = 200;
    }
}

function gotClericSpell() { //78
    Q = parseInt(inputString.trim());
    var found = false;
    for (var m = 1; m <= X1; m++) {
        if (Q == X2[m]) {
            M = m;
            found = true;
            m = X1 + 1;
        }
    }
    if (!found) {
        terminal.println("YOU DONT HAVE THAT SPELL");
        stateMode = 200;
    } else {
        X3 = X2[M];
        X2[M] = 0;
        //route clerical spell choice
        if (X3 > 3) {
            Q = 2;
        } //bug fix - find all spell uses Q to match floor tile types, not Q2 or Q3
        if (X3 > 4) {
            Q = 3;
        }
        switch (X3) {
            case 1:
                stateMode = 79;
                break;
            case 2:
                stateMode = 80;
                break;
            case 3:
                stateMode = 81;
                break;
            case 4:
                stateMode = 82;
                break;
            case 5:
                stateMode = 83;
                break;
            case 6:
                stateMode = 84;
                break;
            case 7:
                stateMode = 85;
                break;
            case 8:
                stateMode = 82;
                break;
            case 9: //cheat - there is no spell #9 for clerics, this is the push spell
                stateMode = 86;
                break;
            default:
                terminal.println("YOU DONT HAVE THAT SPELL");
                stateMode = 200;
                break;
        }
    }
}

function clericSpell1() { //79
    if (Rnd(0) * 3 > 1) {
        terminal.println("FAILED");
    } else {
        terminal.println("DONE");
        K1 = -1;
    }
    X2[M] = 0;
    stateMode = 200;
}

function clericSpell2() { //80
    terminal.println("DONE");
    B[K][3] -= 4;
    X2[M] = 0;
    stateMode = 200;
}

function clericSpell3() { //81
    C[3] += 3;
    X2[M] = 0;
    stateMode = 200;
}

function clericSpell4() { //82
    X2[M] = 0;
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (!((G + M < 0) || (G + M > 25) || (H + N < 0) || (H + N > 25))) {
                if (D[G + M][H + N] == Q) {
                    terminal.println("THERE IS ONE AT " + M + "LAT." + N + "LONG.");
                }
            }
        }
    }
    terminal.println("NO MORE");
    stateMode = 200;
}

function clericSpell5() { //83
    terminal.println("DONE");
    X2[M] = 0;
    B[K][3] -= 2;
    stateMode = 200;
}

function clericSpell6() { //84
    terminal.println("DONE");
    X2[M] = 0;
    B[K][3] -= 6;
    stateMode = 200;
}

function clericSpell7() { //85
    terminal.println("DONE");
    C[3] += 3;
    stateMode = 200;
}

function clericSpell9() { //86
    if (K == 4 || K == 10) {
        terminal.println("DONE");
        terminal.println("YOU DONT HAVE THAT ONE");
        stateMode = 25;
    } else {
        terminal.println("FAILED");
        stateMode = 200;
    }
}

function gotWizardSpell() { //87  //09320
    Q = parseInt(inputString.trim());
    var found = false;
    for (var m = 1; m <= X3; m++) {
        if (Q == X4[m]) {
            found = true;
            M = m;
            m = X3 + 1;
        }
    }
    if (found) {  //09380
        if (X4[M] == 1) {
            if ((F1 - G == 0) && (F2 - H == 0)) {
                S = 0;
                T = 0;
                Z5 = 1;
                inputString = "";
            } else {
                terminal.println("ARE YOU ABOVE,BELOW,RIGHT, OR LEFT OF IT");
                waitTransition = true;
                InputStr();
            }
            stateMode = 73;
        } else {
            R = 5;
            switch (X4[M]) {
                case 2:
                    stateMode = 88;
                    break;
                case 3:
                    Q = 2;
                    stateMode = 89;
                    break;
                case 4:
                    Q = 2;
                    stateMode = 90;
                    break;
                case 5:
                    Q = 0;
                    stateMode = 92;
                    break;
                case 6:
                    Q = 3;
                    stateMode = 93;
                    break;
                case 7:
                    Q = 6;
                    stateMode = 93;
                    break;
                case 8:
                    Q = 9;
                    stateMode = 93;
                    break;
                case 9:
                    Q = 3;
                    stateMode = 89;
                    break;
                case 10:
                    Q = 1;
                    stateMode = 94;
                    break;
                default:
                    terminal.println("YOU DONT HAVE THAT ONE");
                    stateMode = 25;
                    break;
            }
        }
    } else {
        terminal.println("YOU DONT HAVE THAT ONE");
        stateMode = 25;
    }
}

function wizardSpell2() { //88
    if (Rnd(0) * 3 > 1) {
        terminal.println("DONE");
        K1 = -1;
    } else {
        terminal.println("FAILED");
    }
    stateMode = 200;
}

function wizardSpell3() { //89
    X4[M] = 0;
    for (M = -3; M < 4; M++) {
        for (N = -3; N < 4; N++) {
            if (!((G + M < 0) || (G + M > 25) || (H + N < 0) || (H + N > 25))) {
                if (D[G + M][H + N] == Q) {
                    terminal.println("THERE IS ONE AT " + M + "LAT." + N + "LONG.");
                }
            }
        }
    }
    terminal.println("NO MORE");
    stateMode = 200;
}

function wizardSpell4() { //90
    terminal.print("INPUT CO-ORDINATES");
    waitTransition = true;
    stateMode = 91;
    InputX(2);
}

function gotWizardSpell4() { //91
    M = inputStrings[0];
    N = inputStrings[1];
    terminal.println("DONE");
    G = M;
    H = N;
    stateMode = 200;
}

function buyMagic() { //92
    if (strC[0] == "CLERIC") {
        stateMode = 93;
    } else if (strC[0] == "WIZARD") {
        stateMode = 94;
    } else {
        terminal.println("YOU CANT BUY ANY");
        stateMode = 25;
    }
}

function askACleric() { //93
    terminal.println("DO YOU KNOW THE CHOICES");
    InputStr();
    waitTransition = true;
    stateMode = 95;
}

function askAWizard() { //94
    terminal.println("DO YOU KNOW THE SPELLS");
    InputStr();
    waitTransition = true;
    stateMode = 96;
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
    Input();
    waitTransition = true;
    stateMode = 97;
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
    Input();
    waitTransition = true;
    stateMode = 98;
}

function clericSpellPurchase() { //97
    if (Q > 0) { //Then Goto 10290
        if (Q <= 8) { //Then Goto 10100
            if (C[7] - X5[Int(Q)] < 0) {// Then Goto 10270
                terminal.println("COSTS TOO MUCH");
            } else {
                C[7] -= X5[Int(Q)];
                terminal.println("IT IS YOURS");
                X1 += 1;
                X2[X1] = Int(Q);
            }
        }
        Input();
        waitTransition = true;
        stateMode = 97;
    } else {
        terminal.println("YOUR SPELLS ARE");
        for (M = 1; M <= X1; M++) {
            if (X2[M] != 0) {
                terminal.println("#" + X2[M]);
            }
        }
        terminal.println("DONE");
        stateMode = 25;
    }
}

function wizardSpellPurchase() { //98
    if (Q > 0) {
        if (Q <= 10) {
            if (C[7] - X6[Int(Q)] < 0) {
                terminal.println("COSTS TOO MUCH");
            } else {
                C[7] -= X6[Int(Q)];
                terminal.println("IT IS YOURS");
                X3 += 1;
                X4[X3] = Int(Q);
            }
        }
        Input();
        waitTransition = true;
        stateMode = 98;
    } else {
        terminal.println("YOU NOW HAVE");
        for (M = 1; M <= X3; M++) {
            if (X4[M] != 0) {
                terminal.println("#" + X4[M]);
            }
        }
        stateMode = 25;
    }
}

function showCheatMap() { //99
    // CHEATING
    var line;
    for (M = 0; M <= 25; M++) {
        line = "";
        for (N = 0; N <= 25; N++) {
            line += D[M][N];
        }
        terminal.println(line);
    }
    stateMode = 25;
}

function buyHP() { //100
    terminal.print("HOW MANY 200 GP. EACH ");
    Input();
    waitTransition = true;
    stateMode = 101;
}

function addHP() { //101
    Q = parseInt(inputString.trim());
    if (C[7] - 200 * Q < 0) {
        terminal.println("NO");
        stateMode = 100;
    } else {
        C[0] += Int(Q);
        C[7] -= Int(Q) * 200;
        terminal.println("OK DONE");
        terminal.println("HP= " + C[0]);
        for (M = 1; M <= 7; M++) {
            terminal.println(strC[M] + "= " + C[M]);
        }
        stateMode = 200;
    }
}

function modifyMap() { //102
    terminal.print("DNG");
    Input();
    waitTransition = true;
    stateMode = 102.5;
}

function modifyGotMap() { //102.5
    D2 = parseInt(inputString.trim());
    stateMode = 103;
}

function modifyMapPos() { //103
    terminal.print("X,Y,C");
    InputX(3);
    waitTransition = true;
    stateMode = 104;
}

function modifyMapDone() { //104
    X9 = parseInt(inputStrings[2]);
    Y9 = parseInt(inputStrings[1]);
    C9 = parseInt(inputStrings[0]);
    if (C9 < 0) {
        terminal.println("SAVE");
        Input();
        waitTransition = true;
        stateMode = 105;
    } else {
        D[Y9][X9] = C9;
        stateMode = 103;
    }
}

function modifyMapSave() {
    var stream;
    Q = parseInt(inputString.trim());
    if (Q == 1) {
        var DName = "dnd1file" + Dn + ".D.";
        for (M = 0; M <= 25; M++) {
            stream = "";
            for (N = 0; N <= 25; N++) {
                if (D[M][N] != 7 && D[M][N] != 8) {
                    stream += D[M][N] + "|";
                } else {
                    stream += "0|";
                }
            }
            setCookie(DName + M, stream, CL);
        }
    }
    stateMode = 200;
}

function routeGameMove() { //200
    stateMode = 0;
    if (K1 == -1) {
        stateMode = 203;
    } else {
        if (C[0] < 2) { // low on health
            if (C[0] < 1) { // bleeding out
                while (C[0] < 0) {
                    if (C[3] < 9) {
                        C[0] = 0;
                        C[3] = 0; //exit loop, force dead
                    } else {
                        C[3] -= 2;
                        C[0] += 1;
                    }
                }
                if (C[0] == 0) {
                    if (C[3] < 9) {
                        terminal.Writeln("SORRY YOUR DEAD");
                        stateMode = 30;
                    } else {
                        terminal.Writeln("H.P.=0 BUT CONST. HOLDS");
                    }
                }
            } else {
                terminal.println("WATCH IT H.P.=" + C[0]);
            }
        }
    }
    if (stateMode == 0) {
        if (K > 0) { // 07160
            //monster action
            stateMode = 206;
        } else if (G != 1) {
            if (Rnd(0) * 20 > 10) {
                // move monsters
                stateMode = 202;
            } else {
                stateMode = 25;
            }
        } else if (H != 12) {
            if (Rnd(0) * 20 > 10) {
                // move monsters
                stateMode = 202;
            } else {
                stateMode = 25;
            }
        } else {
            terminal.println("SO YOU HAVE RETURNED");
            if (C[7] < 100) {
                if (Rnd(0) * 20 > 10) {
                    // move monsters
                    stateMode = 202;
                } else {
                    stateMode = 25;
                }
            } else {
                C[7] -= 100;
                terminal.println("WANT TO BUY MORE EQUIPMENT");
                waitTransition = true;
                InputStr();
                stateMode = 201;
            }
        }
    }
}

function gotMoreEquipment() { //201
    strQ = inputString.trim();
    if (strQ == "YES") {
        terminal.println("YOUR H.P. ARE RESTORED 2 POINTS");
        C[0] += 2;
        stateMode = 18;
    } else {
        if (Rnd(0) * 20 > 10) {
            stateMode = 202;
        } else {
            stateMode = 25;
        }
    }
}

function monsterMove() { //202
    var moved = false;
    Z7 = 1;
    while (!moved && Z7 <= 50) {
        M = 1;
        while (!moved && M <= 10) {
            if (B[M][5] >= 1 && Rnd(0) > 0.925) {
                moved = true;
                stateMode = 204;
            }
            M++;
        }
        Z7++;
    }
    if (!moved) {
        terminal.println("ALL MONSTERS DEAD");
        terminal.print("RESET");
        InputStr();
        stateMode = 205;
    }
}

function confirmedKill() { //203
    K1 = 0;
    C[7] += B[K][6];
    F1 = 0;
    F2 = 0;
    terminal.println("GOOD WORK YOU JUST KILLED A " + strB[K]);
    terminal.println("AND GET " + B[K][6] + "GOLD PIECES");
    if (J6 != 1) {
        B[K][5] = 0;
    }
    terminal.println("YOU HAVE" + C[7] + " GOLD ");
    B[K][6] = 0;
    if (J6 === 1) {
        B[K][3] = B[K][4] * B[K][1];
        B[K][6] = B[K][5] * B[K][1];
    }
    K = 0;
    stateMode = 25;
}

function makeAMonsterMove() { //204
    var loopCounter = 0;
    K = M;
    var moved = false;
    while (!moved) { //dangerous - but statiscally should never lock unless it is a very poor map
        loopCounter++; //stop it locking permanently
        M1 = Int(Rnd(0) * 7 + 1);
        M = M1 * -1;
        while (!moved && M <= M1) {
            N = M1 * -1;
            while (!moved && N <= M1) {
                if (!(Math.abs(M) > 2 || Math.abs(N) > 2)) {
                    if (!(G + M < 1 || H + N < 1 || G + M > 25 || H + N > 25)) {
                        if (Rnd(0) <= 0.7) {
                            if (D[G + M][H + N] == 0) {
                                moved = true;
                                D[G + M][H + N] = 5;
                                F1 = G + M;
                                F2 = H + N;
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
    stateMode = 200;
}

function resetAfterClear() { //205
    strQ = inputString.trim();
    if (strQ == "YES") {
        // reset
        J4 += 1; //up difficultly level
        for (M = 1; M <= 10; M++) {
            B[M][3] = B[M][4] * J4;
            B[M][6] = B[M][5] * J4;
        }
        C[0] += 5;
        stateMode = 25;
    } else {
        stateMode = 30;
        terminal.println("[STOP]");
    }
}

function monsterAction() { //206
    findRange();
    if (B[K][3] < 1) { //Then Goto 08290
        //its a kill
        stateMode = 203;
    } else {
        if (R1 < 2.0) { //Then Goto 07600
            //it attacks
            stateMode = 207;
        } else if (P0 > 10) { //Then Goto 01590
            stateMode = 25;
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
                        if (D[F1 + F5][F2 + F6] == q) {
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
                        D[F1][F2] = 0;
                        F1 += F5;
                        F2 += F6;
                        D[F1][F2] = 5;
                        findRange();
                        stateMode = 25;
                        break;
                    case 2:
                        terminal.println("GOOD WORK  YOU LED HIM INTO A TRAP");
                        K1 = -1;
                        B[K][6] = 0;
                        stateMode = 200;
                        break;
                    case 3:
                    case 4:
                        //through the door
                        if (D[F1 + 2 * F5][F2 + 2 * F6] == 0) { // Then Goto 07510
                            F5 = F5 * 2;
                            F6 = F6 * 2;
                            //closer
                            D[F1][F2] = 0;
                            F1 += F5;
                            F2 += F6;
                            D[F1][F2] = 5;
                            findRange();
                        }
                        stateMode = 25;
                        break;
                }
            } else {
                stateMode = 25;
            }
        }
    }
}

function monsterSwings() { //207
    terminal.println(strB[K] + "WATCH IT");
    var found = false;
    M = 1;
    A1 = 6 + C[2];
    while (M <= X && !found) {
        switch (W[M]) {
            case 10:
                found = true;
                A1 = 20 + C[2];
                break;
            case 9:
                found = true;
                A1 = 16 + C[2];
                break;
            case 8:
                found = true;
                A1 = 8 + C[2];
                break;
        }
        M++;
    }
    if (Rnd(0) * 40 > A1) {
        terminal.println("MONSTER SCORES A HIT");
        C[0] -= Int(Rnd(0) * B[K][2] + 1);
        terminal.println("H.P.=" + C[0]);
        stateMode = 200;
    } else if (Rnd(0) * 2 > 1) {
        terminal.println("HE HIT BUT NOT GOOD ENOUGH");
        stateMode = 200;
    } else {
        terminal.println("HE MISSED");
        stateMode = 25;
    }
}

//global routines

$(document).ready(function () {
    Main(new Console('mainConsole', 20, 40));
    $(document).keypress(function (event) {
        if (reading && event.which === 13) {
            event.preventDefault();
            reading = false;
            $.event.trigger({
                type: "endInput",
                message: "EOL",
                time: new Date()
            });
        } else if (reading) {
            if (
                isNumber(inputString + String.fromCharCode(event.which))
                || (String.fromCharCode(event.which) === "-"
                && (inputString.length === 0))
            ) {
                inputString += String.fromCharCode(event.which);
            } else {
                inputString += String.fromCharCode(event.which);
            }
            $.event.trigger({
                type: "partialInput",
                message: "DELTA",
                time: new Date()
            });
        }
    });
    $(document).keydown(function (event) {
        if (reading) {
            if (event.keyCode == 8) {
                event.preventDefault();
                if (inputString.length > 0) {
                    inputString = inputString.substr(0, inputString.length - 1);
                    $.event.trigger({
                        type: "partialInput",
                        message: "DELTA",
                        time: new Date()
                    });
                }
            }
        }
    });
});