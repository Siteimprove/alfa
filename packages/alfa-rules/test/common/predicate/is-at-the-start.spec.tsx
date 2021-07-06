import { h } from "@siteimprove/alfa-dom/h";
import { test } from "@siteimprove/alfa-test";

import { None, Option } from "@siteimprove/alfa-option";

import { lowestCommonAncestor } from "../../../src/common/expectation/content-between";
import { isAtTheStart } from "../../../src/common/predicate";

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

test("isAtTheStart() returns true on an element itself", (t) => {
  const target = <div />;

  t.deepEqual(isAtTheStart(target)(target), true);
});

test("isAtTheStart() returns true on perceivable descendants of non-perceivable elements", (t) => {
  const target = <span>Hello</span>;
  const container = (
    <div>
      <div>
        <div>{target}</div>
      </div>
    </div>
  );

  t.deepEqual(isAtTheStart(container)(target), true);
});

test("isAtTheStart() returns true on perceivable successors of non-perceivable elements", (t) => {
  const target = <span>Hello</span>;
  const container = (
    <div>
      <div>
        <div />
      </div>
    </div>
  );

  h.document([container, <div>{target}</div>]);

  t.deepEqual(isAtTheStart(container)(target), true);
});

test("isAtTheStart() returns true on non-perceivable predecessors of elements", (t) => {
  const container = <span>Hello</span>;
  const target = (
    <div>
      <div>
        <div />
      </div>
    </div>
  );

  h.document([target, <div>{container}</div>]);

  t.deepEqual(isAtTheStart(container)(target), true);
});

test("isAtTheStart() returns false on perceivable predecessors of an element", (t) => {
  const target = <span>Hello</span>;
  const container = (
    <div>
      <div>
        <div />
      </div>
    </div>
  );

  h.document([<div>{target}</div>, container]);

  t.deepEqual(isAtTheStart(container)(target), false);
});

test("isAtTheStart() returns false on successors of an element with perceivable content", (t) => {
  const target = <span>Hello</span>;
  const container = (
    <div>
      <div>
        <div>Text</div>
      </div>
    </div>
  );

  h.document([container, <div>{target}</div>]);

  t.deepEqual(isAtTheStart(container)(target), false);
});

test("isAtTheStart() returns false when there is perceivable content between the two elements", (t) => {
  const target1 = <span>Hello</span>;
  const target2 = <span />;
  const div = <div />;

  h.document([
    target1,
    <span>text</span>,
    div,
    <span>more text</span>,
    target2,
  ]);

  t.deepEqual(isAtTheStart(div)(target1), false);
  t.deepEqual(isAtTheStart(div)(target2), false);
});
