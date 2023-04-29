/**
 * @jest-environment jsdom
 */
import Console from "../../Console";
import {int} from "../../helper";

const padStringToColumns = (text, columns) => {
  let result = text;
  while (result.length < columns) {
    result += ' ';
  }
  return result;
}

const centreStringToColumns = (text, columns) => {
  const spare = columns - text.length;
  if (spare > 0) {
    let padLeft = "";
    while (padLeft.length < int(spare/2)) {
      padLeft += ' ';
    }
    padLeft += text;
    return padStringToColumns(padLeft, columns);
  }
  return text;
}
describe("Console", () => {
  describe("create console", () => {
    const elementName = "testConsole";
    beforeEach(function() {
      const consoleNode = document.createElement("div");
      consoleNode.setAttribute("localName", elementName);
      consoleNode.setAttribute("id", elementName);
      document.body.appendChild(consoleNode);
    });
    afterEach(function() {
      let consoleNode = document.getElementById(elementName);
      if (consoleNode) {
        consoleNode.remove();
      }
    });
    it('should attach to a named dom element', () => {
      const testConsole = new Console(elementName, 2, 1);
      expect(testConsole).not.toBeUndefined();
    });
    it('should throw an error if the named dom element does not exist', () => {
      const result = () => new Console("wrongElement", 1, 1);
      expect(result).toThrowError("No element with the ID wrongElement was found.")
    });
    it('should remove all pre-existing child nodes from the named dom element', () => {
      let dummy = document.createElement('span');
      dummy.setAttribute("id", "dummyTestElement");
      document.getElementById(elementName).appendChild(dummy);
      new Console(elementName, 1, 1);
      dummy = document.getElementById("dummyTestElement");
      const real = document.getElementById(elementName);
      expect(dummy).toBeNull();
      expect(real.childNodes.length).toBe(1);
    });
    const buildRow = (columns) => {
      let emptyRow = '';
      for (let i= 0; i < columns; i++) emptyRow += ' ';
      return emptyRow;
    }
    it.each([
        [30, 40],
        [20, 10],
        [1,1],
    ])('should create a grid array of character cells', (rows, columns) => {
      const testConsole = new Console(elementName, rows, columns);
      // let emptyRow = '';
      // for (let i= 0; i < columns; i++) emptyRow += ' ';
      const consoleNode = document.getElementById(elementName);
      const nodeChildren = consoleNode.childNodes;
      expect(testConsole.columns).toBe(columns);
      expect(testConsole.rows).toBe(rows);
      // expected result is 1 if rows is 1 else it is (rows + (rows - 1))
      expect(nodeChildren.length).toBe(rows + (rows - 1));
      expect(nodeChildren[0].data).toBe(buildRow(columns));
    });
    it('should place the active cursor in the 0,0 position', function() {
      const testConsole = new Console(elementName, 30, 40);
      expect(testConsole.cursorPosition.column).toBe(0);
      expect(testConsole.cursorPosition.row).toBe(0);
    });
  });
  describe("print", () => {
    const elementName = "printConsole";
    let columns;
    let rows;
    let testConsole;

    beforeEach(() => {
      const consoleNode = document.createElement("div");
      consoleNode.setAttribute("localName", elementName);
      consoleNode.setAttribute("id", elementName);
      document.body.appendChild(consoleNode);
      columns = 20;
      rows = 20;
      testConsole = new Console(elementName, rows, columns);
    });

    afterEach(() => {
      const consoleNode = document.getElementById(elementName);
      if (consoleNode) {
        consoleNode.remove();
      }
    });

    it.each([
        [1,4,"message","    message         "],
        [0,0,"origin","origin              "],
    ])("should print the passed string at the current position", (row, column, message, expected) => {
      testConsole.setCursorPos(row, column);
      testConsole.print(message);
      const consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[row * 2].data).toBe(expected);
    });

    it("should continue to print along the same line with multiple print calls", () => {
      let expected = "test message";
      testConsole.print(expected);
      const expected2 = "1234";
      testConsole.print(expected2);
      expected += expected2;
      while (expected.length < columns) expected += ' ';
      var consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(expected);
    });

    it("should place the passed string on the console over multiple lines if the string is too long", () => {
      const expected = "a very, very long test message that exceeds the width of the console";
      testConsole.print(expected);
      const expected1 = expected.substring(0, columns);
      const expected2 = expected.substring(columns, columns * 2);
      const expected3 = expected.substring(columns * 2, columns * 3);
      const expected4 = padStringToColumns(expected.substring(columns * 3), 20);
      const consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(expected1);
      expect(consoleNode.childNodes[2].data).toBe(expected2);
      expect(consoleNode.childNodes[4].data).toBe(expected3);
      expect(consoleNode.childNodes[6].data).toBe(expected4);
    });

    it("should scroll the console if the required lines pass the bottom of the console", () => {
      const expected = "a very, very long test message that exceeds the width of the console";
      const shortConsole = new Console(elementName, 3, columns);
      shortConsole.print(expected);
      const expected2 = expected.substring(columns, columns * 2);
      const expected3 = expected.substring(columns * 2, columns * 3);
      const expected4 = padStringToColumns(expected.substring(columns * 3), 20);
      const consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(expected2);
      expect(consoleNode.childNodes[2].data).toBe(expected3);
      expect(consoleNode.childNodes[4].data).toBe(expected4);
    });
  });

  describe("println", () => {
    const elementName = "printlnConsole";
    let columns;
    let testConsole;

    beforeEach(() => {
      const consoleNode = document.createElement("div");
      consoleNode.setAttribute("localName", elementName);
      consoleNode.setAttribute("id", elementName);
      document.body.appendChild(consoleNode);
      columns = 20;
      testConsole = new Console(elementName, 20, columns);
    });

    afterEach(() => {
      const consoleNode = document.getElementById(elementName);
      if (consoleNode) {
        consoleNode.remove();
      }
    });

    it("should place the passed string on the console at the current position", () => {
      const initial = "Hello ";
      testConsole.print(initial);
      const expected = "test message";
      testConsole.println(expected);
      const result = padStringToColumns(initial + expected, 20);
      var consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(result);
      expect(testConsole.cursorPosition.row).toBe(1);
      expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should move to the next line after each call", () => {
      const expected = "test message";
      testConsole.println(expected);
      const expected2 = "1234";
      testConsole.println(expected2);
      const consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(padStringToColumns(expected,20));
      expect(consoleNode.childNodes[2].data).toBe(padStringToColumns(expected2,20));
      expect(testConsole.cursorPosition.row).toBe(2);
      expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should place the passed string on the console over multiple lines if the string is too long", () => {
      const expected = "a very, very long test message that exceeds the width of the console";
      testConsole.println(expected);
      const expected1 = expected.substring(0, columns);
      const expected2 = expected.substring(columns, columns * 2);
      const expected3 = expected.substring(columns * 2, columns * 3);
      const expected4 = padStringToColumns(expected.substring(columns * 3),20);
      const consoleNode= document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(expected1);
      expect(consoleNode.childNodes[2].data).toBe(expected2);
      expect(consoleNode.childNodes[4].data).toBe(expected3);
      expect(consoleNode.childNodes[6].data).toBe(expected4);
    });

    it("should scroll the console if the required lines pass the bottom of the console including an empty line at the end", () => {
      const shortConsole = new Console(elementName, 3, columns);
      const expected = "a very, very long test message that exceeds the width of the console";
      shortConsole.println(expected);
      const expected3 = expected.substring(columns * 2, columns * 3);
      const expected4 = padStringToColumns(expected.substring(columns * 3), columns);
      const consoleNode = document.getElementById(elementName);
      expect(consoleNode.childNodes[0].data).toBe(expected3);
      expect(consoleNode.childNodes[2].data).toBe(expected4);
    });
  });

  describe("printc", () => {
    const elementName = "printcConsole";
    let columns;
    let testConsole;
    let consoleNode;

    beforeEach(function() {
      consoleNode = document.createElement("div");
      consoleNode.setAttribute("localName", elementName);
      consoleNode.setAttribute("id", elementName);
      document.body.appendChild(consoleNode);
      columns = 20;
      testConsole = new Console(elementName, 20, columns);
    });

    afterEach(function() {
      consoleNode = document.getElementById(elementName);
      if (consoleNode) {
        consoleNode.remove();
        consoleNode = null;
      }
    });

    it("should place the passed string on the console centred on the line starting at the current position", function() {
      const initial = "Hello ";
      testConsole.print(initial);
      const expected = "test message";
      testConsole.printc(expected);
      testConsole.printc(expected);
      const result1 = initial + centreStringToColumns(expected, columns - initial.length);
      const result2 = centreStringToColumns(expected, columns);
      expect(consoleNode.childNodes[0].data).toBe(result1);
      expect(consoleNode.childNodes[2].data).toBe(result2);
      expect(testConsole.cursorPosition.row).toBe(2);
      expect(testConsole.cursorPosition.column).toBe(0);
    });

    it("should only centre on the last row of output if it wraps the text", () => {
      const message = "a long message that takes more than a line";
      testConsole.printc(message);
      const expected1 = message.substring(0, columns);
      const expected2 = message.substring(columns, columns * 2);
      const expected3 = centreStringToColumns(message.substring(columns * 2), columns);
      expect(consoleNode.childNodes[0].data).toBe(expected1);
      expect(consoleNode.childNodes[2].data).toBe(expected2);
      expect(consoleNode.childNodes[4].data).toBe(expected3);
      expect(testConsole.cursorPosition.row).toBe(3);
      expect(testConsole.cursorPosition.column).toBe(0);
    });
  });

  describe("setCursorPosition", () => {
    const elementName = "positionConsole";
    let columns;
    let testConsole;
    let consoleNode;

    beforeEach(() => {
      consoleNode = document.createElement("div");
      consoleNode.setAttribute("localName", elementName);
      consoleNode.setAttribute("id", elementName);
      document.body.appendChild(consoleNode);
      columns = 20;
      testConsole = new Console(elementName, 20, columns);
    });

    afterEach(() => {
      consoleNode = document.getElementById(elementName);
      if (consoleNode) {
        consoleNode.remove();
        consoleNode = null;
      }
    });

    it('should move the console cursor to the specified position', () => {
      testConsole.setCursorPos(10, 8);
      expect(testConsole.cursorPosition.row).toBe(10);
      expect(testConsole.cursorPosition.column).toBe(8);
    });

    it('should move the console cursor if the specified position is outside the limits of the console', () => {
      testConsole.setCursorPos(8, -10);
      expect(testConsole.cursorPosition.row).toBe(8);
      expect(testConsole.cursorPosition.column).toBe(-10);
    });
  });
});