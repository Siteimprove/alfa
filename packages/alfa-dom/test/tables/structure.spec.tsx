import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {Slot, global, rowProcessing, processRowGroup, formingTable, Element} from "../../src";
import {apple, complexRow, expenses, expensesNum, makeSlot, rowGroup, simpleRow, smithonian} from "./testcases";
import element = simpleRow.element;

// JS array are row by row (first coord is row number). HTML table are col by col (x is col, y is row).
// table is transposed so that table[x][y] is indeed cell at position (x,y).
function makeSlotsArray(w: number, h: number): Array<Array<Slot>> {
  return new Array(w)
    .fill(0)
    .map((_, x) => new Array(h) // filling column n° x (JS line)
      .fill(0)
      .map((_, y) => makeSlot()) // filling cell n° x,y
  );
}

function initTable(w: number, h: number): void {
  global.yCurrent = 0;
  global.growingCellsList = [];

  global.theTable = { slots: makeSlotsArray(w, h), width: 0, height: 0, cells: [], rowGroups: [], colGroups: []};
}


const cleanElement = (element: Element) =>
  element
    .attribute("id")
    .map(attribute => attribute.value)
    .getOr("");


const cleanSlot = (slot: Slot) => (
  {...slot,
    elements: [slot
      .elements
      .map(cleanElement)]
  }
);


test("Process simple row", t => {
  initTable(2, 1);

  rowProcessing(simpleRow.element);
  t.deepEqual(global.theTable, simpleRow.expected);
});

test("Process complex row", t => {
  initTable(6, 2);

  rowProcessing(complexRow.element);
  t.deepEqual(global.theTable, complexRow.expected);
});

test("Process row group", t => {
  initTable(6, 2);

  processRowGroup(rowGroup.element);
  t.deepEqual(global.theTable, rowGroup.expected);
});

test("Process table", t => {
  initTable(6, 5);

  formingTable(smithonian.element);
  t.deepEqual(global.theTable, smithonian.expected);



  initTable(4, 5);

  formingTable(apple.element);
  t.deepEqual(global.theTable, apple.expected);


  initTable(4, 5);

  formingTable(expenses.element);
  t.deepEqual(global.theTable, expenses.expected);



  initTable(4, 5);

  formingTable(expensesNum.element);
  t.deepEqual(global.theTable, expensesNum.expected);
});
