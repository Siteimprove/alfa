import { None } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { h, Comment, Node } from "../dist";

const targets = [<span />, h.text("hello"), Comment.of("world")];
const shadow = h.shadow(targets);
const div = <div>{shadow}</div>;

// Start with no flag.
// For each of the three flags, duplicate existing list and add the flag to one side.
// This ends up giving the eight possible options.
const flags = [
  Node.Traversal.composed,
  Node.Traversal.flattened,
  Node.Traversal.nested,
].reduce(
  (old, cur) => old.flatMap((flag) => [flag, flag.add(cur)]),
  [Node.Traversal.of(Node.Traversal.none)],
);

test(".parent() of a shadow host returns None in composed traversal, the shadow root otherwise", (t) => {
  for (const traversal of flags) {
    if (traversal.has(Node.Traversal.composed)) {
      t.deepEqual(shadow.parent(traversal).getUnsafe(), div);
    } else {
      t.deepEqual(shadow.parent(traversal), None);
    }
  }
});

test(".parent() of the children of a shadow root returns the shadow host in flat traversal, the shadow root otherwise", (t) => {
  for (const target of targets) {
    for (const traversal of flags) {
      if (traversal.has(Node.Traversal.flattened)) {
        t.deepEqual(target.parent(traversal).getUnsafe(), div);
      } else {
        t.deepEqual(target.parent(traversal).getUnsafe(), shadow);
      }
    }
  }
});

test(".parent() of a slottable child of a shadow host returns the slot's parent in flat traversal, the light parent otherwise", (t) => {
  const target = <span slot="foo" />;
  const shadowDiv = (
    <div>
      <slot name="foo"></slot>
    </div>
  );
  const shadow = h.shadow([shadowDiv]);
  const lightDiv = (
    <div>
      {shadow}
      {target}
    </div>
  );

  for (const traversal of flags) {
    if (traversal.has(Node.Traversal.flattened)) {
      t.deepEqual(target.parent(traversal).getUnsafe(), shadowDiv);
    } else {
      t.deepEqual(target.parent(traversal).getUnsafe(), lightDiv);
    }
  }
});
