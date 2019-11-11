import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { getClosest } from "../src/get-closest";
import { isElement } from "../src/guards";
import { hasAttribute } from "../src/has-attribute";

test("getClosest() gets the closest element that matches a selector", t => {
  const span = <span />;
  const div = <div class="foo">{span}</div>;

  t.deepEqual(getClosest(span, div, ".foo"), Some.of(div));
});

test("getClosest() gets the closest element that matches a predicate", t => {
  const span = <span />;
  const div = (
    <div aria-label="foo">
      <div class="bar">{span}</div>
    </div>
  );

  t.deepEqual(
    getClosest(
      span,
      div,
      Predicate.and(isElement, element =>
        hasAttribute(element, div, "aria-label")
      )
    ),
    Some.of(div)
  );
});

test("getClosest() returns none when no element is found", t => {
  const span = <span />;

  t.equal(
    getClosest(
      span,
      span,
      Predicate.and(isElement, element =>
        hasAttribute(element, span, "aria-label")
      )
    ),
    None
  );
});
