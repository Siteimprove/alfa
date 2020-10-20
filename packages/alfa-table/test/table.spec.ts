import { test } from "@siteimprove/alfa-test";

import { Table } from "../src";
import {
  allWeirdImplicitHeaders,
  apple,
  colGroupImplicitHeaders,
  duplicateIDExplicitHeaders,
  errors,
  expenses,
  expensesNum,
  explicitHeaders,
  headersVariant,
  rowGroupImplicitHeaders,
  simpleImplicitHeaders,
  smithonian,
} from "./testcases";

import { Cell } from "../src/cell";

test("Builder.from() computes correct header variants", (t) => {
  const expensesTable = Table.Builder.from(expenses.element).get();
  t.deepEqual(
    [...expensesTable.cells]
      .filter((cell) => cell.kind === Cell.Kind.Header)
      .map((cell) => cell.variant.get()),
    expenses.headerVariants
  );

  const headersTable = Table.Builder.from(headersVariant.element).get();
  t.deepEqual(
    [...headersTable.cells]
      .filter((cell) => cell.kind === Cell.Kind.Header)
      .map((cell) => cell.variant),
    headersVariant.headerVariants
  );
});

test("from() builds correct table model", (t) => {
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

test("from() detects table model errors", (t) => {
  t.deepEqual(
    [...Table.from(errors.emptyCol).get().errors],
    [
      {
        error: Table.Error.TableModelError.EmptyColumn,
        x: 1,
      },
    ]
  );
  t.deepEqual(
    [...Table.from(errors.emptyRow).get().errors],
    [
      {
        error: Table.Error.TableModelError.EmptyRow,
        y: 1,
      },
    ]
  );
  t.deepEqual(
    [...Table.from(errors.coveredTwice).get().errors],
    [
      {
        error: Table.Error.TableModelError.CollidingCells,
        x: 1,
        y: 1,
      },
    ]
  );
});

test("from() computes header association of simple headers (no groups)", (t) => {
  t.deepEqual(
    Table.from(explicitHeaders.element).get().toJSON(),
    explicitHeaders.expected.toJSON()
  );

  t.deepEqual(
    Table.from(simpleImplicitHeaders.element).get().toJSON(),
    simpleImplicitHeaders.expected.toJSON()
  );

  t.deepEqual(
    Table.from(duplicateIDExplicitHeaders.table).get().toJSON(),
    duplicateIDExplicitHeaders.expected.toJSON()
  );
});

test("from() computes header association of tables with groups headers", (t) => {
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
  );
});
