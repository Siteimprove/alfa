import { h } from "@siteimprove/alfa-dom/dist/h";
import { test } from "@siteimprove/alfa-test";

import { isAtTheStart } from "../../../dist/common/predicate/is-at-the-start";

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
