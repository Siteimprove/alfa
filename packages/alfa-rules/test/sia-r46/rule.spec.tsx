import { Device } from "@siteimprove/alfa-device";
import {Document, Element, getDescendantWithId} from "@siteimprove/alfa-dom";
import { jsx } from "@siteimprove/alfa-dom/jsx";
import { Predicate } from "@siteimprove/alfa-predicate";
import { test } from "@siteimprove/alfa-test";
import { hasId } from "../../src/common/predicate/has-id";

const { and, equals } = Predicate;
const { isElement } = Element;

import R46, { Outcomes } from "../../src/sia-r46/rule";
import { evaluate } from "../common/evaluate";
import { failed, inapplicable, passed } from "../common/outcome";

const device = Device.standard();

test("Passes on explicit header", async (t) => {
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
  const target = getDescendantWithId(document, "target").get();

  t.deepEqual(await evaluate(R46, { device, document }), [
    passed(R46, target, [["1", Outcomes.IsAssignedToDataCell]]),
  ]);
});

test("Passes on implicit headers", async (t) => {
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
  const col1 = document
    .descendants()
    .find(and(isElement, hasId(equals("col1"))))
    .get();
  const col2 = document
    .descendants()
    .find(and(isElement, hasId(equals("col2"))))
    .get();
});
