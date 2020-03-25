import { jsx } from "@siteimprove/alfa-dom/jsx";
import {Assertions, test} from "@siteimprove/alfa-test";
import { formingTable, Element, Table} from "../../src";
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

import {BuildingRowGroup, Cell, Row} from "../../src/tables/groups";

const cleanElement = (element: Element) =>
  element
    .attribute("id")
    .map(attribute => attribute.value)
    .getOr("N/A");

const cleanCell = (cell: Cell) => (
  {...cell,
    _element: cleanElement(cell.element)
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
  t.deepEqual(Row.of(simpleRow.element).toJSON(), simpleRow.expected.toJSON());

  t.deepEqual(Row.of(complexRow.element).toJSON(), (complexRow.expected).toJSON());
});

test("Process row groups", t => {
  t.deepEqual(BuildingRowGroup.of(rowGroup.element).toJSON(), rowGroup.expected.toJSON());

  t.deepEqual(BuildingRowGroup.of(downwardGrowing.element).toJSON(), downwardGrowing.expected.toJSON());
});

test("Process table", t => {
  const actual = formingTable(smithonian.element);
  // console.dir(cleanTable(actual), {depth: 4});
  equalTables(t, actual, smithonian.expected);

  equalTables(t, formingTable(apple.element), apple.expected);

  equalTables(t, formingTable(expenses.element), expenses.expected);

  equalTables(t, formingTable(expensesNum.element), expensesNum.expected);
});

// test("Table model errors", t => {
//   // formingTable(errors.emptyCol);
//   // formingTable(errors.emptyRow);
//   formingTable(errors.coveredTwice);
// });
