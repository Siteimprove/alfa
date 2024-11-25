import { Refinement } from "@siteimprove/alfa-refinement";
import { test } from "@siteimprove/alfa-test";

import { Element, Node, Query } from "../../../dist/index.js";

const { tee } = Refinement;
const { getDescendants, getElementDescendants } = Query;

test(".getElementDescendants() returns descendants non-inclusively", (t) => {
  const foo = <p>foo</p>;
  const bar = <div>{foo}</div>;

  t.deepEqual(getElementDescendants(bar).toArray(), [foo]);
});

test(".getDescendants caches calls made with the exact same node and predicate", (t) => {
  const target = (
    <p>
      <span aria-label="hello">Hello </span>
      <span>World!</span>
    </p>
  );

  let cacheMiss = 0;
  const predicate1 = tee(Element.isElement, () => cacheMiss++);
  const predicate2 = tee(Element.isElement, () => cacheMiss++);

  // We force the evaluation of the sequences via `.toArray()` to trigger the
  // correct number of tests of the predicate on cache miss.
  // Note that the query only checks the strict descendants, not the target itself.

  getDescendants(predicate1)(target).toArray(); // first call, miss
  t.deepEqual(cacheMiss, 4); // 2 elements plus their text child.
  getDescendants(predicate1)(target).toArray(); // second call, hit
  t.deepEqual(cacheMiss, 4);

  getDescendants(predicate2)(target).toArray(); // new predicate, miss
  t.deepEqual(cacheMiss, 8);
  getDescendants(predicate2)(target).toArray(); // second call, hit
  t.deepEqual(cacheMiss, 8);

  getDescendants(predicate1)(target, Node.fullTree).toArray(); // new traversal, miss
  t.deepEqual(cacheMiss, 12);
  getDescendants(predicate1)(target, Node.fullTree).toArray(); // second call, hit
  t.deepEqual(cacheMiss, 12);

  getDescendants(predicate1)(<p>foo</p>).toArray(); // new element, miss
  t.deepEqual(cacheMiss, 13); // text child.
});
