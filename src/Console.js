/*
 A DOS-like output console for JavaScript.
 http://www.codeproject.com/script/Articles/MemberArticles.aspx?amid=3290305

 Example usage:
 var console = new Console('myConsoleDivId', 20, 40);
 console.println('A console window with 20 rows and 40 characters.');
 console.setCursorPosition(6,6);
 console.print('Printing in row 6, column 6');
*/

import {int} from './helper';

export default class Console {
  /// <summary>Creates a new Console in the HTML element with given ID, with the specified rows and columns, and optionally the URL to the PromptWindow if the input() function is used.</summary>
  constructor(elementId, rows, columns) {
    // Get a reference to the HTML element which will hold the console.
    this.element = document.getElementById(elementId);
    if (!this.element) {
      throw('No element with the ID ' + elementId + ' was found.');
      // alert('No element with the ID ' + elementId + ' was found.');
      // return;
    }
    // remove any child nodes of the element
    while (this.element.hasChildNodes()) {
      this.element.removeChild(this.element.childNodes[0]);
    }
    // make sure it acts like a 'pre'
    this.element.style.whiteSpace = 'pre';

    this.rows = Math.floor(rows);
    this.columns = Math.floor(columns);
    this.cursorPosition = {row: 0, column: 0};
    this.charGrid = new Array(this.rows);

    // create an empty string for each row
    let s = '';
    for (let col = 0; col < this.columns; col++) {
      s += ' ';
    }
    // add the TextNode objects
    for (let i = 0; i < rows; i++) {
      let textNode = document.createTextNode('');
      textNode.data = s;
      this.charGrid[i] = textNode;
      this.element.appendChild(textNode);
      if (i < rows - 1) {
        // add a line break between each TextNode
        this.element.appendChild(document.createElement('br'));
      }
    }
  }

  cls = () => {
/// <summary>Clears all the characters from the console and sets the cursor to 0,0.</summary>
    // go through each row
    for (let row = 0; row < this.rows; row++) {
      // get the text node, make a string with 'col' spaces, and set this row as the string
      const textNode = this.charGrid[row];
      let s = '';
      for (let col = 0; col < this.columns; col++) {
        s += ' ';
      }
      textNode.data = s;
    }
    // move cursor to 0,0
    this.setCursorPos(0, 0);
  };

  printAt = (row, column, str, cycle) => {
    /// <summary>Prints a string at the given row and column, and optionally wraps the text if needed.</summary>
    if (row >= this.rows || row < 0 || column < 0 || !str) {
      // nothing to print
      return;
    }
    // get the text in the target row
    const oldRow = this.charGrid[row].data;

    // tentatively put the new text for the row in newRow. This is probably too long or too short
    let newRow = oldRow.substring(0, column) + str;

    if (newRow.length < this.columns) {
      // the text was too short, so get the remaining characters from the old string.
      // E.g.: oldRow = "0123456789", printing "hi" over '4' so newRow = "0123hi", then appending "6789" to get "0123hi6789"
      newRow += oldRow.substring(column + str.length);
      // move the cursor to the character after the new string, e.g. just after "hi".
      this.setCursorPos(row, column + str.length);
    } else {
      // need to wrap to the next row.
      this.setCursorPos(row + 1, 0);
      if (cycle && this.cursorPosition.row >= this.rows) {
        // moved passed the bottom of the console.  Need to delete the first line, and move each line up by one.
        for (let rowIndex = 0; rowIndex < this.rows - 1; rowIndex++) {
          this.charGrid[rowIndex].data = this.charGrid[rowIndex +
          1].data;
        }
        // After moving up, there needs to be a new row at the bottom. Set to empty string.
        let emptyRow = '';
        for (let col = 0; col < this.columns; col++) {
          emptyRow += ' ';
        }
        this.charGrid[this.rows - 1].data = emptyRow;
        // Cycled the lines up, so the current row should cycle by one as well
        this.cursorPosition.row--;
        row--;
      }
    }

    // truncate the text if it is too long
    if (newRow.length > this.columns) {
      newRow = newRow.substring(0, this.columns);
    }
    // set the text to the current row.
    this.charGrid[row].data = newRow;
  };

  print = (str) => {
    /// <summary>Prints the given string at the current cursor position, wrapping text where necessary.</summary>
    // get new location of cursor after text added
    const newColumnPos = this.cursorPosition.column + str.length;
    if (newColumnPos > this.columns) {
      // text is too long to fit on one line.  Add as much as possible, then recursively call print with the remainder of the string
      const charsLeftOnCurLine = this.columns - this.cursorPosition.column;
      const s = str.substring(0, charsLeftOnCurLine);
      // print the first part
      this.print(s);
      // print rest of string
      this.print(str.substring(charsLeftOnCurLine));
    } else {
      // print the string at the current cursor position
      this.printAt(this.cursorPosition.row, this.cursorPosition.column,
          str, true);
    }
  };

  println = (str) => {
    /// <summary>Prints the given string at the current cursor position, wrapping text where necessary, and appends a line break.</summary>
    if (!str) {
      str = '';
    }
    // Actually, we don't add line-breaks. We simply pad out the line with spaces to that the cursor will be forced to the next line.
    const extraSpaces = this.columns -
        ((this.cursorPosition.column + str.length) % this.columns);
    let s2 = str;
    for (let i = 0; i < extraSpaces; i++) {
      s2 += ' ';
    }
    this.print(s2);
  };

  printc = (str) => {
    /// centres the text in the line if possible
    if (!str) this.println(str);
    let lineLength = str.length;
    while (lineLength + this.cursorPosition.column > this.columns) {
      let currentLine = str.substring(0,
          this.columns - this.cursorPosition.column);
      str = str.substring(this.columns - this.cursorPosition.column);
      this.print(currentLine);
      lineLength = str.length;
    }
    let extraSpaces = int(
        (this.columns - this.cursorPosition.column - lineLength) / 2,
    );
    let s2 = str;
    for (let i = 0; i < extraSpaces; i++) {
      s2 = ' ' + s2;
    }
    this.println(s2);
  };

  /***
   * Moves the print cursor to a new logical position - validation of row, column coordinates is performed by the print functions
   * @param targetRow
   * @param targetColumn
   */
  setCursorPos = (targetRow, targetColumn) => {
    /// <summary>Sets the cursor position to the given row and column.</summary>
    this.cursorPosition.row = targetRow;
    this.cursorPosition.column = targetColumn;
  };
}

// module.exports = Console;
