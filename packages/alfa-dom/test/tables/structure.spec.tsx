import { jsx } from "@siteimprove/alfa-dom/jsx";
import {Assertions, test} from "@siteimprove/alfa-test";
import {rowProcessing, processRowGroup, formingTable, Element, newTable, Table, Cell} from "../../src";
import {apple, complexRow, expenses, expensesNum, rowGroup, simpleRow, smithonian} from "./testcases";

const cleanElement = (element: Element) =>
  element
    .attribute("id")
    .map(attribute => attribute.value)
    .getOr("");

const cleanCell = (cell: Cell) => (
  {...cell,
    element: cleanElement(cell.element)
  }
);

function compareCell(c1: Cell, c2: Cell): number {
  if (c1.anchor.y < c2.anchor.y) return -1;
  if (c1.anchor.y > c2.anchor.y) return 1;
  if (c1.anchor.x < c2.anchor.x) return -1;
  if (c1.anchor.x > c2.anchor.x) return 1;
  return 0;
}

function equalTables(t: Assertions, actual: Table, expected: Table){
  t.deepEqual({...actual, cells: [...actual.cells].sort(compareCell)}, {...expected, cells: [...expected.cells].sort(compareCell)})
}

test("Process simple row", t => {
  const table = newTable();

  rowProcessing(table, simpleRow.element, 0);
  equalTables(t, table, simpleRow.expected);
});

test("Process complex row", t => {
  const table = newTable();

  rowProcessing(table, complexRow.element, 0);
  equalTables(t, table, complexRow.expected);
});

test("Process row group", t => {
  const table = newTable();

  const y = processRowGroup(table, rowGroup.element, 0);
  t.equal(y, 2);
  equalTables(t, table, rowGroup.expected);
});

test("Process table", t => {
  equalTables(t, formingTable(smithonian.element), smithonian.expected);

  equalTables(t, formingTable(apple.element), apple.expected);

  equalTables(t, formingTable(expenses.element), expenses.expected);

  equalTables(t, formingTable(expensesNum.element), expensesNum.expected);
});
