import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAssignedNodes } from "../src/get-assigned-nodes";

test("Gets the assigned nodes of a slot", t => {
  const slot = <slot name="foo" />;
  const element = <span slot="foo">Hello world</span>;

  const context = (
    <div>
      {element}
      <shadow>{slot}</shadow>
    </div>
  );

  t.deepEqual(getAssignedNodes(slot, context), [element]);
});
