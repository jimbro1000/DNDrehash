/**
 * @jest-environment jsdom
 */
import {rnd, int, isNumber, setCookie, getCookie} from "../../helper"
/**
 * Created by Julian Brown on 27/08/2016.
 */

describe("Helper function", () => {
    describe("rnd", () => {
        afterEach(()=> {
            jest.clearAllMocks();
        });
        it("Generates a numeric value", () => {
            let x=rnd();
            expect(isNaN(x)).toBe(false);
        });

        // seriously poor test, do we care how it does random?
        it("Calls the Math.random library function", () => {
            const spy = jest.spyOn(Math, 'random');
            rnd();
            expect(spy).toHaveBeenCalled();
        });

        it("Generates a maximum value up to supplied parameter n", () => {
            const f = 0.99999999;
            jest.spyOn(Math, 'random').mockReturnValue(f);
            const n=100;
            const x=rnd(n);
            expect(x).toBe(n*f);
        });

        it("Generates a maximum value up to 1 if supplied parameter is 0", () => {
            jest.spyOn(Math, 'random').mockReturnValue(0.99999999);
            const x=rnd(0);
            expect(x<1).toBe(true);
        });

        it("Generates a maximum value up to 1 if supplied parameter is omitted", () => {
          jest.spyOn(Math, 'random').mockReturnValue(0.99999999);
          const x=rnd();
          expect(x<1).toBe(true);
        });

        it("Generates a minimum value of 0", () => {
            jest.spyOn(Math, 'random').mockReturnValue(0 );
            var n=100;
            var x=rnd(n);
            expect(x === 0).toBe(true);
        });
    });

    describe("int", () => {
        it("Returns a whole number", () => {
            var x= int();
            expect(isNaN(x)).toBe(false);
            expect(x === parseInt(x)).toBe(true);
        });

        it("Rounds positive floats down", () => {
            var x= int(3.5);
            expect(x === 3).toBe(true);
        });

        it("Rounds negative floats up", () => {
            var x= int(-3.5);
            expect(x === -3).toBe(true);
        });
    });

    describe("isNumber", () => {
        it("Returns true if supplied parameter is an integer", () => {
            var x= isNumber(0);
            expect(x).toBe(true);
        });

        it("Returns true if supplied parameter is a float", () => {
            var x=isNumber(1.1);
            expect(x).toBe(true);
        });

        it("Returns false if supplied parameter is omitted", () => {
            var x=isNumber();
            expect(x).toBe(false);
        });

        it("Returns false if supplied parameter is a structured object", () => {
            var x=isNumber({value:1,type:"number"});
            expect(x).toBe(false);
        });

        it("Returns false if supplied parameter is text", () => {
            var x=isNumber("test");
            expect(x).toBe(false);
        });
    });

    describe("setCookie", () => {
    	let testName;
      const client = document;

	    beforeEach(() => {
	    	testName = "Test Name";
	    });

	    afterEach(() => {
		    var d = new Date();
		    d.setTime(d.getTime() - 1000);
	    	client.cookie = testName + "='';expires=" + d.toUTCString();
	    });

	    it("Creates a cookie by name", () => {
		    var value = "test value";
		    var expDays = 1;
		    setCookie(client, testName, value, expDays);
		    expect(client.cookie.indexOf(testName)).not.toEqual(-1);
	    });

	    it("Sets the value of the cookie", () => {
		    var value = "test value";
		    var expDays = 1;
		    setCookie(client, testName, value, expDays);
		    var cookie = client.cookie;
		    var start = cookie.indexOf(testName);
		    cookie = cookie.substr(start);
		    var end = cookie.indexOf(";");
		    if (end !== -1) cookie = cookie.substr(0,end);
		    var expected = testName + "=" + value;
		    expect(cookie === expected).toBe(true);
	    });
    });

	describe("getCookie", () => {
		let testName;
		let testValue;
    const client = document;

    beforeEach(() => {
			testName = "Test Name";
			testValue = "Test Value";
			setCookie(client, testName, testValue, 1);
		});

		afterEach(() => {
			var d = new Date();
			d.setTime(d.getTime() - 1000);
			client.cookie = testName + "='';expires=" + d.toUTCString();
		});

    it("Retrieves the value of a valid, current cookie by name", () => {
			expect(getCookie(client, testName) === testValue).toBe(true);
		});

		it("Returns an empty string if the cookie does not exist", () => {
			expect(getCookie(client, "a fake") === "").toBe(true);
		});
	});
});
