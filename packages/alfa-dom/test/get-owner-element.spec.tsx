import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { None, Some } from "@siteimprove/alfa-option";
import { getOwnerElement } from "../src/get-owner-element";

const p = <p title="foo" />;
const title = p.attributes[0];

test("getOwnerElement() gets the owner element of an attribute", t => {
  t.deepEqual(getOwnerElement(title, p), Some.of(p));
});

test("getOwnerElement() returns none when an attribute has no owner in a context", t => {
  t.equal(getOwnerElement(title, <div />), None);
});
