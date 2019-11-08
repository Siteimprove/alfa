import { jsx } from "@siteimprove/alfa-dom/jsx";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Menu } from "../../../src/features/html/menu";
import * as Roles from "../../../src/roles";

const device = Device.getDefaultDevice();

/**
 * @see https://www.w3.org/TR/html-aria/#menu
 */

test("Returns the semantic role of a menu with type context", t => {
  const menu = <menu type="context" />;
  t.equal(Menu.role!(menu, menu, device), Roles.Menu);
});

test("Returns no role if a menu does not have type context", t => {
  const menu = <menu />;
  t.equal(Menu.role!(menu, menu, device), null);
});
