import { h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R77, { Outcomes } from "../../src/sia-r76/rule";

import { evaluate } from "../common/evaluate";
import { passed, failed, inapplicable } from "../common/outcome";

test(`evaluate() passes implicit row headers`, async (t) => {
  const target1 = <th>Mon-Fri</th>;
  const target2 = <th>Sat-Sun</th>;

  const document = h.document([
    <table>
      <caption>Opening hours</caption>
      <tr>
        <th>Mon-Fri</th>
        <td>8-17</td>
      </tr>
      <tr>
        <th>Sat-Sun</th>
        <td>10-14</td>
      </tr>
    </table>,
  ]);

  t.deepEqual(await evaluate(R77, { document }), [
    passed(R77, target1, {
      1: Outcomes.HasHeaderRole,
    }),
    passed(R77, target2, {
      1: Outcomes.HasHeaderRole,
    }),
  ]);
});
