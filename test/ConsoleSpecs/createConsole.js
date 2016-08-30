describe('Console constructor', function() {
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

    it('should attach to a named dom element', function() {
        var testConsole = new Console("testConsole", 2, 1);
        expect(testConsole).not.toBeUndefined();
    });

    it('should throw an error if the named dom element does not exist', function() {
        var result;
        var errorMessage;
        try {
            result = new Console("wrongConsole", 1, 1);
        } catch(err) {
            errorMessage = err;
        }
        expect(result).toBeUndefined();
        expect(errorMessage).toBe("No element with the ID wrongConsole was found.");
    });

    it('should remove all pre-existing child nodes from the named dom element', function () {
        var dummy = document.createElement('span');
        dummy.setAttribute("id", "dummyTestElement");
        document.getElementById("testConsole").appendChild(dummy);
        var testConsole = new Console("testConsole", 1, 1);
        dummy = document.getElementById("dummyTestElement");
        var real = document.getElementById("testConsole");
        expect(dummy).toBeNull();
        expect(real.childNodes.length).toBe(1);
    });

    it('should create a grid array of character cells', function() {
        var rows = 30;
        var columns = 40;
        var testConsole = new Console("testConsole", rows, columns);
        var emptyRow = '';
        for (var i=0;i<columns;i++) emptyRow += ' ';
        var consoleNode = document.getElementById("testConsole");
        var nodeChildren = consoleNode.childNodes;
        expect(testConsole.columns).toBe(columns);
        expect(testConsole.rows).toBe(rows);
        // expected result is 1 if rows is 1 else it is (rows + (rows - 1))
        expect(nodeChildren.length).toBe(rows + (rows - 1));
        expect(nodeChildren[0].data).toBe(emptyRow);
    });

    it('should place the active cursor in the 0,0 position', function() {
        var testConsole = new Console("testConsole", 30, 40);
        expect(testConsole.cursorPosition.column).toBe(0);
        expect(testConsole.cursorPosition.row).toBe(0);
    })
});
