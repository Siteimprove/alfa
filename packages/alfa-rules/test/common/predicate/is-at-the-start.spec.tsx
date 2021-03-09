import { test } from "@siteimprove/alfa-test";

import { Document } from "@siteimprove/alfa-dom";
import {
  isAtTheStart,
  lowestCommonAncestor,
} from "../../../src/common/predicate/is-at-the-start";
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

test("isAtTheStart() returns true on an element itself", (t) => {
  const target = <div></div>;

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
        <div></div>
      </div>
    </div>
  );
  const document = Document.of([container, <div>{target}</div>]);

  t.deepEqual(isAtTheStart(container)(target), true);
});

test("isAtTheStart() returns true on non-perceivable predecessors of elements", (t) => {
  const container = <span>Hello</span>;
  const target = (
    <div>
      <div>
        <div></div>
      </div>
    </div>
  );
  const document = Document.of([target, <div>{container}</div>]);

  t.deepEqual(isAtTheStart(container)(target), true);
});

test("isAtTheStart() returns false on perceivable predecessors of an element", (t) => {
  const target = <span>Hello</span>;
  const container = (
    <div>
      <div>
        <div></div>
      </div>
    </div>
  );
  const document = Document.of([<div>{target}</div>, container]);

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
  const document = Document.of([container, <div>{target}</div>]);

  t.deepEqual(isAtTheStart(container)(target), false);
});

test("isAtTheStart() returns false when there is perceivable content between the two elements", (t) => {
  const target1 = <span>Hello</span>;
  const target2 = <span></span>;
  const div = <div></div>;
  const document = Document.of([
    target1,
    <span>text</span>,
    div,
    <span>more text</span>,
    target2,
  ]);

  t.deepEqual(isAtTheStart(div)(target1), false);
  t.deepEqual(isAtTheStart(div)(target2), false);
});
