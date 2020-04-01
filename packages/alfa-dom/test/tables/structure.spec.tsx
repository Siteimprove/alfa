import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Err } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Table } from "../../src";
import {
  allWeirdImplicitHeaders,
  apple,
  colGroupImplicitHeaders,
  complexRow,
  downwardGrowing,
  errors,
  expenses,
  expensesNum,
  explicitHeaders,
  headersState,
  rowGroup,
  rowGroupImplicitHeaders,
  simpleImplicitHeaders,
  simpleRow,
  smithonian,
} from "./testcases";

import { Row, Cell, RowGroup } from "../../src/tables/groups";

test("Process individual rows", (t) => {
  t.deepEqual(
    Row.Builder.from(simpleRow.element).get().toJSON(),
    simpleRow.expected.toJSON()
  );

  t.deepEqual(
    Row.Builder.from(complexRow.element).get().toJSON(),
    complexRow.expected.toJSON()
  );
});

test("Process row groups", (t) => {
  t.deepEqual(
    RowGroup.Builder.from(rowGroup.element).get().toJSON(),
    rowGroup.expected.toJSON()
  );

  t.deepEqual(
    RowGroup.Builder.from(downwardGrowing.element).get().toJSON(),
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

test("Header scope and state", (t) => {
  const expensesTable = Table.Builder.from(expenses.element).get();
  t.deepEqual(
    [...expensesTable.cells]
      .filter((cell) => cell.kind === Cell.Kind.Header)
      .map((cell) => cell.headerState(expensesTable).get()),
    expenses.headerStates
  );

  const headersTable = Table.Builder.from(headersState.element).get();
  t.deepEqual(
    [...headersTable.cells]
      .filter((cell) => cell.kind === Cell.Kind.Header)
      .map((cell) => cell.headerState(headersTable)),
    headersState.headerStates
  );
});

test("Compute simple headers", (t) => {
  t.deepEqual(
    Table.from(explicitHeaders.element).get().toJSON(),
    explicitHeaders.expected.toJSON()
  );

  t.deepEqual(
    Table.from(simpleImplicitHeaders.element).get().toJSON(),
    simpleImplicitHeaders.expected.toJSON()
  );
});

test("Tables with groups headers", (t) => {
  t.deepEqual(
    Table.from(rowGroupImplicitHeaders.element).get().toJSON(),
    rowGroupImplicitHeaders.expected.toJSON()
  );

  t.deepEqual(
    Table.from(colGroupImplicitHeaders.element).get().toJSON(),
    colGroupImplicitHeaders.expected.toJSON()
  );

  t.deepEqual(
    Table.from(allWeirdImplicitHeaders.element).get().toJSON(),
    allWeirdImplicitHeaders.expected.toJSON()
  )
});
