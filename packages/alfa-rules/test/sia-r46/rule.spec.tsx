import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";

import R46, { Outcomes } from "../../src/sia-r46/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes on explicit header", async (t) => {
  const target = <th>Time</th>;

  const document = Document.of([
    <table>
      <tr>{target}</tr>
      <tr>
        <td>05:41</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, target, {
      1: Outcomes.IsAssignedToDataCell,
    }),
  ]);
});

test("evaluate() passes on implicit headers", async (t) => {
  const target1 = <th id="col1">Column 1</th>;
  const target2 = <th id="col2">Column 2</th>;

  const document = Document.of([
    <table>
      <tr>
        {target1}
        {target2}
      </tr>
      <tr>
        <td></td>
      </tr>
      <tr>
        <td headers="col2"></td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, target1, {
      1: Outcomes.IsAssignedToDataCell,
    }),
    passed(R46, target2, {
      1: Outcomes.IsAssignedToDataCell,
    }),
  ]);
});

test("evaluate() fails on headers with no data cell", async (t) => {
  const target1 = <th>Column 1</th>;
  const target2 = <th>Column 2</th>;

  const document = Document.of([
    <table>
      <tr>
        {target1}
        {target2}
      </tr>
      <tr>
        <td />
        <td headers="col1" />
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, target1, {
      1: Outcomes.IsAssignedToDataCell,
    }),
    failed(R46, target2, {
      1: Outcomes.IsNotAssignedToDataCell,
    }),
  ]);
});

test("evaluate() is inapplicable if there is no header cell", async (t) => {
  const document = Document.of([
    <table>
      <tr>
        <th role="cell">Column A</th>
      </tr>
      <tr>
        <td>Cell A</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R46, { document }), [inapplicable(R46)]);
});

test("evaluate() is inapplicable if the table element is ignored", async (t) => {
  const document = Document.of([
    <table role="presentation">
      <tr>
        <th>Column A</th>
      </tr>
      <tr>
        <td>Cell A</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R46, { document }), [inapplicable(R46)]);
});
