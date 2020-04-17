import { Element } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";
import { ColumnGroup } from "../src/column-group";

const dummy = Element.of(None, None, "foo");

function columnGroup(x: number, w: number): ColumnGroup {
  return ColumnGroup.of(x, w, dummy);
}

test("#isCovering() ̤correctly computes group coverage", (t) => {
  // in small groups
  t.equal(columnGroup(2, 1).isCovering(2), true);

  // out of small groups (left, right)
  t.equal(columnGroup(2, 1).isCovering(1), false);
  t.equal(columnGroup(2, 1).isCovering(4), false);

  // in/out big groups, just at the limit
  t.equal(columnGroup(2, 4).isCovering(5), true);
  t.equal(columnGroup(2, 4).isCovering(6), false);
});
