/// <reference lib="dom" />
import { test } from "@siteimprove/alfa-test";

import { h, StyleRule } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Type } from "@siteimprove/alfa-selector";

import { RuleTree } from "../src";

function fakeRule(selector: string): StyleRule {
  return h.rule.style(selector, []);
}

test(".of() builds a node", (t) => {
  const node = RuleTree.Node.of(
    {
      rule: h.rule.style("div", { color: "red" }),
      selector: Type.of(None, "div"),
      declarations: [h.declaration("color", "red")],
    },
    [],
    None,
  );

  console.dir(node.toJSON(), { depth: null });
});
