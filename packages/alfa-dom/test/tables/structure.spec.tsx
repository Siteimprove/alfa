import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Err } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Table} from "../../src";
import {
  apple, colGroupImplicitHeaders,
  complexRow,
  downwardGrowing,
  errors,
  expenses,
  expensesNum, explicitHeaders, headersState,
  rowGroup, rowGroupImplicitHeaders, simpleImplicitHeaders,
  simpleRow,
  smithonian,
} from "./testcases";

import {Row, Cell, ColGroup, RowGroup, Header} from "../../src/tables/groups";

test("Process individual rows", (t) => {
  t.deepEqual(
    Row.Building.from(simpleRow.element).get().toJSON(),
    simpleRow.expected.toJSON()
  );

  t.deepEqual(
    Row.Building.from(complexRow.element).get().toJSON(),
    complexRow.expected.toJSON()
  );
});

test("Process row groups", (t) => {
  t.deepEqual(
    RowGroup.Building.from(rowGroup.element).get().toJSON(),
    rowGroup.expected.toJSON()
  );

  t.deepEqual(
    RowGroup.Building.from(downwardGrowing.element).get().toJSON(),
    downwardGrowing.expected.toJSON()
  );
});

test("Process table", (t) => {
  t.deepEqual(
    Table.from(smithonian.element).get().toJSON(),
    smithonian.expected.toJSON()
  );

  t.deepEqual(
    Table.from(apple.element).get().toJSON(),
    apple.expected.toJSON()
  );

  t.deepEqual(
    Table.from(expenses.element).get().toJSON(),
    expenses.expected.toJSON()
  );

  t.deepEqual(
    Table.from(expensesNum.element).get().toJSON(),
    expensesNum.expected.toJSON()
  );
});

test("Table model errors", (t) => {
  t.deepEqual(
    Table.from(errors.emptyCol),
    Err.of("col 1 has no cell anchored in it")
  );
  t.deepEqual(
    Table.from(errors.emptyRow),
    Err.of("row 1 has no cell anchored in it")
  );
  t.deepEqual(
    Table.from(errors.coveredTwice),
    Err.of("Slot (1, 1) is covered twice")
  );
});

test("Header scope and state", t => {
  const expensesTable = Table.Building.from(expenses.element).get();
  t.deepEqual(
    [...expensesTable.cells]
      .filter(cell => cell.kind === Cell.Kind.Header)
      .map(cell => cell.headerState(expensesTable).get()),
    expenses.headerStates
  );

  const headersTable = Table.Building.from(headersState.element).get();
  t.deepEqual(
    [...headersTable.cells]
      .filter(cell => cell.kind === Cell.Kind.Header)
      .map(cell => cell.headerState(headersTable)),
    headersState.headerStates
  );
});

// test("Compute explicit headers", t => {
//   const table = Table.Building.from(explicitHeaders.element).get();
//   const cell = ([...table.cells].find(cell => cell.name === "foo") as Cell.Building).assignHeaders(table);
//
//   console.dir(cell.explicitHeaders.map(elt => elt.attribute("id").get().value));
//
//   t.deepEqual(cell.explicitHeaders, explicitHeaders.expected);
// });

// test("Compute simple implicit headers", t => {
//   const table = Table.Building.from(simpleImplicitHeaders.element).get();
//   const cells = ["cell11", "cell12", "cell21", "cell22"]
//     .map(id => ([...table.cells].find(cell => cell.name === id) as Cell.Building).assignHeaders(table));
//
//   for (let i=0; i<4 ; i++) {
//     t.deepEqual(cells[i].implicitHeaders, simpleImplicitHeaders.expected[i]);
//   }
// });

test("Tables with groups headers", t => {
  t.deepEqual(Table.from(rowGroupImplicitHeaders.element).get().toJSON(), rowGroupImplicitHeaders.expected.toJSON());

  t.deepEqual(Table.from(colGroupImplicitHeaders.element).get().toJSON(), colGroupImplicitHeaders.expected.toJSON());
});
