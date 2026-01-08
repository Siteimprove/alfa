import { Refinement } from "@siteimprove/alfa-refinement";
import { test } from "@siteimprove/alfa-test";

import { Element, Node, Query, h } from "../../../dist/index.js";

const { and, tee } = Refinement;
const { getDescendants, getElementDescendants, getTextDescendants } = Query;

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

const startsGroup = and(
  Element.isElement,
  Element.hasName("h1", "h2", "h3", "h4", "h5", "h6"),
);

function getLabel(node: Node) {
  if (startsGroup(node)) {
    switch (node.name) {
      case "h1":
        return "heading1";
      case "h2":
        return "heading2";
      case "h3":
        return "heading3";
      case "h4":
        return "heading4";
      case "h5":
        return "heading5";
      case "h6":
        return "heading6";
    }
  }

  return "unknown";
}

test("#getTextDescendants() groups text by HTML heading levels", (t) => {
  const before = h.text("before");
  const heading1Text = h.text("H1");
  const heading1 = <h1>{heading1Text}</h1>;
  const text1 = h.text("text1");
  const heading2Text = h.text("H2");
  const heading2 = <h2>{heading2Text}</h2>;
  const text2 = h.text("text2");

  const items = getTextDescendants({ startsGroup, getLabel })(
    h.document([
      <div>
        {before}
        {heading1}
        {text1}
        {heading2}
        {text2}
      </div>,
    ]),
  );

  t.deepEqual(items.toJSON(), [
    before.toJSON(),
    { label: "heading1", text: [heading1Text.toJSON()] },
    text1.toJSON(),
    { label: "heading2", text: [heading2Text.toJSON()] },
    text2.toJSON(),
  ]);
});
