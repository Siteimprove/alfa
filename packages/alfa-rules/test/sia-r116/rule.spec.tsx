import { type Element, h } from "@siteimprove/alfa-dom";
import { test } from "@siteimprove/alfa-test";

import R116, { Outcomes } from "../../dist/sia-r116/rule.js";

import { evaluate } from "../common/evaluate.js";
import { failed, inapplicable, passed } from "../common/outcome.js";

test("evaluate() passes summary elements with an accessible name", async (t) => {
  const target = (<summary>Opening times</summary>) as Element<"summary">;

  const document = h.document([
    <details>
      {target}
      <p>This is a website. We are available 24/7.</p>
    </details>,
  ]);

  t.deepEqual(await evaluate(R116, { document }), [
    passed(R116, target, {
      1: Outcomes.HasAccessibleName,
    }),
  ]);
});

// test("evaluate() passes summary elements that are not the first children", async (t) => {
//   const target = (<summary>Opening times</summary>) as Element<"summary">;
//
//   const document = h.document([
//     <details>
//       <p>This is a website. We are available 24/7.</p>
//       {target}
//     </details>,
//   ]);
//
//   t.deepEqual(await evaluate(R116, { document }), [
//     passed(R116, target, {
//       1: Outcomes.HasAccessibleName,
//     }),
//   ]);
// });
