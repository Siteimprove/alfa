import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { getRole } from "../../src/get-role";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */
test("Returns the semantic role of an area that has an href attribute", t => {
  const area = <area href="foo">Foo</area>;
  t.equal(getRole(area, area), Roles.Link);
});

test("Returns null when an area has no href attribute", t => {
  const area = <area>Foo</area>;
  t.equal(getRole(area, area), null);
});
