import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Err } from "@siteimprove/alfa-result";
import { test } from "@siteimprove/alfa-test";

import { Table } from "../../src";
import {
  apple,
  complexRow,
  downwardGrowing,
  errors,
  expenses,
  expensesNum,
  rowGroup,
  simpleRow,
  smithonian,
} from "./testcases";

import { BuildingRowGroup, BuildingRow } from "../../src/tables/groups";

test("Process individual rows", (t) => {
  t.deepEqual(
    BuildingRow.from(simpleRow.element).get().toJSON(),
    simpleRow.expected.toJSON()
  );

  t.deepEqual(
    BuildingRow.from(complexRow.element).get().toJSON(),
    complexRow.expected.toJSON()
  );
});

test("Process row groups", (t) => {
  t.deepEqual(
    BuildingRowGroup.from(rowGroup.element).get().toJSON(),
    rowGroup.expected.toJSON()
  );

  t.deepEqual(
    BuildingRowGroup.from(downwardGrowing.element).get().toJSON(),
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
