import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Area } from "../../../src/features/html/area";
import * as Roles from "../../../src/roles";

const device = Device.getDefaultDevice();

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
