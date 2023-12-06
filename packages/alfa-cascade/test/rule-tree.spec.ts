/// <reference lib="dom" />
import { h } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { Type } from "@siteimprove/alfa-selector";
import { test } from "@siteimprove/alfa-test";

import { RuleTree } from "../src";

test(".of() builds a node", (t) => {
  const node = RuleTree.Node.of(
    h.rule.style("div", { color: "red" }),
    Type.of(None, "div"),
    [],
    [],
    None,
  );

  console.dir(node.toJSON(), { depth: null });
});
