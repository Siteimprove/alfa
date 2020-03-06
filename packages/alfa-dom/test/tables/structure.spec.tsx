import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";
import {Slot, global, rowProcessing, processRowGroup, formingTable, Element, newTable} from "../../src";
import {apple, complexRow, expenses, expensesNum, makeSlot, rowGroup, simpleRow, smithonian} from "./testcases";
import element = simpleRow.element;

const cleanElement = (element: Element) =>
  element
    .attribute("id")
    .map(attribute => attribute.value)
    .getOr("");


const cleanSlot = (slot: Slot) => (
  {...slot,
    elements: slot
      .elements
      .map(cleanElement)
  }
);


test("Process simple row", t => {
  const table = newTable();

  rowProcessing(table, simpleRow.element, 0);
  t.deepEqual(table, simpleRow.expected);
});

test("Process complex row", t => {
  const table = newTable();

  rowProcessing(table, complexRow.element, 0);
  t.deepEqual(table, complexRow.expected);
});

test("Process row group", t => {
  const table = newTable();

  processRowGroup(table, rowGroup.element);
  t.deepEqual(table, rowGroup.expected);
});

// test("Process table", t => {
//   t.deepEqual(formingTable(smithonian.element), smithonian.expected);
//
//   t.deepEqual(formingTable(apple.element), apple.expected);
//
//   t.deepEqual(formingTable(expenses.element), expenses.expected);
//
//   t.deepEqual(formingTable(expensesNum.element), expensesNum.expected);
// });
