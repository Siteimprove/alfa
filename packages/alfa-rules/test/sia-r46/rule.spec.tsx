import { Device } from "@siteimprove/alfa-device";
import { Document, Element } from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import R46, { Outcomes } from "../../src/sia-r46/rule";
import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

const device = Device.standard();

test("evaluate() passes on explicit header", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <table>
        <tr>
          <th id="target">Time</th>
        </tr>
        <tr>
          <td>05:41</td>
        </tr>
      </table>
    ),
  ]);
  const target = document.resolveReferences("target").shift()!;

  t.deepEqual(await evaluate(R46, { device, document }), [
    passed(R46, target, { 1: Outcomes.IsAssignedToDataCell }),
  ]);
});

test("evaluate() passes on implicit headers", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
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
      </table>
    ),
  ]);
  const col1 = document.resolveReferences("col1").shift()!;
  const col2 = document.resolveReferences("col2").shift()!;

  t.deepEqual(await evaluate(R46, { device, document }), [
    passed(R46, col1, { 1: Outcomes.IsAssignedToDataCell }),
    passed(R46, col2, { 1: Outcomes.IsAssignedToDataCell }),
  ]);
});

test("evaluate() fails on headers with no data cell", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <table>
        <tr>
          <th id="col1">Column 1</th>
          <th id="col2">Column 2</th>
        </tr>
        <tr>
          <td />
          <td headers="col1" />
        </tr>
      </table>
    ),
  ]);
  const col1 = document.resolveReferences("col1").shift()!;
  const col2 = document.resolveReferences("col2").shift()!;

  t.deepEqual(await evaluate(R46, { device, document }), [
    passed(R46, col1, { 1: Outcomes.IsAssignedToDataCell }),
    failed(R46, col2, { 1: Outcomes.IsNotAssignedToDataCell }),
  ]);
});

test("evaluate() is inapplicable if there is no header cell", async (t) => {
  const document = Document.of((self) => [
    Element.fromElement(
      <table>
        <tr>
          <th role="cell">Column A</th>
        </tr>
        <tr>
          <td>Cell A</td>
        </tr>
      </table>
    ),
  ]);

  t.deepEqual(await evaluate(R46, { device, document }), [inapplicable(R46)]);
});
