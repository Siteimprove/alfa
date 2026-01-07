import { test } from "@siteimprove/alfa-test";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element, h, Node, Query } from "../../../dist/index.js";

const { and } = Refinement;

const { getGroupedText } = Query;

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

test("#getGroupedText() groups text by HTML heading levels", (t) => {
  const before = h.text("before");
  const heading1Text = h.text("H1");
  const heading1 = <h1>{heading1Text}</h1>;
  const text1 = h.text("text1");
  const heading2Text = h.text("H2");
  const heading2 = <h2>{heading2Text}</h2>;
  const text2 = h.text("text2");

  const items = getGroupedText(
    startsGroup,
    getLabel,
  )(
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
    { label: "heading1", text: [heading1Text.toJSON(), text1.toJSON()] },
    { label: "heading2", text: [heading2Text.toJSON(), text2.toJSON()] },
  ]);
});
