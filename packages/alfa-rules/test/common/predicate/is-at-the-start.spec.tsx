import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import { lowestCommonAncestor } from "../../../src/common/predicate/is-at-the-start";
import { None, Option } from "@siteimprove/alfa-option";

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

  const document = Document.of([
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

  const document = Document.of([
    <div>
      <div>ancestor</div>
    </div>,
  ]);

  t.deepEqual(lowestCommonAncestor(node1, ancestor), Option.of(ancestor));
});

test("lowestCommonAncestor() returns None when nodes are in different trees", (t) => {
  const node1 = <span>Hello</span>;
  const node2 = <span>World</span>;

  const document1 = Document.of(<div>{node1}</div>);
  const document2 = Document.of(<div>{node2}</div>);

  t.deepEqual(lowestCommonAncestor(node1, node2), None);
});
