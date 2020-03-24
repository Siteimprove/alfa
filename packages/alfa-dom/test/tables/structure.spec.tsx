import { jsx } from "@siteimprove/alfa-dom/jsx";
import {Assertions, test} from "@siteimprove/alfa-test";
import { processRowGroup, formingTable, Element, newTable, Table} from "../../src";
import {
  apple,
  complexRow,
  downwardGrowing,
  errors,
  expenses,
  expensesNum,
  rowGroup,
  simpleRow,
  smithonian
} from "./testcases";

import {Cell, Row} from "../../src/tables/groups";

const cleanElement = (element: Element) =>
  element
    .attribute("id")
    .map(attribute => attribute.value)
    .getOr("N/A");

const cleanCell = (cell: Cell) => (
  {...cell,
    element: cleanElement(cell.element)
  }
);

const cleanTable = (table: Table) => (
  { ...table,
    cells: [...table.cells.map(cleanCell)]
  }
);

const cellName = (cell: Cell) => cell.element.attribute("id").get();

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

test("Process individual rows", t => {
  t.deepEqual(Row.of(simpleRow.element), simpleRow.expected);
  t.deepEqual(Row.of(complexRow.element), complexRow.expected);
});

test("Process row group", t => {
  const table = newTable();

  const y = processRowGroup(table, rowGroup.element, 0);
  t.equal(y, 2);
  equalTables(t, table, rowGroup.expected);
});

test("Process downward growing cells", t => {
  const table = newTable();

  const y = processRowGroup(table, downwardGrowing.element, 0);
  t.equal(y, 3);
  equalTables(t, table, downwardGrowing.expected);
});

test("Process table", t => {
  equalTables(t, formingTable(smithonian.element), smithonian.expected);

  equalTables(t, formingTable(apple.element), apple.expected);

  equalTables(t, formingTable(expenses.element), expenses.expected);

  equalTables(t, formingTable(expensesNum.element), expensesNum.expected);
});

// test("Table model errors", t => {
//   // formingTable(errors.emptyCol);
//   // formingTable(errors.emptyRow);
//   formingTable(errors.coveredTwice);
// });
