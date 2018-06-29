import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ahref
 */
test("Returns the semantic role of an anchor that has an href attribute", t => {
  const a = <a href="foo">Foo</a>;
  t.equal(getRole(a, a), Roles.Link);
});

/**
 * @see https://www.w3.org/TR/html-aria/#anohref
 */
test("Returns null when an anchor has no href attribute", t => {
  const a = <a>Foo</a>;
  t.equal(getRole(a, a), null);
});
