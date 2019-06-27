import { getDefaultDevice } from "@siteimprove/alfa-device";
import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Area } from "../../../src/features/html/area";
import * as Roles from "../../../src/roles";

const device = getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#areahref
 */

test("Returns the semantic role of an area that has an href attribute", t => {
  const area = <area href="foo">Foo</area>;
  t.equal(Area.role!(area, area, device), Roles.Link);
});

test("Returns no role when an area has no href attribute", t => {
  const area = <area>Foo</area>;
  t.equal(Area.role!(area, area, device), null);
});
