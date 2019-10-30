import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Some } from "@siteimprove/alfa-option";
import { getAssignedSlot } from "../src/get-assigned-slot";

test("getAssignedSlot() gets the assigned slot of an element", t => {
  const slot = <slot name="foo" />;
  const element = <span slot="foo">Hello world</span>;

  const context = (
    <div>
      {element}
      <shadow>{slot}</shadow>
    </div>
  );

  t.deepEqual(getAssignedSlot(element, context), Some.of(slot));
});
