import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import * as Roles from "../../src/roles";
import { Menu } from "../../src/features/menu";

/**
 * @see https://www.w3.org/TR/html-aria/#menu
 */

test("Returns the semantic role of a menu with type context", t => {
  const menu = <menu type="context" />;
  t.equal(Menu.role!(menu, menu), Roles.Menu, "Menu role is not Menu");
});

test("Returns no role if a menu does not have type context", t => {
  const menu = <menu />;
  t.equal(Menu.role!(menu, menu), null, "Menu role is not null");
});
