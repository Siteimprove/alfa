import { test } from "@siteimprove/alfa-test";
import { jsx } from "../jsx";
import { getClosest } from "../src/get-closest";
import { isElement } from "../src/guards";
import { hasAttribute } from "../src/has-attribute";

test("Gets closest parent with class=foo using string query", t => {
  const span = <span />;
  const div = <div class="foo">{span}</div>;
  t.equal(getClosest(span, div, ".foo"), div);
});

test("Gets closest parent with aria-label attribute using predicate query", t => {
  const span = <span />;
  const div = (
    <div aria-label="foo">
      <div class="bar">{span}</div>
    </div>
  );
  t.equal(
    getClosest(
      span,
      div,
      node => isElement(node) && hasAttribute(node, "aria-label")
    ),
    div
  );
});

test("Returns null when no parent matches query", t => {
  const span = <span />;
  t.equal(
    getClosest(
      span,
      span,
      node => isElement(node) && hasAttribute(node, "aria-label")
    ),
    null
  );
});
