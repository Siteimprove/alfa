import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R45, { Outcomes } from "../../dist/sia-r45/rule.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test(`evaluate() passes when tokens in headers list refer to cells in the same
      table`, async (t) => {
  const target = h.attribute("headers", "header1 header2");

  const document = h.document([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th id="header2">Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>{h("td", [h.attribute("colspan", "2"), target], ["15%"])}</tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    passed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some tokens in headers list do not refer to cells in
      the same table`, async (t) => {
  const target = h.attribute("headers", "header1 header2");

  const document = h.document([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>{h("td", [h.attribute("colspan", "2"), target], ["15%"])}</tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersDoesNotReferToCellsInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some token in the headers list refer to the cell
      itself`, async (t) => {
  const target = h.attribute("headers", "header cell");

  const document = h.document([
    <table>
      <thead>
        <tr>
          <th id="header">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          {h(
            "td",
            [h.attribute("id", "cell"), h.attribute("colspan", "2"), target],
            ["15%"],
          )}
        </tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersRefersToSelf,
    }),
  ]);
});

test("evaluate() is inapplicable to a table without headers attributes", async (t) => {
  const document = h.document([
    <table>
      <thead>
        <tr>
          <th>Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan={2}>15%</td>
        </tr>
      </tbody>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [inapplicable(R45)]);
});

test("evaluate() is inapplicable to a table which is not included in the accessiblity tree", async (t) => {
  const document = h.document([
    <table aria-hidden="true">
      <td headers="foo">Bar</td>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [inapplicable(R45)]);
});

test("evaluate() is inapplicable to a table with a presentational role", async (t) => {
  const document = h.document([
    <table role="presentation">
      <td headers="foo">Bar</td>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [inapplicable(R45)]);
});

test("evaluate() is inapplicable to a table with a non-table role", async (t) => {
  const document = h.document([
    <table role="paragraph">
      <td headers="foo">Bar</td>
    </table>,
  ]);

  t.deepEqual(await evaluate(R45, { document }), [inapplicable(R45)]);
});
