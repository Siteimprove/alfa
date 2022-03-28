import { None, Option } from "@siteimprove/alfa-option";
import { test } from "@siteimprove/alfa-test";

import { h } from "../../../src/h";
import { lowestCommonAncestor } from "../../../src/node/traversal/lowest-common-ancestor";

test("lowestCommonAncestor() returns the parent of two siblings", (t) => {
  const node1 = <span>Hello</span>;
  const node2 = <span>World</span>;
  const ancestor = (
    <div>
      {node1} {node2}
    </div>
  );

  t.deepEqual(lowestCommonAncestor(node1, node2), Option.of(ancestor));
});

test("lowestCommonAncestor() returns the LCA of two nodes at different depths", (t) => {
  const node1 = <span>Hello</span>;
  const node2 = <span>World</span>;
  const ancestor = (
    <div>
      <div>
        <div>{node1}</div>
      </div>{" "}
      <div>{node2}</div>
    </div>
  );

  h.document([
    <div>
      <div>ancestor</div>
    </div>,
  ]);

  t.deepEqual(lowestCommonAncestor(node1, node2), Option.of(ancestor));
});

test("lowestCommonAncestor() returns one node when it is ancestor of the other", (t) => {
  const node1 = <span>Hello</span>;
  const ancestor = (
    <div>
      <div>
        <div>{node1}</div>
      </div>
    </div>
  );

  h.document([
    <div>
      <div>ancestor</div>
    </div>,
  ]);

  t.deepEqual(lowestCommonAncestor(node1, ancestor), Option.of(ancestor));
});

test("lowestCommonAncestor() returns None when nodes are in different trees", (t) => {
  const node1 = <span>Hello</span>;
  const node2 = <span>World</span>;

  h.document([<div>{node1}</div>]);
  h.document([<div>{node2}</div>]);

  t.deepEqual(lowestCommonAncestor(node1, node2), None);
});
