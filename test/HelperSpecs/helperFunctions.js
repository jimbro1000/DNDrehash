/**
 * Created by Julian Brown on 27/08/2016.
 */
describe("Helper function", function() {
    describe("rnd", function() {
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

    describe("int", function() {
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

    describe("isNumber", function() {
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

    describe("setCookie", function() {
    	var testName;

	    beforeEach(function() {
	    	testName = "Test Name";
	    });

	    afterEach(function() {
		    var d = new Date();
		    d.setTime(d.getTime() - 1000);
	    	document.cookie = testName + "='';expires=" + d.toUTCString();
	    });

	    it("Creates a cookie by name", function() {
		    var value = "test value";
		    var expDays = 1;
		    setCookie(testName, value, expDays);
		    expect(document.cookie.indexOf(testName)).not.toEqual(-1);
	    });

	    it("Sets the value of the cookie", function() {
		    var value = "test value";
		    var expDays = 1;
		    setCookie(testName, value, expDays);
		    var cookie = document.cookie;
		    var start = cookie.indexOf(testName);
		    cookie = cookie.substr(start);
		    var end = cookie.indexOf(";");
		    if (end != -1) cookie = cookie.substr(0,end);
		    var expected = testName + "=" + value;
		    expect(cookie === expected).toBe(true);
	    });
    });

	describe("getCookie", function() {
		var testName;
		var testValue;

		beforeEach(function() {
			testName = "Test Name";
			testValue = "Test Value";
			setCookie(testName, testValue, 1);
		});

		afterEach(function() {
			var d = new Date();
			d.setTime(d.getTime() - 1000);
			document.cookie = testName + "='';expires=" + d.toUTCString();
		});

		it("Retrieves the value of a valid, current cookie by name", function() {
			expect(getCookie(testName) === testValue).toBe(true);
		});

		it("Returns an empty string if the cookie does not exist", function() {
			expect(getCookie("a fake") === "").toBe(true);
		});
	});
});
