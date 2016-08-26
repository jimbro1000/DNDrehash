describe("Console method print", function() {
    var columns;
    var testConsole;

    beforeEach(function() {
        var consoleNode = document.createElement("div");
        consoleNode.setAttribute("localName", "testConsole");
        consoleNode.setAttribute("id", "testConsole");
        document.body.appendChild(consoleNode);
        columns = 20;
        testConsole = new Console("testConsole", 20, columns);
    });

    afterEach(function() {
        var consoleNode = document.getElementById("testConsole");
        if (consoleNode) {
            consoleNode.remove();
        }
    });

    it("should print the passed string on the console at the current position", function() {
        var expected = "test message";
        testConsole.print(expected);
        while (expected.length < columns) expected += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected);
    });

    it("should continue to print along the same line with multiple print calls", function() {
        var expected = "test message";
        testConsole.print(expected);
        var expected2 = "1234";
        testConsole.print(expected2);
        expected += expected2;
        while (expected.length < columns) expected += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected);
    });

    it("should place the passed string on the console over multiple lines if the string is too long", function() {
        var expected = "a very, very long test message that exceeds the width of the console";
        testConsole.print(expected);
        var expected1 = expected.substr(0, columns);
        var expected2 = expected.substr(columns, columns);
        var expected3 = expected.substr(columns * 2, columns);
        var expected4 = expected.substr(columns * 3);
        while (expected4.length < columns) expected4 += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected1);
        expect(consoleNode.childNodes[2].data).toBe(expected2);
        expect(consoleNode.childNodes[4].data).toBe(expected3);
        expect(consoleNode.childNodes[6].data).toBe(expected4);
    });

    it("should scroll the console if the required lines pass the bottom of the console", function() {
        var expected = "a very, very long test message that exceeds the width of the console";
        testConsole = new Console("testConsole", 3, columns);
        testConsole.print(expected);
        var expected2 = expected.substr(columns, columns);
        var expected3 = expected.substr(columns * 2, columns);
        var expected4 = expected.substr(columns * 3);
        while (expected4.length < columns) expected4 += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected2);
        expect(consoleNode.childNodes[2].data).toBe(expected3);
        expect(consoleNode.childNodes[4].data).toBe(expected4);
    });
});

describe("Console method println", function() {
    var columns;
    var testConsole;

    beforeEach(function() {
        var consoleNode = document.createElement("div");
        consoleNode.setAttribute("localName", "testConsole");
        consoleNode.setAttribute("id", "testConsole");
        document.body.appendChild(consoleNode);
        columns = 20;
        testConsole = new Console("testConsole", 20, columns);
    });

    afterEach(function() {
        var consoleNode = document.getElementById("testConsole");
        if (consoleNode) {
            consoleNode.remove();
        }
    });

    it("should place the passed string on the console at the current position", function() {
        var initial = "Hello ";
        testConsole.print(initial);
        var expected = "test message";
        testConsole.println(expected);
        expected = initial + expected;
        while (expected.length < columns) expected += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected);
        expect(testConsole.cursorPosition.row).toBe(1);
        expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should move to the next line after each call", function() {
        var expected = "test message";
        testConsole.println(expected);
        var expected2 = "1234";
        testConsole.println(expected2);
        while (expected.length < columns) expected += ' ';
        while (expected2.length < columns) expected2 += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected);
        expect(consoleNode.childNodes[2].data).toBe(expected2);
        expect(testConsole.cursorPosition.row).toBe(2);
        expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should place the passed string on the console over multiple lines if the string is too long", function() {
        var expected = "a very, very long test message that exceeds the width of the console";
        testConsole.println(expected);
        var expected1 = expected.substr(0, columns);
        var expected2 = expected.substr(columns, columns);
        var expected3 = expected.substr(columns * 2, columns);
        var expected4 = expected.substr(columns * 3);
        while (expected4.length < columns) expected4 += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected1);
        expect(consoleNode.childNodes[2].data).toBe(expected2);
        expect(consoleNode.childNodes[4].data).toBe(expected3);
        expect(consoleNode.childNodes[6].data).toBe(expected4);
    });

    it("should scroll the console if the required lines pass the bottom of the console including an empty line at the end", function() {
        testConsole = new Console("testConsole", 3, columns);
        var expected = "a very, very long test message that exceeds the width of the console";
        testConsole.println(expected);
        var expected3 = expected.substr(columns * 2, columns);
        var expected4 = expected.substr(columns * 3);
        while (expected4.length < columns) expected4 += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected3);
        expect(consoleNode.childNodes[2].data).toBe(expected4);
    });
});

describe("Console method printc", function() {
    var columns;
    var testConsole;
    var consoleNode;

    beforeEach(function() {
        consoleNode = document.createElement("div");
        consoleNode.setAttribute("localName", "testConsole");
        consoleNode.setAttribute("id", "testConsole");
        document.body.appendChild(consoleNode);
        columns = 20;
        testConsole = new Console("testConsole", 20, columns);
    });

    afterEach(function() {
        consoleNode = document.getElementById("testConsole");
        if (consoleNode) {
            consoleNode.remove();
            consoleNode = null;
        }
    });

    it("should place the passed string on the console centred on the line starting at the current position", function() {
        var initial = "Hello ";
        testConsole.print(initial);
        var expected = "test message";
        testConsole.printc(expected);
        testConsole.printc(expected);
        var result1 = initial;
        var emptySpace = columns - initial.length - expected.length;
        var pad = int(emptySpace / 2);
        for (var i=0;i<pad;i++) result1 += ' ';
        result1 += expected;
        while (result1.length < columns) result1 += ' ';
        var result2 = "";
        emptySpace = columns - expected.length;
        pad = int(emptySpace / 2);
        for (i=0;i<pad;i++) result2 += ' ';
        result2 += expected;
        while (result2.length < columns) result2 += ' ';
        // var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(result1);
        expect(consoleNode.childNodes[2].data).toBe(result2);
        expect(testConsole.cursorPosition.row).toBe(2);
        expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should only centre on the last row of output if it wraps the text", function() {
        var message = "a long message that takes more than a line";
        testConsole.printc(message);
        var expected1 = message.substr(0, columns);
        var expected2 = message.substr(columns, columns);
        var expected3 = message.substr(columns * 2);
        var emptySpace = columns - expected3.length;
        var pad = int(emptySpace / 2);
        for (var i=0;i<pad;i++) expected3 = ' ' + expected3;
        while (expected3.length < columns) expected3 += ' ';
        expect(consoleNode.childNodes[0].data).toBe(expected1);
        expect(consoleNode.childNodes[2].data).toBe(expected2);
        expect(consoleNode.childNodes[4].data).toBe(expected3);
        expect(testConsole.cursorPosition.row).toBe(3);
        expect(testConsole.cursorPosition.column).toBe(0);
    });
});

describe("Console function setCursorPosition", function() {
    var columns;
    var testConsole;
    var consoleNode;

    beforeEach(function() {
        consoleNode = document.createElement("div");
        consoleNode.setAttribute("localName", "testConsole");
        consoleNode.setAttribute("id", "testConsole");
        document.body.appendChild(consoleNode);
        columns = 20;
        testConsole = new Console("testConsole", 20, columns);
    });

    afterEach(function() {
        consoleNode = document.getElementById("testConsole");
        if (consoleNode) {
            consoleNode.remove();
            consoleNode = null;
        }
    });

    it('should move the console cursor to the specified position', function () {
        testConsole.setCursorPos(10, 8);
        expect(testConsole.cursorPosition.row).toBe(10);
        expect(testConsole.cursorPosition.column).toBe(8);
    });

    it('should not move the console cursor if the specified position is outside the limits of the console', function() {
        testConsole.setCursorPos(-10, 8);
        expect(testConsole.cursorPosition.row).toBe(0);
        expect(testConsole.cursorPosition.column).toBe(0);
    });
});