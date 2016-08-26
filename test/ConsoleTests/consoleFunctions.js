describe("Console method print", function() {
    beforeEach(function() {
        var consoleNode = document.createElement("div");
        consoleNode.setAttribute("localName", "testConsole");
        consoleNode.setAttribute("id", "testConsole");
        document.body.appendChild(consoleNode);
    });

    afterEach(function() {
        var consoleNode = document.getElementById("testConsole");
        if (consoleNode) {
            consoleNode.remove();
        }
    });

    it("should place the passed string on the console at the current position", function() {
        var columns = 20;
        var testConsole = new Console("testConsole", 20, columns);
        var expected = "test message";
        testConsole.print(expected);
        while (expected.length < columns) expected += ' ';
        var consoleNode = document.getElementById("testConsole");
        expect(consoleNode.childNodes[0].data).toBe(expected);
    });

    it("should place the passed string on the console over multiple lines if the string is too long", function() {
        var columns = 20;
        var testConsole = new Console("testConsole", 20, columns);
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
});