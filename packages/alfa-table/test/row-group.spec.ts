import { Element } from "@siteimprove/alfa-dom";
import { None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { RowGroup } from "../src/row-group";
import { downwardGrowing, simpleRowGroup } from "./testcases";

const dummy = Element.of(None, None, "foo");

function rowGroup(y: number, h: number): RowGroup {
  return RowGroup.of(y, h, dummy);
}

test("#isCovering() ̤correctly computes group coverage", (t) => {
  // in small groups
  t.equal(rowGroup(6, 1).isCovering(6), true);

  // out of small groups (above, below)
  t.equal(rowGroup(6, 1).isCovering(4), false);
  t.equal(rowGroup(6, 1).isCovering(9), false);

  // in/out big groups, just at the limit
  t.equal(rowGroup(6, 2).isCovering(7), true);
  t.equal(rowGroup(6, 2).isCovering(8), false);
});

test("Builder.from() processes row groups", (t) => {
  t.deepEqual(
    RowGroup.Builder.from(simpleRowGroup.element).get().toJSON(),
    simpleRowGroup.expected.toJSON()
  );

  t.deepEqual(
    RowGroup.Builder.from(downwardGrowing.element).get().toJSON(),
    downwardGrowing.expected.toJSON()
  );
});
