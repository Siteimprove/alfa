import { jsx } from "@siteimprove/alfa-jsx";
import { test } from "@siteimprove/alfa-test";
import { Li } from "../../src/features/li";
import * as Roles from "../../src/roles";

/**
 * @see https://www.w3.org/TR/html-aria/#li
 */

test("Returns the semantic role of a list item whose parent is an ordered list", t => {
  const li = <li />;
  const ol = <ol>{li}</ol>;
  t.equal(Li.role!(li, ol), Roles.ListItem, "List item role is not ListItem");
});

test("Returns the semantic role of a list item whose parent is an unordered list", t => {
  const li = <li />;
  const ul = <ul>{li}</ul>;
  t.equal(Li.role!(li, ul), Roles.ListItem, "List item role is not ListItem");
});

test("Returns the allowed roles of a list item whose parent is an ordered list", t => {
  const li = <li />;
  const ol = <ol>{li}</ol>;
  t.deepEqual(
    Li.allowedRoles(li, ol),
    [
      Roles.MenuItem,
      Roles.MenuItemCheckbox,
      Roles.MenuItemRadio,
      Roles.Option,
      Roles.None,
      Roles.Presentation,
      Roles.Radio,
      Roles.Separator,
      Roles.Tab,
      Roles.TreeItem
    ],
    "List allowed roles are incorrect"
  );
});

test("Returns the allowed roles of a list item whose parent is an unordered list", t => {
  const li = <li />;
  const ul = <ul>{li}</ul>;
  t.deepEqual(
    Li.allowedRoles(li, ul),
    [
      Roles.MenuItem,
      Roles.MenuItemCheckbox,
      Roles.MenuItemRadio,
      Roles.Option,
      Roles.None,
      Roles.Presentation,
      Roles.Radio,
      Roles.Separator,
      Roles.Tab,
      Roles.TreeItem
    ],
    "List allowed roles are incorrect"
  );
});
