import { jsx } from "@siteimprove/alfa-dom/jsx";
import {Err} from "@siteimprove/alfa-result";
import {Assertions, test} from "@siteimprove/alfa-test";
import { formingTable, Element, TableBasic} from "../../src";
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

const cleanTable = (table: TableBasic) => (
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

function equalTables(t: Assertions, actual: TableBasic, expected: TableBasic){
  t.deepEqual({...actual, cells: [...actual.cells].sort(compareCell)}, {...expected, cells: [...expected.cells].sort(compareCell)})
}

test("Process individual rows", t => {
  t.deepEqual(Row.from(simpleRow.element).toJSON(), simpleRow.expected.toJSON());

  t.deepEqual(Row.from(complexRow.element).toJSON(), (complexRow.expected).toJSON());
});

test("Process row groups", t => {
  t.deepEqual(BuildingRowGroup.from(rowGroup.element).toJSON(), rowGroup.expected.toJSON());

  t.deepEqual(BuildingRowGroup.from(downwardGrowing.element).toJSON(), downwardGrowing.expected.toJSON());
});

test("Process table", t => {
  const actual = formingTable(smithonian.element);
  // console.dir(cleanTable(actual), {depth: 4});
  equalTables(t, actual.get(), smithonian.expected);

  equalTables(t, formingTable(apple.element).get(), apple.expected);

  equalTables(t, formingTable(expenses.element).get(), expenses.expected);

  equalTables(t, formingTable(expensesNum.element).get(), expensesNum.expected);
});

test("Table model errors", t => {
  t.deepEqual(formingTable(errors.emptyCol), Err.of("col 1 has no cell anchored in it"));
  t.deepEqual(formingTable(errors.emptyRow), Err.of("row 1 has no cell anchored in it"));
  t.deepEqual(formingTable(errors.coveredTwice), Err.of("Slot (1, 1) is covered twice"));
});
