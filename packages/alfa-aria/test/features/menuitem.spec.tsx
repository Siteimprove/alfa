import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { MenuItem } from "../../src/features/menu-item";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#menuitem
 */

test("Returns the semantic role of a menuitem with type command", t => {
  const menuitem = <menuitem type="command" />;
  t.equal(
    MenuItem.role!(menuitem, menuitem),
    Roles.MenuItem,
    "Menuitem role is not MenuItem"
  );
});

test("Returns the semantic role of a menuitem with type checkbox", t => {
  const menuitem = <menuitem type="checkbox" />;
  t.equal(
    MenuItem.role!(menuitem, menuitem),
    Roles.MenuItemCheckbox,
    "Checkbox role is not MenuItemCheckbox"
  );
});

test("Returns the semantic role of a menuitem with type radio", t => {
  const menuitem = <menuitem type="radio" />;
  t.equal(
    MenuItem.role!(menuitem, menuitem),
    Roles.MenuItemRadio,
    "Checkbox role is not MenuItemRadio"
  );
});
