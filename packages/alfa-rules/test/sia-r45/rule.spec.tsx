import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import R45, { Outcomes } from "../../src/sia-r45/rule";

import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test(`evaluate() passes when tokens in headers list refer to cells in the same
      table`, async (t) => {
  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th id="header2">Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan={2} headers="header1 header2">
            15%
          </td>
        </tr>
      </tbody>
    </table>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("td")))
    .get()
    .attribute("headers")
    .get();

  t.deepEqual(await evaluate(R45, { document }), [
    passed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some tokens in headers list do not refer to cells in
      the same table`, async (t) => {
  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header1">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan={2} headers="header1 header2">
            15%
          </td>
        </tr>
      </tbody>
    </table>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("td")))
    .get()
    .attribute("headers")
    .get();

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersDoesNotReferToCellsInTable,
      2: Outcomes.HeadersDoesNotRefersToSelf,
    }),
  ]);
});

test(`evaluate() fails when some token in the headers list refer to the cell
      itself`, async (t) => {
  const document = Document.of([
    <table>
      <thead>
        <tr>
          <th id="header">Projects</th>
          <th>Exams</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td id="cell" colspan={2} headers="header cell">
            15%
          </td>
        </tr>
      </tbody>
    </table>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("td")))
    .get()
    .attribute("headers")
    .get();

  t.deepEqual(await evaluate(R45, { document }), [
    failed(R45, target, {
      1: Outcomes.HeadersRefersToCellInTable,
      2: Outcomes.HeadersRefersToSelf,
    }),
  ]);
});

test("evaluate() is inapplicable when there is no headers attribute", async (t) => {
  const document = Document.of([
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
