/**
 * Created by Julian Brown on 27/08/2016.
 */

describe("Helper function rnd", function() {
    it("Generates a numeric value", function() {
        var x=rnd();
        expect(isNaN(x)).toBe(false);
    });

    it("Calls the Math.random library function", function() {
        spyOn(Math, 'random').and.callThrough();
        rnd();
        expect(Math.random).toHaveBeenCalled();
    });

    it("Generates a maximum value up to supplied parameter n", function() {
        spyOn(Math, 'random').and.callFake(function() { return 0.99999999; });
        var n=100;
        var x=rnd(n);
        expect(x<n).toBe(true);
    });

    it("Generates a maximum value up to 1 if supplied parameter is 0 or omitted", function() {
        spyOn(Math, 'random').and.callFake(function() { return 0.99999999; });
        var x=rnd(0);
        expect(x<1).toBe(true);
        x=rnd();
        expect(x<1).toBe(true);
    });

    it("Generates a minimum value of 0", function() {
        spyOn(Math, 'random').and.callFake(function() { return 0; });
        var n=100;
        var x=rnd(n);
        expect(x === 0).toBe(true);
    });
});

describe("Helper function int", function() {
    it("Returns a whole number", function() {
        var x=int();
        expect(isNaN(x)).toBe(false);
        expect(x === parseInt(x)).toBe(true);
    });

    it("Rounds positive floats down", function() {
        var x=int(3.5);
        expect(x === 3).toBe(true);
    });

    it("Rounds negative floats up", function() {
        var x=int(-3.5);
        expect(x === -3).toBe(true);
    });
});

describe("Helper function isNumber", function() {
    it("Returns true if supplied parameter is an integer", function() {
        var x=isNumber(0);
        expect(x).toBe(true);
    });

    it("Returns true if supplied parameter is a float", function() {
        var x=isNumber(1.1);
        expect(x).toBe(true);
    });

    it("Returns false if supplied parameter is omitted", function() {
        var x=isNumber();
        expect(x).toBe(false);
    });

    it("Returns false if supplied parameter is a structured object", function() {
        var x=isNumber({value:1,type:"number"});
        expect(x).toBe(false);
    });

    it("Returns false if supplied parameter is text", function() {
        var x=isNumber("test");
        expect(x).toBe(false);
    });
});