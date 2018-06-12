import { test } from "@siteimprove/alfa-test";
import { jsx } from "@siteimprove/alfa-jsx";
import { getAssignedSlot } from "../src/get-assigned-slot";

test("Gets the assigned slot of an element", t => {
  const slot = <slot name="foo" />;
  const element = <span slot="foo">Hello world</span>;

  const context = (
    <div>
      {element}
      <shadow>{slot}</shadow>
    </div>
  );

  t.equal(getAssignedSlot(element, context), slot);
});
