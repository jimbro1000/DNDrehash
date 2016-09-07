/**
 * Created by Julian Brown on 07/09/2016.
 */
describe("Serialise and deserialise", function() {
    // beforeAll(function() {
    //     spyOn(window, buildStateModel).and.callFake(function() {});
    // });

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
            spyOn(terminal,"println").and.callThrough();
            spyOn(terminal,"print").and.callThrough();
        });

        it("writes game state data to a cookie (set)", function() {
            spyOn(window,"setCookie").and.callFake(function() {});
            saveGame();
            expect(setCookie).toHaveBeenCalledWith("dnd1file7.dungeonMap", Dn, cookieLifespan);
            expect(setCookie).toHaveBeenCalledTimes(49);
            expect(gameStateMachine.stateMode).toBe(25);
        });
    });

    xdescribe("load game", function() {

    });
});