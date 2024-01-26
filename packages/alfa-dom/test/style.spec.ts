import { test } from "@siteimprove/alfa-test";

import { h } from "../src";

test("Sheet.of assigns owner to descendants of condition rules", (t) => {
  const rule = h.rule.style("foo", { foo: "bar" });
  const sheet = h.sheet([
    h.rule.supports("foo", [h.rule.media("screen", [rule])]),
  ]);

  t.equal(rule.owner.getUnsafe(), sheet);
});
