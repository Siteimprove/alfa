import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document, Element } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";

import R46, { Outcomes } from "../../src/sia-r46/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

const { and } = Predicate;
const { isElement, hasName } = Element;

test("evaluate() passes on explicit header", async (t) => {
  const document = Document.of([
    <table>
      <tr>
        <th>Time</th>
      </tr>
      <tr>
        <td>05:41</td>
      </tr>
    </table>,
  ]);

  const target = document
    .descendants()
    .find(and(isElement, hasName("th")))
    .get();

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, target, {
      1: Outcomes.IsAssignedToDataCell,
    }),
  ]);
});

test("evaluate() passes on implicit headers", async (t) => {
  const document = Document.of([
    <table>
      <tr>
        <th id="col1">Column 1</th>
        <th id="col2">Column 2</th>
      </tr>
      <tr>
        <td></td>
      </tr>
      <tr>
        <td headers="col2"></td>
      </tr>
    </table>,
  ]);

  const [col1, col2] = document
    .descendants()
    .filter(and(isElement, hasName("th")));

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, col1, {
      1: Outcomes.IsAssignedToDataCell,
    }),
    passed(R46, col2, {
      1: Outcomes.IsAssignedToDataCell,
    }),
  ]);
});

test("evaluate() fails on headers with no data cell", async (t) => {
  const document = Document.of([
    <table>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
      <tr>
        <td />
        <td headers="col1" />
      </tr>
    </table>,
  ]);

  const [col1, col2] = document
    .descendants()
    .filter(and(Element.isElement, hasName("th")));

  t.deepEqual(await evaluate(R46, { document }), [
    passed(R46, col1, {
      1: Outcomes.IsAssignedToDataCell,
    }),
    failed(R46, col2, {
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
