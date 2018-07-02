import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Area } from "../../src/features/area";

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */
test("Returns the semantic role of an area that has an href attribute", t => {
  const area = <area href="foo">Foo</area>;
  t.equal(Area.role!(area, area), Roles.Link, "Area role is not Link");
});

test("Returns null when an area has no href attribute", t => {
  const area = <area>Foo</area>;
  t.equal(Area.role!(area, area), null, "Area role is not null");
});
