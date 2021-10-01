import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R77, { Outcomes } from "../../src/sia-r77/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test("evaluate() passes a <table> element where its data cells are assigned to one header cell", async (t) => {
  const target1 = <td>8-17</td>;
  const target2 = <td>10-14</td>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        <th>Mon-Fri</th>
        {target1}
      </tr>
      <tr>
        <th>Sat-Sun</th>
        {target2}
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R77, { document }), [
    passed(R77, target1, {
      1: Outcomes.IsAssignedToHeaderCell,
    }),
    passed(R77, target2, {
      1: Outcomes.IsAssignedToHeaderCell,
    }),
  ]);
});

test("evaluate() fails a <table> element where one data cell is not assigned to an header cell", async (t) => {
  const target1 = <td>8-17</td>;
  const target2 = <td>10-14</td>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        <th>Mon-Fri</th>
      </tr>
      <tr>
        {target1}
        {target2}
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R77, { document }), [
    passed(R77, target1, {
      1: Outcomes.IsAssignedToHeaderCell,
    }),
    failed(R77, target2, {
      1: Outcomes.IsNotAssignedToHeaderCell,
    }),
  ]);
});

test(`evaluate() is inapplicable to <table> not visible nor included in the accessibility tree`, async (t) => {
  const document = h.document([
    <table hidden>
      <caption>Opening hours</caption>
      <tr>
        <th>Mon-Fri</th>
        <th>Sat-Sun</th>
      </tr>
      <tr>
        <td>8-17</td>
        <td>10-14</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R77, { document }), [inapplicable(R77)]);
});

test(`evaluate() is inapplicable to <table> element which doesn't have an header cell`, async (t) => {
  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        <td>8-12</td>
        <td>13-17</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R77, { document }), [inapplicable(R77)]);
});
