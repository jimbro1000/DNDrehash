/**
 * Created by Julian Brown on 07/09/2016.
 */
describe("Serialise and deserialise", function() {
    describe("save game", function() {
        beforeEach(function() {
            var gameConsole = {
                lastPrint: ""
            };
            gameConsole.println = function(value) { this.lastInput = value; };
            gameConsole.print = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            initialiseGlobals(gameConsole);
            loadMonsters();
            defaultMap();
            Dn = 1;
            characterName = "TEST";
            spyOn(terminal,"println").and.callFake(function() {});
            spyOn(terminal,"print").and.callFake(function() {});
        });

        it("writes game state data to a cookie (set)", function() {
            spyOn(window,"setCookie").and.callThrough(); //(function() {});
            saveGame();
            expect(setCookie).toHaveBeenCalledWith("dnd1file7.dungeonMap", Dn, cookieLifespan);
            expect(setCookie).toHaveBeenCalledTimes(49);
            expect(gameStateMachine.stateMode).toBe(25);
        });
    });

    describe("load game", function() {
        beforeEach(function() {
            var gameConsole = {
                lastPrint: ""
            };
            gameConsole.println = function(value) { this.lastInput = value; };
            gameConsole.print = function(value) { this.lastInput = value; };
            gameStateMachine = {
                stateMode : 1,
                waitTransition : false
            };
            initialiseGlobals(gameConsole);
            loadMonsters();
            defaultMap();
            dungeonMap[5][5] = "X";
            Dn = 0;
            spyOn(terminal,"println").and.callFake(function() {});
            spyOn(terminal,"print").and.callFake(function() {});
        });

        it("reads game state data from a cookie and assembles into a valid state", function() {
            spyOn(window,"getCookie").and.callThrough(function() {});
            fetchDungeonSave();
            expect(getCookie).toHaveBeenCalledWith("dnd1file7.dungeonMap");
            expect(getCookie).toHaveBeenCalledTimes(49);
            expect(Dn).toBe(1);
            expect(dungeonMap[5][5]).toBe(0);
            expect(gameStateMachine.stateMode).toBe(23);
            expect(terminal.println).not.toHaveBeenCalledWith("ERROR FILE #7 DOES NOT EXIST");
            expect(characterName).toBe("TEST");
        });
    });
});