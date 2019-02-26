import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getAssignedNodes } from "../src/get-assigned-nodes";

const slotInShadow = <slot name="foo" />;
const slotInDiv = <slot name="bar" />;
const element = <span slot="foo">Hello world</span>;
const shadow = <shadow>{slotInShadow}</shadow>;
const div = <div>{slotInDiv}</div>;
const context = (
  <div>
    {element}
    {shadow}
    {div}
  </div>
);
const contextNoSpan = (
  <div>
    {shadow}
    {div}
  </div>
);

test("Gets the assigned nodes of a slot", t => {
  t.deepEqual(getAssignedNodes(slotInShadow, context), [element]);
});

test("Gets an empty array when element is not slot", t => {
  t.deepEqual(getAssignedNodes(element, context), []);
});

test("Gets an empty array when root node is not a shadow node", t => {
  t.deepEqual(getAssignedNodes(slotInDiv, context), []);
});

test("Gets the assigned nodes of a slot with flattened traversal", t => {
  t.deepEqual(getAssignedNodes(slotInShadow, context, { flattened: true }), [
    element
  ]);
});

test("Gets an empty array when root node is not a shadow node with flattened traversal", t => {
  t.deepEqual(getAssignedNodes(slotInDiv, context, { flattened: true }), []);
});

test("Gets an empty array when there are no slotables with flattened traversal", t => {
  t.deepEqual(
    getAssignedNodes(slotInShadow, contextNoSpan, { flattened: true }),
    []
  );
});

test("Gets the assigned nodes of a slot with child when there are no slotables with flattened traversal", t => {
  const button = <button />;
  const slotInShadow = <slot name="foo">{button}</slot>;
  const shadow = <shadow>{slotInShadow}</shadow>;
  const contextNoSpan = (
    <div>
      {shadow}
      {div}
    </div>
  );
  t.deepEqual(
    getAssignedNodes(slotInShadow, contextNoSpan, { flattened: true }),
    [button]
  );
});
